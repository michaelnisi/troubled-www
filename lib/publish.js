
// publish - publish site

var http = require('http')
  , blake = require('blake')
  , url = require('url')
  , gitgo = require('gitgo')
  , request = require('request')
  , join = require('path').join
  , Reader = require('fstream').Reader
  , cop = require('cop')
  , config = require('../config.js')
  , validate = require('./validate.js')

module.exports = function (req, res) {
  var message = null
    , source = config.source
    , target = config.target

  validate(req, function (err, msg) {
    message = msg

    var code = http.STATUS_CODES[202]
    res.writeHead(code)
    res.end(code + '\n')

    if (!err) pull()
  })

  function pull () {
    gitgo(source, ['pull'])
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
    var upload = config.urls.upload

    upload.query = querystring.stringify({ message: message })

    var uri = url.format(upload)

    request.post(uri)
      .on('error', console.error)
      .pipe(process.stdout)
  }
}
