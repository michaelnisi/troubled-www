
// publish - publish site

var http = require('http')
  , blake = require('blake')
  , gitgo = require('gitgo')
  , querystring = require('querystring')
  , request = require('request')
  , join = require('path').join
  , Reader = require('fstream').Reader
  , cop = require('cop')
  , config = require('../config.js')

module.exports = function (req, res) {
  var message = null
    , source = config.source
    , target = config.target

  validate(req, function (err, msg) {
    message = msg

    var code = http.STATUS_CODES[202]
    res.writeHead(code)
    res.end(code + '\n')

    pull()
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
    var url = config.urls.upload

    request.post(url + '?message=' + message)
      .on('error', console.error)
      .pipe(process.stdout)
  }
}

function validate (req, callback) {
  if (process.env.NODE_ENV === 'dev') {
    callback(null, 'No Message')
    return
  }

  if (req.method !== 'POST') {
    callback(new Error('POST Expected'))
    return
  }

  var data = ''

  req.on('data', function (chunk) {
    data += chunk
  })

  req.on('end', function () {
    if (!data || !isGitHub(req.connection.remoteAddress)) {
      callback(new Error('Invalid Remote Address'))
      return
    }

    var value = querystring.parse(data).payload
    if (!value) {
      callback(new Error('Missing Parameter'))
      return
    }

    try {
      var payload = JSON.parse(unescape(value) || null)
    } catch(err) {
      callback(new Error('Could not Parse Payload'))
      return
    }

    if (!payload) {
      callback(new Error('Payload Expected'))
      return
    }

    callback(null, payload.after)
  })
}
