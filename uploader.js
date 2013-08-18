
// uploader - service that uploads to S3

var server = require('./lib/server.js')
  , route = require('./lib/upload.js')
  , port = require('./config.js').upload.port

server(route, port)
