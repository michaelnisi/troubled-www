
// publish - publish site

var http = require('http')
  , blake = require('blake')
  , Readable = require('stream').Readable
  , url = require('url')
  , copy = require('blake/lib/copy')
  , gitgo = require('gitgo')
  , request = require('request')
  , join = require('path').join
  , querystring = require('querystring')
  , Reader = require('fstream').Reader
  , cop = require('cop')
  , config = require('../config.js')
  , source = config.source
  , target = config.target

module.exports = function (req, res) {
  var stream = new Readable()
    , funs = [pull]

  stream._read = function (size) {
    next()
  }

  stream.pipe(res)

  function pull () {
    gitgo(source, ['pull'])
      .pipe(stream, { end: false })
      .on('end', next)
  }

  function copyResources () {
    copy(join(source, 'resources'), target)
      .pipe(stream, { end: false })
      .on('end', next)
  }

  function generate () {
    var props = { path:join(source, 'data') }
      , reader = new Reader(props)

    reader
      .pipe(cop('path'))
      .pipe(blake(source, target))
      .pipe(cop(function (filename) { return filename + '\n' }))
      .pipe(stream, { end: false })
      .on('end', next)
  }

  function upload () {
    var req = http.get(config.upload, function (res) {
      res.pipe(stream)
    }
  }

  function next () {
    var fun = funs.shift()
    if (fun) fun()
  }
}
