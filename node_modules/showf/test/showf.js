var test = require('tap').test
  , fs = require('fs')
  , join = require('path').join
  , gitgo = require('gitgo')
  , es = require('event-stream')
  , rimraf = require('rimraf')
  , showf = require('../')
  , dir = '/tmp/showf-' + Math.floor(Math.random() * (1<<24))
  , spawn = require('child_process').spawn
  , cwd = process.cwd()

test('setup', function (t) {
  fs.mkdirSync(dir, 0700)
  process.chdir(dir)
  t.end()
})

test('git init', function (t) {
  gitgo(dir, ['init'])
    .on('end', function () {
      t.end()
    })
    .resume()
})

test('write', function (t) {
  var files = ['a.js', 'b.js', 'c.js'], filename = null
  while (file = files.shift()) {
    filename = join(dir, file)
    fs.writeFile(filename, 'console.log("Hello World!")', function (er) {
      t.notOk(er, 'should not error')
      if (!files.length) t.end()
    })
  }
})

test('git add', function (t) {
  gitgo(dir, ['add', '.'])
    .on('end', function () {
      t.end()
    })
    .resume()
})

test('git commit', function (t) {
  gitgo(dir, ['commit', '-m', '"Add files"'])
    .on('end', function () {
      t.end()
    })
  .resume()
})

test('lines', function (t) {
  var expected = ['a.js', 'b.js', 'c.js']
  showf(dir)
    .pipe(es.writeArray(function (err, lines) {
      t.deepEquals(lines, expected, 'should be files of last commit')
      t.end()
    })
  )
})

test('teardown', function (t) {
  rimraf(dir, function (err) {
    fs.stat(dir, function (err) {
      t.ok(!!err, 'should clean up after ourselves')
      process.chdir(cwd)
      t.end()
    })
  })
})
