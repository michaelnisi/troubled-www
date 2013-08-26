
// publish - publish site

var http = require('http')
  , blake = require('blake')
  , url = require('url')
  , copy = require('blake/lib/copy')
  , gitgo = require('gitgo')
  , request = require('request')
  , join = require('path').join
  , querystring = require('querystring')
  , Reader = require('fstream').Reader
  , cop = require('cop')
  , config = require('../config.js')
  , requestUpload = require('./requestUpload.js')

module.exports = function (req, res) {
  var message = Date.now()
    , source = config.source
    , target = config.target
    , code = http.STATUS_CODES[202]

  res.writeHead(code)
  res.end(code + '\n')

  pull()

  function pull () {
    gitgo(source, ['pull'])
      .on('error', console.error)
      .on('end', copyResources)
      .pipe(process.stdout)
  }

  function copyResources () {
    copy(join(source, 'resources'), target)
      .on('error', console.error)
      .on('end', generate)
      .pipe(process.stdout)
  }

  function generate () {
    var props = { path:join(source, 'data') }
      , reader = new Reader(props)

    reader
      .pipe(cop('path'))
      .pipe(blake(source, target))
      .on('error', console.error)
      .on('end', upload)
      .pipe(cop(function (filename) { return filename + '\n' }))
      .pipe(process.stdout)
  }

  function upload () {
    http.get(config.upload)
      .on('error', console.error)
  }
}
