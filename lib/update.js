
// update - update (and upload) latest tweet and likes

var blake = require('blake')
  , http = require('http')
  , config = require('../config.js')
  , Transform = require('stream').Transform
  , Readable = require('stream').Readable
  , readArray = require('event-stream').readArray
  , filenames = [config.likes, config.tweet]
  , source = config.source
  , target = config.target

module.exports = function (req, res) {
  var stream = new Readable()
    , generator = blake(source, target)

  stream._read = function () {
    generator.on('readable', function () {
      var chunk = generator.read()
      if (chunk) {
        stream.push(chunk + '\n')
      } else {
        http.get(config.upload, function (res) {
          res.on('readable', function () {
            stream.push(res.read())
          })
        })
      }
    })
  }

  readArray(filenames)
    .pipe(generator)

  stream.pipe(res)
}
