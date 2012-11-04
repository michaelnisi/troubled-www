var config = require('../config.js')
  , blake = require('blake')
  , http = require('http')
  , gitpull = require('gitpull')

module.exports = function (req, res) {
  var source = config.source
    , target = config.target
  
  function end (err, id) {
    id = id || 500
    if (err) console.error(err)
    var code = http.STATUS_CODES[id]
    res.writeHead(code)
    res.end(code + '\n')
  }
  
  validate(req, function (err) {
    if (err) {
      end(err)
      return
    }
   
    // pull 
    // generate
    // push    
  })
}

function isGitHub (address) {
  return config.github.some(function (a) {
    return address === a
  })
}

function validate (req, callback) {
  if (req.method !== 'POST') {
    return callback(new Error('not a POST request'))
  }

  var data = ''

  req.on('data', function (chunk) {
    data += chunk
  })

  req.on('end', function () {
    if (!data || !isGitHub(req.connection.remoteAddress)) {
      return callback(new Error('not from GitHub'))
    } 

    var value = data.split('payload=')[1]
    if (!value) {
      return callback(new Error('no payload parameter'))
    }

    try {
      var payload = JSON.parse(unescape(value) || null)
    } catch(err) {
      return callback(new Error('could not parse payload'))
    }

    if (!payload) {
      return callback(new Error('no payload object'))
    }

    callback(null, payload.after)
  })
}

function add (callback) {
  child_process.exec('git add .', { cwd:config.target }, callback)
}

function commit (hash, callback) {
  var command = 'git commit -m "' + hash + '"'
  child_process.exec(command, { cwd:config.target }, callback)
}






