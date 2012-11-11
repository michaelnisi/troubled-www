
if (!process.env.NODE_ENV) {
  console.warn('NODE_ENV not set, assuming production.')  
  process.env.NODE_ENV = 'production'
}

var resolve = require('path').resolve
  , config = require('./config.' + process.env.NODE_ENV)
  , source = config.source
  , target = config.target

exports.source = source
exports.target = target

exports.urls = config.urls

exports.delay = config.delay || 3600000
exports.tweet = resolve(source, 'data', 'tweet.json')
exports.likes = resolve(source, 'data', 'likes.json')

exports.github = [
  '207.97.227.253'
, '50.57.128.197'
, '108.171.174.178'
]

if (module === require.main) {
  console.log(exports)
  process.exit(0)
}
