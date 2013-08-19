
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
  var code = http.STATUS_CODES[202]

  res.writeHead(code)
  res.end(code + '\n')

  readArray(filenames)
    .pipe(blake(source, target))
    .on('finish', function () {
      http.get(config.upload)
        .on('error', console.error)
    })
}
