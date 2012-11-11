
var server = require('./server.js')
  , route = require('./routes/publish.js')
  , port = require('./config.js').urls.publish.port

server(route, port)
