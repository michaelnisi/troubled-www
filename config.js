
// config - configure services

var resolve = require('path').resolve
  , url = require('url')
  , source = '/Users/michael/Workspace/troubled'
  , target = process.env.TROUBLED_TARGET
  , urls = Object.create(null)

urls.publish = url.parse('http://localhost:8081')
urls.upload  = url.parse('http://localhost:8082')
urls.update  = url.parse('http://localhost:8083')

exports.urls = urls
exports.source = source
exports.target = target
exports.delay = 3600000
exports.tweet = resolve(source, 'data', 'tweet.json')
exports.likes = resolve(source, 'data', 'likes.json')

if (module === require.main) {
  console.log(exports)
  process.exit(0)
}
