
var test = require('tap').test
  , validate = require('../lib/validate.js')
  , IncomingMessage = require('http').IncomingMessage
  , config = require('../config.js')

test('setup', function (t) {
  t.ok(config.validate, 'should validate')
  t.end()
})

test('POST', function (t) {
  var req = new IncomingMessage()

  validate(req, function (err, message) {
    t.equal(err.message, 'POST Expected')
    t.end()
  })
})

test('request not from GitHub', function (t) {
  var req = new IncomingMessage()

  req.method = 'POST'
  req.connection = {}

  validate(req, function (err, message) {
    t.equal(err.message, 'Invalid Remote Address')
    t.end()
  })

  req.emit('end')
})

test('no payload', function (t) {
  var addresses = [
    '207.97.227.253'
  , '50.57.128.197'
  , '108.171.174.178']

  var req

  while (address = addresses.shift()) {
    req = new IncomingMessage()
    req.method = 'POST'
    req.connection = { remoteAddress: address }

    validate(req, function (err, message) {
      t.equal(err.message, 'Missing Parameter')
    })

    req.emit('end')
  }

  t.end()
})

test('no payload', function (t) {
  var req = new IncomingMessage()

  req.method = 'POST'
  req.connection = { remoteAddress: '207.97.227.253' }

  validate(req, function (err, message) {
    t.equal(err.message, 'Could not Parse Payload')
    t.end()
  })

  req.emit('end', 'payload=no')
})

test('payload', function (t) {
  var req = new IncomingMessage()

  req.method = 'POST'
  req.connection = { remoteAddress: '207.97.227.253' }

  validate(req, function (err, message) {
    t.notok(err, 'should no return error')
    t.equal(message, 'ok', 'should be after')
    t.end()
  })

  req.emit('end', 'payload={ "after": "ok" }')
})

test('do not validate', function (t) {
  var req = new IncomingMessage()

  config.validate = false

  validate(req, function (err, message) {
    t.equal(err, null, 'should be null')
    t.equal(message, 'No Message')
    t.end()
  })
})

