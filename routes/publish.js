module.exports = publish

var config = require('../config.js')
  , blake = require('blake')
  , http = require('http')
  , pull = require('../pull.js')

function publish (req, res) {
  validate(req, function (isValid) {
    var code

    if (!isValid) {
      code = http.STATUS_CODES[400]
      res.writeHead(code)
      return res.end(code + '\n')
    }

    var source = config.source
      , target = config.target

    pull(source, function (err) {
      if (err) {
        console.error(err)
        code = http.STATUS_CODES[500]
        res.writeHead(code)
        return res.end(code + '\n')
      }

      blake(source, target, function (err) {
        code = http.STATUS_CODES[204]
        if (err) {
          console.error(err)
          code = http.STATUS_CODES[500]
        }
        res.writeHead(code)
        res.end(code + '\n')
      })
    })
  })
}

function isGitHub (address) {
  return config.github.some(function (a) {
    address === a
  })
}

function validate (req, callback) {
  if (req.method != 'POST') return callback(false)
 
  var data = ''

  req.on('data', function (chunk) {
    data += chunk
  })

  req.on('end', function () {
    if (!data || !isGitHub(req.connection.remoteAddress)) {
      return callback(false)
    } 

    var value = data.split('payload=')[1]
    if (!value) {
      return callback(false)
    }

    try {
      var payload = JSON.parse(unescape(value) || null)
    } catch(err) {
      return callback(false)
    }

    if (!payload) {
      return callback(false)
    }

    callback(true)
  })
}






