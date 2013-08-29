
// publish - publish site

var http = require('http')
  , blake = require('blake')
  , copy = require('blake/lib/copy')
  , gitgo = require('gitgo')
  , join = require('path').join
  , Reader = require('fstream').Reader
  , cop = require('cop')
  , pipe = require('./pipe.js')
  , config = require('../config.js')
  , source = config.source
  , target = config.target

module.exports = function (req, res) {
  function pull (cb) {
    pipe(gitgo(source, ['pull']), res, cb)
  }

  function copyResources (cb) {
    pipe(copy(join(source, 'resources'), target), res, cb)
  }

  function generate (cb) {
    pipe(new Reader({ path:join(source, 'data') })
      .pipe(cop('path'))
      .pipe(blake(source, target))
      .pipe(cop(function (s) { return s += '\n' }))
    , res
    , cb)
  }

  function upload (cb) {
    http.get(config.upload, function (res2) {
      pipe(res2, res, cb)
    }).on('error', function (er) {
      res.write('ERR! service unavailable\n')
      cb()
    })
  }

  function end () {
    res.end()
  }

  var queue = [pull, copyResources, generate, upload,  end]
  function next () {
    var fun = queue.shift()
    if (fun) fun(next)
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' })
  next()
}
