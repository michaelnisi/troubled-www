var http = require('http')
  , proxy = require('./proxy')
  , server = http.createServer(proxy)

server.listen('9000')
