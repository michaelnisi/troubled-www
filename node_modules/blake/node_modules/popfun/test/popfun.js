var test = require('tap').test
  , popfun = require('../index.js')
  , callback = function () {}

test('argument', function (t) {
  t.is(popfun(), null, 'should be null')
  t.is(popfun(undefined), null, 'should be null')
  t.is(popfun(null), null, 'should be null')
  t.is(popfun({}), null, 'should be null')
  t.is(popfun([]), null, 'should be null')
  t.is(popfun(true), null, 'should be null')
  t.is(popfun(1), null, 'should be null')
  t.is(popfun('beep'), null, 'should be null')
  t.end()
})

test('single', function (t) {
  var args = [callback]
  t.is(popfun(args), callback, 'should be callback')
  t.is(args.length, 0, 'should be popped')
  t.end()
})

test('multiple', function (t) {
  var args = [true, 1, '', {}, [], function () {}, callback]
  t.is(popfun(args), callback, 'should be callback')
  t.is(args.length, 6,  'should be popped')
  t.end()
})
