
// update - update latest tweet and likes

var blake = require('blake')
  , cop = require('cop')
  , config = require('../config.js')
  , readArray = require('event-stream').readArray
  , requestUpload = require('../lib/requestUpload.js')
  , filenames = [config.likes, config.tweet]
  , source = config.source
  , target = config.target

module.exports = function (req, res) {
  readArray(filenames)
    .pipe(blake(source, target))
    .on('end', function () {
      requestUpload('Update tweet and likes')
        .on('error', console.error)
        .pipe(process.stdout)
    })
}
