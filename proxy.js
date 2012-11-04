// proxy - proxy server

var http = require('http')
  , url = require('url')
  , path = require('path')
  , bouncy = require('bouncy')
  , config = require('./config.js')

bouncy(function (req, bounce) {
  var parsed = url.parse(req.url)
    , pathname = parsed.pathname
    , normalPathname = path.normalize(pathname).replace(/\\/g, '/')
  
  function end () {
    var code = http.STATUS_CODES[404]
      , res = bounce.respond()
    res.writeHead(code)
    res.end(code + '\n')
  }
   
  if (normalPathname !== config.hook) {
    end()
    return
  }

  validate(req, function (err) {
    var port = config.ports['/generate']
    err = port ? err : new Error('Invalid Port')
    err ? end() : bounce(port)
  })
}).listen(config.port)

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

    callback(null)
  })
}






