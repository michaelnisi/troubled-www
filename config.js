var resolve = require('path').resolve
  , config = require('./config.' + process.env.NODE_ENV)

exports.source = config.source
exports.target = config.target

exports.port = config.port
exports.ports = config.ports // workers

exports.hook = config.hook
exports.publisher = config.publisher

exports.delay = 3600000
exports.tweet = resolve(config.source, 'data', 'tweet.json')
exports.likes = resolve(config.source, 'data', 'likes.json')

exports.github = [
  '207.97.227.253'
, '50.57.128.197'
, '108.171.174.178'
]

if (module === require.main) {
  console.log(exports)
  process.exit(0)
}
