
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
    , started = false

  stream._read = function () {
    if (started) return // lord, have mercy
    started = true
    readArray(filenames).pipe(generator)
  }

  generator.on('readable', function () {
    var str = null, ok = true
    while (ok && null !== (str = generator.read())) {
      ok = stream.push(str + '\n')
    }
  })

  generator.on('end', function () {
    upload(stream).on('error', function (er) {
      stream.push('service unavailable\n')
      stream.push(null)
    })
    generator.removeAllListeners()
  })

  stream.pipe(res)
}

function upload (stream) {
  return http.get(config.upload, function (res) {
    res.on('readable', function () {
      var chunk = null, ok = true
      while (ok && null !== (chunk = res.read())) {
        ok = stream.push(chunk)
      }
    })
    res.on('end', function () {
      res.removeAllListeners()
      stream.push(null)
    })
  })
}
