
// troubled - publish http://troubled.pro

module.exports.start = start

var util = require('util')
  , stream = require('stream')

// Pull latest, generate all, and upload to S3.

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

var assert = require('assert')

function ok (er) {
  assert(!er, er ? er.message : undefined)
}

var child_process = require('child_process')

function psopts (cwd) {
  return {
    cwd:cwd
  , env:process.env
  }
}

var StringDecoder = require('string_decoder').StringDecoder
  , path = require('path')

function pulled (buf) {
  var files = [], ext
  new StringDecoder()
    .write(buf)
    .split('\n')
    .forEach(function (line) {
      ext = path.extname(line)
      if (ext) {
        if (ext !== '.md') return '*'
        files.push(line)
      }
    })
  return files
}

Publisher.prototype.pull = function (size) {
  var me = this
    , cmd = 'git pull'
    , o = psopts(this.source)

  child_process.exec(cmd, o, function (er, stdout, stderr) {
    ok(er)
    me.files = pulled(stdout)
    if (true) {
      console.log(me.files)
      me.state = me.end
      me.push(stdout)
    } else {
      me.state = me.copyResources
      me.push(stdout)
      me.push('*** copy resources\n')
    }
  })
}

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

function generate (source, target, files) {
  files = files || new Reader({ path:path.join(source, 'data') })
    .pipe(cop('path'))

  return files
    .pipe(blake(source, target))
    .pipe(cop(function (s) { return s += '\n' }))
}

function files (paths) {
  if (paths.length < 1) return null
  var files = stream.Readable()
  files._read = function () {
    files.push(paths.shift())
  }
  return files
}

Publisher.prototype.generate = function (size) {
  var reader = this.reader
  if (!reader) {
    reader = generate(this.source, this.target, files(this.files))
    read(this, reader, this.pushup, '*** pushup\n', size)
  }
  this.reader = reader
}

Publisher.prototype.commit = function (size) {
  var reader = this.reader
  if (!reader) {
    var cmd = 'git commit -a -m "trouble ahoy!"'
      , o = psopts(this.target)
      , me = this
    child_process.exec(cmd, o, function (er, stdout, stderr) {
      me.push(stdout)
      me.state = me.end
      me.push('*** end\n')
      me.reader = false
    })
    this.reader = true
  }
}

var pushup = require('pushup')
  , gitstat = require('gitstat')

function push (dir) {
  process.chdir(dir)
  return gitstat(dir, 'AM')
    .pipe(pushup())
}

Publisher.prototype.pushup = function (size) {
  var reader = this.reader
  if (!reader) {
    var cmd = 'git add --all'
      , o = psopts(this.target)
      , me = this

    child_process.exec(cmd, o, function (er, stdout, stderr) {
      ok(er)
      var reader = push(me.target)
      read(me, reader, me.commit, '*** commit\n', size)
      me.reader = reader
    })
    this.reader = true
  }
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


Updater.prototype.update = function (size) {
  var reader = this.reader
  if (!reader) {
    var paths = [this.tweet, this.likes]
    reader = generate(this.source, this.target, files(paths))
    read(this, reader, this.pushup, '*** pushup\n', size)
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
