
// config - configure services

var resolve = require('path').resolve
  , url = require('url')
  , fs = require('fs')
  , env = process.env
  , source = env.TROUBLED_SOURCE
  , target = env.TROUBLED_TARGET

console.log(env)

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

exports.tweet = resolve(source, 'data', 'tweet.json')
exports.likes = resolve(source, 'data', 'likes.json')

var ip = 'http://127.0.0.1', p = 8081
exports.publish = url.parse(env.TROUBLED_PUBLISH_URL || [ip,p++].join(':'))
exports.upload = url.parse(env.TROUBLED_UPLOAD_URL || [ip,p++].join(':'))
exports.update = url.parse(env.TROUBLED_UPDATE_URL || [ip,p++].join(':'))

if (module === require.main) {
  console.log(exports)
  process.exit(0)
}
