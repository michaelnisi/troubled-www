

var server = require('./server.js')
  , route = require('./routes/upload.js')
  , port = require('./config.js').urls.upload.port

server(route, port)
