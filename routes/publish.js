
// publish - publish site

var http = require('http')
  , config = require('../config.js')
  , getProps = require('pushup/lib/getProps.js')

module.exports = function (req, res) {
  var hash = null
    , source = config.source
    , target = config.target

  validate(req, function (after, err) {
    hash = after
    err ? end() : pull()
  })

  function end (err) {
    var code = http.STATUS_CODES[404]
      , message = err ? err.message : code
    res.writeHead(code)
    res.end(message + '\n')
  }
  
  function pull () {
    var options = { cwd:source }
    child_process.exec('git pull', options, function (err) {
      err ? end() : generate()  
    })
  }

  function generate () {
    blake(source, target, function (err) {
      err ? end() : add() 
    })
  }

  function add () {
    var options = { cwd:target }
    child_process.exec('git add .', options, function (err) {
      err ? end() : commit() 
    })
  }

  function commit () {
    var options = { cwd:target }
    child_process.exec('git commit -m ' + hash, options, function (err) {
      err ? end() : push() 
    })
  }

  function push () {
    var props = getProps()

    show(target)
      .on('error', end)
      .pipe(pushup(props)
      .on('error', end)
      .pipe(res)
  }
}

function validate (req, callback) {
  if (process.env.NODE_ENV === 'dev') {
    callback()
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

    callback(payload.after)
  })
}
