
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
    , port = config.ports[normalPathname]
    , err = port && port.open ? null : new Error('Invalid Port')

  function end () {
    var code = http.STATUS_CODES[404]
      , res = bounce.respond()
    res.writeHead(code)
    res.end(code + '\n')
  }

  err ? end() : bounce(port)
}).listen(config.port)
