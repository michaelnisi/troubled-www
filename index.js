//
// troubled-www - publish and update site
//

module.exports.start = start

var assert = require('assert')
var backoff = require('backoff')
var blake = require('blake')
var child_process = require('child_process')
var cop = require('cop')
var deed = require('deed')
var fstream = require('fstream')
var gitstat = require('gitstat')
var path = require('path')
var pushup = require('pushup')
var restify = require('restify')
var stream = require('readable-stream')

var conf = require('./conf')

function verify (req, res, next) {
  req.log.info('verify')

  var secret = req.state.secret

  deed(secret, req, function deedHandler (error) {
    if (error) {
      var er = new restify.ForbiddenError(error.message)
      req.state.busy = false
      req.log.warn(er, 'not verified')
      next(er)
    } else {
      res.statusCode = 202
      res.send({ ok: true })
      next()
    }
  })
}

function done (req, res, next) {
  req.log.info('done')
  req.state.busy = false
  if (typeof next === 'function') next()
}

// Both routes of this service return early with a '202 Accepted', thus, if an
// error occurs, the next handler is not applied, because we, of course, must
// not send headers twice, it would lead to an unhandled exception crashing
// our service.
function abort (req, res, er) {
  if (er instanceof Error) {
    req.log.error(er, req.route.name)
    done(req, res, null)
    return true
  }
  return false
}

function gitError (er, stderr, req) {
  if (er instanceof Error) {
    req.log.warn(er, req.path())
    // Not sure what qualifies as proper error here.
    if (er.killed) return er
  }
  return stderr.split(' ')[0] === 'fatal:' ? new Error(stderr) : null
}

function pull (req, res, next) {
  var cmd = 'git pull'
  var source = req.state.source
  var conf = { cwd: source, env: process.env }

  req.log.info(conf.cwd, cmd)

  child_process.exec(cmd, conf, function pullHandler (er, stdout, stderr) {
    abort(req, res, gitError(er, stderr, req)) || next()
  })
}

function copyResources (req, res, next) {
  req.log.info('copy resources')

  var source = req.state.source
  var target = req.state.target
  var s = blake.copy(path.join(source, 'resources'), target)

  function onend (er) {
    s.removeAllListeners()
    abort(req, res, er) || next()
  }
  s.on('end', onend)
  s.on('error', onend)

  s.resume()
}

function generate (req, res, next) {
  var source = req.state.source
  var target = req.state.target
  var s = blake(source, target)

  var files = req.state.files || new fstream.Reader(
    { path: path.join(source, 'data') }
  ).pipe(cop('path'))

  function handler (er) {
    files.unpipe()
    files.removeAllListeners()
    s.removeAllListeners()
    abort(req, res, er) || next()
  }

  s.on('end', handler)
  s.on('error', handler)
  s.on('readable', function read () {
    var chunk
    while ((chunk = s.read()) !== null) {
      var base = path.parse(chunk).base
      req.log.info(base, 'generate')
    }
  })

  files.on('error', handler)
  files.pipe(s)
}

function commit (req, res, next) {
  var target = req.state.target
  var conf = { cwd: target, env: process.env }
  var cmd = 'git commit -a -m "Aye!"'

  req.log.info(cmd)

  child_process.exec(cmd, conf, function (er, stdout, stderr) {
    abort(req, res, gitError(er, stderr, req)) || next()
  })
}

function add (req, res, next) {
  var target = req.state.target
  var conf = { cwd: target, env: process.env }
  var cmd = 'git add --all'

  req.log.info(cmd)

  child_process.exec(cmd, conf, function (er, stdout, stderr) {
    abort(req, res, gitError(er, stderr, req)) || next()
  })
}

function ttl () {
  var l = ['.css', '.js', '.jpg', '.png', '.svg', '.txt', '.ico']
  var m = ['.xml', '.html']
  var s = ['tweet.html', 'likes.html']
  var conf = Object.create(null)
  var h = 3600
  l.forEach(function (t) { conf[t] = h * 24 * 365 })
  m.forEach(function (t) { conf[t] = h * 24 })
  s.forEach(function (t) { conf[t] = h })
  return conf
}

function bucket (req, res, next) {
  var target = req.state.target

  var s = pushup({ gzip: { '.xml': false }, ttl: ttl(), root: target })

  s.on('readable', function read () {
    var chunk
    while ((chunk = s.read()) !== null) {
      req.log.info('bucket %s', chunk)
    }
  })

  var files = gitstat(target, 'AM')

  // Making sure not to post more than necessary if we're on the update route.
  var guard = cop(function map (file) {
    if (req.route.path !== '/update') return file
    if (file === 'tweet.html' || file === 'likes.html') return file
    return null
  })

  function handler (er) {
    files.unpipe()
    files.removeAllListeners()
    guard.unpipe()
    guard.removeAllListeners()
    s.removeAllListeners()
    abort(req, res, er) || next()
  }

  s.once('end', handler)
  s.once('error', handler)

  files.once('error', handler)
  files.pipe(guard)

  guard.once('error', handler)
  guard.pipe(s)
}

function readablePaths (paths) {
  var s = stream.Readable()
  s._read = function read () { s.push(paths.shift() || null) }
  return s
}

function update (req, res, next) {
  var source = req.state.source
  var paths = [
    path.resolve(source, 'data', 'tweet.json'),
    path.resolve(source, 'data', 'likes.json')
  ]
  var files = readablePaths(paths)
  req.state.files = files
  next()
}

// HTTP Server

function State (source, target, secret, files) {
  this.source = source
  this.target = target
  this.secret = secret
  this.files = files
}

function start () {
  var server = restify.createServer({
    log: conf.log
  })

  server.on('uncaughtException', function (req, res, route, e) {
    req.log.error(e, 'uncaught exception')
    throw e
  })

  server.on('NotFound', function (req, res, er) {
    req.log.warn(er, 'not found')
    res.send(er)
  })

  server.on('MethodNotAllowed', function (req, res, er) {
    req.log.warn(er, 'method not allowed')
    res.send(er)
  })

  var busy = false
  var secret = conf.secret
  var source = conf.source
  var target = conf.target

  server.pre(function (req, res, next) {
    res.setHeader('Connection', 'close')
    return next()
  })

  server.use(function decorate (req, res, next) {
    req.log.info({ route: req.route }, 'incoming')

    var state = new State(source, target, secret)
    Object.defineProperty(state, 'busy', {
      set: function (value) { busy = value },
      get: function () { return busy }
    })
    req.state = state
    res.setHeader('Location', 'http://troubled.pro/')

    if (busy) {
      var bo = backoff.fibonacci({
        randomisationFactor: 0,
        initialDelay: 300,
        maxDelay: 3000
      })
      bo.failAfter(10)
      bo.on('backoff', function (num, delay) {
        req.log.warn({ attempt: num, delay: delay }, 'backing off')
      })
      bo.on('ready', function () {
        if (busy) {
          bo.backoff()
        } else {
          bo.removeAllListeners()
          busy = true
          next()
        }
      })
      bo.on('fail', function () {
        req.log.warn('backoff failed')
        bo.removeAllListeners()
        var er = new restify.ServiceUnavailableError('still busy')
        next(er)
      })
      bo.backoff()
    } else {
      busy = true
      next()
    }
  })

  server.post('/publish',
    verify,
    pull,
    copyResources,
    generate,
    add,
    bucket,
    commit,
    done
  )

  // TODO: Protect this route
  server.get('/update',
    verify,
    update,
    generate,
    add,
    bucket,
    commit,
    done
  )

  var port = conf.port

  server.listen(port, function (er) {
    assert.ifError(er)
    conf.log.info(
      { port: port, source: source, target: target },
      'listening'
    )
    conf = null
  })
}
