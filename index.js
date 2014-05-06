
// troubled - publish http://troubled.pro

module.exports.start = start

// Pull latest, generate all, and upload to S3.

var util = require('util')
  , stream = require('stream')

function Publisher (opts) {
  if (!(this instanceof Publisher)) return new Publisher(opts)
  stream.Readable.call(this)
  util._extend(this, opts)
  this.state = this.pull
  this.push('*** pull\n')
}
util.inherits(Publisher, stream.Readable)

Publisher.prototype._read = function (size) {
  this.state(size)
}

var child_process = require('child_process')

function psopts (cwd) {
  return {
    cwd:cwd
  , env:process.env
  }
}

Publisher.prototype.pull = function (size) {
  var me = this
    , cmd = 'git pull'
    , o = psopts(this.source)

  child_process.exec(cmd, o, function (er, stdout, stderr) {
    me.state = me.copyResources
    me.push(stdout)
    me.push('*** copy resources\n')
  })
}

var assert = require('assert')

function read (me, reader, next, msg, size) {
  reader.on('readable', function () {
    var chunk = reader.read(size)
    if (chunk !== null) assert(me.push(chunk))
  })
  reader.once('end', function () {
    reader.removeAllListeners()
    me.reader = null
    me.state = next
    me.push(msg)
  })
  return reader
}

var copy = require('blake/lib/copy')
function copyResources (source, target) {
  return copy(path.join(source, 'resources'), target)
}

Publisher.prototype.copyResources = function (size) {
  var reader = this.reader
  if (!reader) {
    reader = copyResources(this.source, this.target)
    read(this, reader, this.generate, '*** generate\n', size)
  }
  this.reader = reader
}

var blake = require('blake')
  , Reader = require('fstream').Reader
  , cop = require('cop')
  , path = require('path')

function generate (source, target, files) {
  files = files || new Reader({ path:path.join(source, 'data') })
    .pipe(cop('path'))

  return files
    .pipe(blake(source, target))
    .pipe(cop(function (s) { return s += '\n' }))
}

Publisher.prototype.generate = function (size) {
  var reader = this.reader
  if (!reader) {
    reader = generate(this.source, this.target)
    read(this, reader, this.commit, '*** commit\n', size)
  }
  this.reader = reader
}

Publisher.prototype.commit = function (size) {
  var cmd = 'git add . ; git commit -a -m "troubled"'
    , o = psopts(this.target)
    , me = this

  child_process.exec(cmd, o, function (er, stdout, stderr) {
    me.push(stdout)
    me.state = me.pushup
    me.push('*** pushup\n')
  })
}

var showf = require('showf')
function diff (dir) {
  return showf(dir)
}

var pushup = require('pushup')
function push (dir) {
  process.chdir(dir) // TODO: Terrible! Remove this
  return diff(dir)
    .pipe(pushup())
}

Publisher.prototype.pushup = function (size) {
  var reader = this.reader
  if (!reader) {
    reader = push(this.target)
    read(this, reader, this.end, '*** end\n', size)
  }
  this.reader = reader

}

Publisher.prototype.end = function (size) {
  this.push('tchau!\n')
  this.push(null)
  this.state = null // I'm done
}

// Update tweet and likes, and upload to S3.

function Updater (opts) {
  if (!(this instanceof Updater)) return new Updater(opts)
  stream.Readable.call(this)
  util._extend(this, opts)
  this.state = this.update
  this.push('*** update\n')
}
util.inherits(Updater, stream.Readable)

function files () {
  var chunks = Array.prototype.slice.call(arguments)
  var files = stream.Readable()
  files._read = function () {
    files.push(chunks.shift())
  }
  return files
}

Updater.prototype.update = function (size) {
  var reader = this.reader
  if (!reader) {
    reader = generate(this.source, this.target, files(this.tweet, this.likes))
    read(this, reader, this.commit, '*** commit\n', size)
  }
  this.reader = reader
}

Updater.prototype._read = Publisher.prototype._read
Updater.prototype.commit = Publisher.prototype.commit
Updater.prototype.pushup = Publisher.prototype.pushup
Updater.prototype.end = Publisher.prototype.end

// HTTP API
// GET /publish
// GET /update

var _opts = require('./conf')
function opts () {
  return _opts
}

function publish (req, res) {
  Publisher(opts()).pipe(res)
}

function update (req, res) {
  Updater(opts()).pipe(res)
}

function notfound (req, res) {
  res.end('not found\n')
}

var _router = require('routes').Router()
function router () {
  _router.addRoute('/update', update)
  _router.addRoute('/publish', publish)
  _router.addRoute('/*', notfound)
  return _router
}

function start (port) {
  var http = require('http')
    , url = require('url')
    , r = router()
  http.createServer(function (req, res) {
    r.match(url.parse(req.url).pathname).fn(req, res)
  }).listen(port)
}
