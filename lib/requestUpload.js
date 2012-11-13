
// requestUpload - request upload to S3

var url = require('url')
  , querystring = require('querystring')
  , request = require('request')
  , config = require('../config.js')

module.exports = function (message) {
  var upload = config.urls.upload

  upload.query = querystring.stringify({ message: message })

  var uri = url.format(upload)

  return request.post(uri)
}
