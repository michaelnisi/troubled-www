
// config - configure services

var resolve = require('path').resolve
  , url = require('url')
  , fs = require('fs')
  , source = process.env.TROUBLED_SOURCE
  , target = process.env.TROUBLED_TARGET

fs.statSync(source)
fs.statSync(target)

exports.source = source
exports.target = target
exports.delay = 3600000
exports.tweet = resolve(source, 'data', 'tweet.json')
exports.likes = resolve(source, 'data', 'likes.json')

exports.publish = url.parse('http://localhost:8081')
exports.upload  = url.parse('http://localhost:8082')
exports.update  = url.parse('http://localhost:8083')

if (module === require.main) {
  console.log(exports)
  process.exit(0)
}
