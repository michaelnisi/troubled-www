
if (!process.env.NODE_ENV) {
  console.warn('NODE_ENV not set, assuming production.')
  process.env.NODE_ENV = 'production'
}

var resolve = require('path').resolve
  , config = require('./config.' + process.env.NODE_ENV)
  , source = config.source
  , target = config.target
  , urls = Object.create(null)

exports.env = process.env.NODE_ENV
exports.source = source
exports.target = target

urls.publish = { port: 8081 }
urls.upload  = { port: 8082 }
urls.update  = { port: 8083 }

var url = null
Object.keys(urls).forEach(function (key) {
  url = urls[key]
  url.protocol = 'http'
  url.hostname = 'localhost'
})
exports.urls = config.urls || urls

exports.delay = config.delay || 3600000
exports.tweet = resolve(source, 'data', 'tweet.json')
exports.likes = resolve(source, 'data', 'likes.json')

if (module === require.main) {
  console.log(exports)
  process.exit(0)
}
