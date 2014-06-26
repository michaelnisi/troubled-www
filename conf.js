
// config - configure troubled-www

var assert = require('assert')
  , bunyan = require('bunyan')
  , fs = require('fs')
  , path = require('path')
  ;

var env = process.env
  , source = env.TROUBLED_SOURCE
  , target = env.TROUBLED_TARGET
  ;

try {
  [source, target].forEach(function (dir) {
     assert(fs.statSync(dir).isDirectory())
  })
} catch (er) {
  throw(new Error('source and target must be directories'))
}

exports.source = source
exports.target = target

exports.tweet = path.resolve(source, 'data', 'tweet.json')
exports.likes = path.resolve(source, 'data', 'likes.json')

function p () {
  return env.NODE_ENV === 'production'
}

exports.port = env.TROUBLED_PORT || (p() ? 80 : 8080)
exports.secret = env.TROUBLED_SECRET

function log() {
  return bunyan.createLogger({
    name: 'publisher'
  , level: 'info'
  })
}

exports.log = log()

if (module === require.main) {
  console.log(exports)
  process.exit(0)
}
