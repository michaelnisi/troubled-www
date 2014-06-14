
// troubled - publish http://troubled.pro

module.exports.start = start

var Reader = require('fstream').Reader
  , assert = require('assert')
  , blake = require('blake')
  , child_process = require('child_process')
  , cop = require('cop')
  , copy = require('blake/lib/copy')
  , gitstat = require('gitstat')
  , path = require('path')
  , pushup = require('pushup')
  , stream = require('stream')
  , util = require('util')
  ;

function msg (str) {
  return 'trb ' + str + '\n'
}

// Pull latest, generate all, and upload to S3.

function Publisher (opts) {
  if (!(this instanceof Publisher)) return new Publisher(opts)
  stream.Readable.call(this)
  util._extend(this, opts)
  this.state = this.pull
  this.push(msg('pull'))
}
util.inherits(Publisher, stream.Readable)

Publisher.prototype._read = function (size) {
  this.state(size)
}

function ok (er) {
  assert(!er, er ? er.message : undefined)
}


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
    ;
  child_process.exec(cmd, o, function (er, stdout, stderr) {
    ok(er)
    me.state = me.copyResources
    me.push(stdout)
    me.push(msg('copy resources'))
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

function copyResources (source, target) {
  return copy(path.join(source, 'resources'), target)
}

Publisher.prototype.copyResources = function (size) {
  var reader = this.reader
  if (!reader) {
    reader = copyResources(this.source, this.target)
    read(this, reader, this.generate, msg('generate'), size)
  }
  this.reader = reader
}

function generate (source, target, files) {
  files = files || new Reader({ path:path.join(source, 'data') })
    .pipe(cop('path'))

  return files
    .pipe(blake(source, target))
    .pipe(cop(function (s) { return s += '\n' }))
}

function files (paths) {
  var files = stream.Readable()
  files._read = function () {
    files.push(paths.shift())
  }
  return files
}

Publisher.prototype.generate = function (size) {
  var reader = this.reader
  if (!reader) {
    reader = generate(this.source, this.target)
    read(this, reader, this.pushup, msg('pushup'), size)
  }
  this.reader = reader
}

Publisher.prototype.commit = function (size) {
  var reader = this.reader
  if (!reader) {
    var cmd = 'git commit -a -m "trouble ahoy!"'
      , o = psopts(this.target)
      , me = this
      ;
    child_process.exec(cmd, o, function (er, stdout, stderr) {
      if (er) me.push(er.message)
      me.push(stdout)
      if (stderr) me.push(stderr)
      me.state = me.end
      me.push(msg('end'))
      me.reader = false
    })
    this.reader = true
  }
}

function hourly () {
  return ['.xml', 'tweet.html', 'likes.html']
}

function monthly () {
  return ['.html', '.css', '.js', '.jpg', '.png', '.svg', '.txt', '.ico']
}

function ttl () {
  var ages = Object.create(null)
    , hour = 3600
    ;
  monthly().forEach(function (type) {
    ages[type] = 24 * hour * 30
  })
  hourly().forEach(function (type) {
    ages[type] = hour
  })
  return ages
}

function push (dir) {
  return gitstat(dir, 'AM')
    .pipe(pushup({ gzip:true, ttl:ttl(), root:opts().target }))
}

Publisher.prototype.pushup = function (size) {
  var reader = this.reader
  if (!reader) {
    var cmd = 'git add --all'
      , o = psopts(this.target)
      , me = this
      ;
    child_process.exec(cmd, o, function (er, stdout, stderr) {
      ok(er)
      var reader = push(me.target)
      read(me, reader, me.commit, msg('commit'), size)
      me.reader = reader
    })
    this.reader = true
  }
}

Publisher.prototype.end = function (size) {
  this.push('ok\n')
  this.push(null)
  this.state = null // I'm done
}

// Update tweet and likes, and upload to S3.

function Updater (opts) {
  if (!(this instanceof Updater)) return new Updater(opts)
  stream.Readable.call(this)
  util._extend(this, opts)
  this.state = this.update
  this.push(msg('update'))
}
util.inherits(Updater, stream.Readable)


Updater.prototype.update = function (size) {
  var reader = this.reader
  if (!reader) {
    var paths = [this.tweet, this.likes]
    reader = generate(this.source, this.target, files(paths))
    read(this, reader, this.pushup, msg('pushup'), size)
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
  _router.addRoute('/', notfound)
  return _router
}

function start (port) {
  port = port || opts().port
  var http = require('http')
    , url = require('url')
    , r = router()
    ;
  http.createServer(function (req, res) {
    r.match(url.parse(req.url).pathname).fn(req, res)
  }).listen(port)
}
