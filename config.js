
// config - configure services

var resolve = require('path').resolve
  , url = require('url')
  , fs = require('fs')
  , env = process.env
  , source = env.TROUBLED_SOURCE
  , target = env.TROUBLED_TARGET

try {
  if (!source || !target ||
      !fs.statSync(source).isDirectory()
   || !fs.statSync(target).isDirectory()) {
     throw(new Error('source and target must be directories'))
  }
} catch (err) {
  console.error(err)
  return
}

exports.source = source
exports.target = target

exports.delay = 3600000
exports.tweet = resolve(source, 'data', 'tweet.json')
exports.likes = resolve(source, 'data', 'likes.json')

exports.publish = url.parse(
  env.TROUBLED_PUBLISH_URL || 'http://127.0.0.1:8081')
exports.upload  = url.parse(
  env.TROUBLED_UPLOAD_URL || 'http://127.0.0.1:8082')
exports.update  = url.parse(
  env.TROUBLED_UPDATE_URL || 'http://127.0.0.1:8083')

if (module === require.main) {
  console.log(exports)
  process.exit(0)
}
