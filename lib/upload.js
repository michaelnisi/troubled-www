
// upload - upload changed files in latest commit to S3

var http = require('http')
  , gitgo = require('gitgo')
  , pushup = require('pushup')
  , url = require('url')
  , showf = require('showf')
  , cop = require('cop')
  , querystring = require('querystring')
  , gitgo = require('gitgo')
  , config = require('../config.js')

module.exports = function (req, res) {
  var source = config.source
    , target = config.target
    , queue = [add, commit, push]

  next()

  function next () {
    var fn = queue.shift()
    if (fn) fn.apply()
  }

  function add () {
    gitgo(target, ['add', '.'])
      .on('end', next)
      .resume()
  }

  function commit () {
    gitgo(target, ['commit', '-m',  'ok'])
      .on('end', next)
      .resume()
  }

  function push () {
    var prev = process.cwd()
    process.chdir(target)
    showf(target)
      .pipe(pushup())
      .pipe(res)
      .on('end', function () {
        process.chdir(prev)
      })
  }
}
