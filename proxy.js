var bouncy = require('bouncy')
  , http = require('http')
  , url = require('url')
  , path = require('path')
  , config = require('./config.js')
  , ports = config.ports

bouncy(function (req, bounce) {
  var parsed = url.parse(req.url)
    , pathname = parsed.pathname
    , normalPathname = path.normalize(pathname).replace(/\\/g, '/')
    , port = ports[normalPathname]
  
  if (port) {
    bounce(port)
  } else {
    var res = bounce.respond()
      , code = http.STATUS_CODES[404]
    
    res.writeHead(code)
    res.end(code + '\n')
  }
}).listen(config.port)

