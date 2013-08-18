
// publisher - service to publish the site

var server = require('./lib/server.js')
  , route = require('./lib/publish.js')
  , port = require('./config.js').publish.port

server(route, port)
