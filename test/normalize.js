
var test = require('tap').test
  , normalize = require('../lib/normalize.js')

test('normalize', function(t) {
  t.equal(normalize(null), '', 'should be empty string')
  t.equal(normalize(undefined), '', 'should be empty string')
  t.equal(normalize('/'), '/', 'should be one slash')
  t.equal(normalize('//'), '/', 'should be one slash')
  t.equal(normalize('//hello//'), '/hello/', 'should have proper slashes')
  t.equal(normalize('///pretty///nasty/')
                  , '/pretty/nasty/'
                  , 'should have proper slashes')

  t.end()
})
