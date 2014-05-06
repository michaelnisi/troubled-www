
// config - configure troubled-www

var path = require('path')
  , fs = require('fs')
  , assert = require('assert')

var env = process.env
  , source = env.TROUBLED_SOURCE
  , target = env.TROUBLED_TARGET

try {
  [source, target].forEach(function (dir) {
     assert(fs.statSync(dir).isDirectory())
  })
} catch (er) {
  console.error(er)
  throw(new Error('source and target must be directories'))
}

exports.source = source
exports.target = target

exports.tweet = path.resolve(source, 'data', 'tweet.json')
exports.likes = path.resolve(source, 'data', 'likes.json')

if (module === require.main) {
  console.log(exports)
  process.exit(0)
}
