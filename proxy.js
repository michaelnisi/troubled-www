
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
    , url = config.urls[normalPathname]
    , port = url && url.open ? url.port || null
    , err = port ? null : new Error('Unknown URL')

  function end () {
    var code = http.STATUS_CODES[404]
      , res = bounce.respond()
    res.writeHead(code)
    res.end(code + '\n')
  }

  err ? end() : bounce(port)
}).listen(config.port)
