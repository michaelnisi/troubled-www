
// validate - validate request

var config = require('../config.js')
  , querystring = require('querystring')

module.exports = function (req, callback) {
  if (!config.validate) {
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

  req.on('end', function (chunk) {
    data += chunk

    if (!isGitHub(req.connection.remoteAddress)) {
      callback(new Error('Invalid Remote Address'))
      return
    }

    if (!data) {
      callback(new Error('No Data Received'))
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

function isGitHub (address) {
  return config.github.some(function (a) {
    return address === a
  })
}
