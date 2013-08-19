
// update - update latest tweet and likes

var blake = require('blake')
  , http = require('http')
  , cop = require('cop')
  , config = require('../config.js')
  , readArray = require('event-stream').readArray
  , filenames = [config.likes, config.tweet]
  , source = config.source
  , target = config.target

module.exports = function (req, res) {
  readArray(filenames)
    .pipe(blake(source, target))
    .on('finish', function () {
      http.request(config.upload)
        .on('error', console.error)
        .pipe(res)
    })
}
