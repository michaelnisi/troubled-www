module.exports = publish

var spawn = require('child_process').spawn
  , blake = require('blake')

function publish (config, request, response, callback) {
  validate(config.addresses, request, function (isValid) {
    response.writeHead(200)
    response.end()
    
    if (!isValid) {
      return callback(new Error('Invalid post-receive request'))
    } else {
      pull(config.input, function (err) {
        if (err) return callback(err)

        blake(config.input, config.output, function (err) {
          callback(err)
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

function validate (addresses, request, callback) {
  console.log(request)

  if (request.method != 'POST') return callback(false)
 
  var data = ''

  request.on('data', function (chunk) {
    data += chunk
  })

  request.on('end', function () {
    if (!data) return callback(false)

    function isGitHub(remoteAddress) {
      var i = addresses.length
        , address

      while (i--) {
        address = addresses[i]
        if (remoteAddress === address) return true
      }
     
      return false
    }

    if (!isGitHub(request.connection.remoteAddress)) {
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

    console.log(payload)

    return callback(true)
  })
}






