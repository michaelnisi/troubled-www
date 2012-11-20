
// proxy - public facing server

var http = require('http')
  , url = require('url')
  , path = require('path')
  , bouncy = require('bouncy')
  , config = require('./config.js')

bouncy(function (req, bounce) {
  var parsed = url.parse(req.url)
    , pathname = parsed.pathname
    , normalPathname = path.normalize(pathname).replace(/\\/g, '/')
    , id = normalPathname.replace(/\//g, '')
    , uri = config.urls[id]
    , port = (uri && uri.open) ? uri.port : null
    , err = port ? null : new Error('Unknown URL')

  function end () {
    var code = http.STATUS_CODES[404]
      , res = bounce.respond()
    res.writeHead(code)
    res.end(code + '\n')
  }

  err ? end() : bounce(port)
}).listen(config.port)
