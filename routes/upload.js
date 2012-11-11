
// upload - upload to S3

var http = require('http')
  , pushup = require('pushup')
  , url = require('url')
  , show = require('pushup/lib/show')
  , getProps = require('pushup/lib/getProps')
  , cop = require('cop')
  , querystring = require('querystring')
  , gitgo = require('gitgo')
  , config = require('../config.js')

module.exports = function (req, res) {
  var source = config.source
    , target = config.target
    , queue = [add, commit, push]
    , message = null

  req.on('end', function (chunk) {
    message = url.parse(req.url, true).message
    next()
  })

  function next () {
    var fn = queue.shift()
    if (fn) fn.apply()
  }

  function add () {
    gitgo(target, ['add', '.'])
      .on('error', console.error)
      .on('end', next)
      .pipe(process.stdout)
  }

  function commit () {
    gitgo(target, ['commit', '-m',  message])
      .on('error', console.error)
      .on('end', next)
  }

  function push () {
    var props = getProps()

    process.chdir(target)

    return show(target)
      .on('error', console.error)
      .pipe(pushup(props))
      .on('error', console.error)
      .pipe(cop(function (filename) { return filename + '\n' }))
      .pipe(res)
  }
}
