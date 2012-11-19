
// uploader - service that uploads to S3

var server = require('./server.js')
  , route = require('./lib/upload.js')
  , port = require('./config.js').urls['upload/'].port

server(route, port)
