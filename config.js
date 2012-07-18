var resolve = require('path').resolve
  , config = require('./config.dev')
  , source = '/Users/michael/workspace/michaelnisi'

exports.source = config.source
exports.target = config.target

exports.ports = [
  '127.0.0.1:8080'
, '127.0.0.1:8081'
, '127.0.0.1:8082'
]

exports.delay = 3600000
exports.tweet = resolve(source, 'data', 'tweet.json')
exports.likes = resolve(source, 'data', 'likes.json')

if (module === require.main) {
  console.log(exports)
  process.exit(0)
}
