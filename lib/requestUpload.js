
// requestUpload - request upload to S3

var url = require('url')
  , querystring = require('querystring')
  , http = require('http')
  , config = require('../config.js')

module.exports = function (message) {
  return http.request(config.upload)
}
