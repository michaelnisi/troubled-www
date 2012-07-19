module.exports = publish

var spawn = require('child_process').spawn
  , config = require('../config.js')
  , blake = require('blake')

function publish (req, res) {
  validate(req, function (isValid) {
    res.writeHead(200)
    res.end()
    
    if (!isValid) {
      return console.error('Invalid post-receive request')
    } else {
      var source = config.source
        , target = config.target

      pull(source, function (err) {
        if (err) return console.error(err)
        process.chdir('/')
        blake(source, target, function (err) {
          console.log('OK')
        })
      })
    }
  })
}

function pull (path, callback) {
  spawn('git', ['pull'], { cwd: path }).on('exit', function (code) {
    return callback(code === 0 ? null : new Error(code))
  })
}

function isGitHub (address) {
  return config.github.some(function (a) {
    address === a
  })
}

function validate (req, callback) {
  if (req.method != 'POST') return callback(false)
 
  var data = ''

  req.on('data', function (chunk) {
    data += chunk
  })

  req.on('end', function () {
    if (!data) return callback(false)

    if (!isGitHub(req.connection.remoteAddress)) {
      return callback(false)
    } 

    var value = data.split('payload=')[1]

    if (!value) {
      return callback(false)
    }

    try {
      var payload = JSON.parse(unescape(value) || null)
    } catch(err) {
      return callback(false)
    }

    if (!payload) {
      return callback(false)
    }

    return callback(true)
  })
}






