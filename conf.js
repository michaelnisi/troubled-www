// config - configure this server

var assert = require('assert')
var bunyan = require('bunyan')
var fs = require('fs')

var env = process.env

var vars = [
  'TROUBLED_SOURCE',
  'TROUBLED_TARGET',
  'TROUBLED_SECRET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'S3_BUCKET',
  'S3_REGION',
  'S3_ENDPOINT',
  'CONSUMER_KEY',
  'CONSUMER_SECRET',
  'ACCESS_TOKEN',
  'ACCESS_TOKEN_SECRET'
]
vars.forEach(function (v) {
  assert(env.hasOwnProperty(v), v + ' not exported')
})
vars = null

var source = env.TROUBLED_SOURCE
var target = env.TROUBLED_TARGET

assert(fs.statSync(source).isDirectory())
assert(fs.statSync(target).isDirectory())

exports.source = source
exports.target = target

exports.port = env.TROUBLED_PORT || 8443
exports.secret = env.TROUBLED_SECRET

// No need for sparse logging in this low traffic service.
function log () {
  return bunyan.createLogger({
    name: 'troubled',
    level: 'info'
  })
}

exports.log = log()

if (module === require.main) {
  console.log(exports)
  process.exit(0)
}
