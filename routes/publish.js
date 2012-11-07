
// publish - publish site

var http = require('http')
  , child_process = require('child_process')
  , pushup = require('pushup')
  , show = require('pushup/lib/show')
  , getProps = require('pushup/lib/getProps')
  , blake = require('blake')
  , join = require('path').join
  , Reader = require('fstream').Reader
  , cop = require('cop')
  , gitgo = require('gitpull')
  , config = require('../config.js')

module.exports = function (req, res) {
  var message = null
    , source = config.source
    , target = config.target

  validate(req, function (err, msg) {
    message = msg

    var code = http.STATUS_CODES[202]
    res.writeHead(code)
    res.end(code + '\n')

    pull()
  })

  function pull () {
    gitgo(source, ['pull'])
      .on('error', console.error)
      .on('end', generate)
      .pipe(process.stdout)
  }

  function generate () {
    var props = { path:join(source, 'data') }
      , reader = new Reader(props)

    reader
      .pipe(cop('path'))
      .pipe(blake(source, target))
      .on('error', console.error)
      .on('end', add)
      .pipe(cop(function (filename) { return filename + '\n' }))
      .pipe(process.stdout)
  }

  function add () {
    gitgo(target, ['add', '.'])
      .on('error', console.error)
      .on('end', commit)
      .pipe(process.stdout)
  }

  function commit () {
    gitgo(target, ['commit', '-m',  message])
      .on('error', console.error)
      .on('end', push)
      .pipe(process.stdout)
  }

  function push () {
    var props = getProps()

    process.chdir(target)

    show(target)
      .on('error', console.error)
      .pipe(pushup(props))
      .on('error', console.error)
      .pipe(cop(function (filename) { return filename + '\n' }))
      .pipe(process.stdout)
  }
}

function validate (req, callback) {
  if (process.env.NODE_ENV === 'dev') {
    callback(null, 'No Message')
    return
  }

  if (req.method !== 'POST') {
    callback(new Error('POST Expected'))
    return
  }

  var data = ''

  req.on('data', function (chunk) {
    data += chunk
  })

  req.on('end', function () {
    if (!data || !isGitHub(req.connection.remoteAddress)) {
      callback(new Error('Invalid Remote Address'))
      return
    }

    var value = data.split('payload=')[1]
    if (!value) {
      callback(new Error('Missing Parameter'))
      return
    }

    try {
      var payload = JSON.parse(unescape(value) || null)
    } catch(err) {
      callback(new Error('Could not Parse Payload'))
      return
    }

    if (!payload) {
      callback(new Error('Payload Expected'))
      return
    }

    callback(null, payload.after)
  })
}
