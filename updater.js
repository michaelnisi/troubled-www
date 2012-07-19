var server = require('./server.js')
  , route = require('./routes/update.js')
  , config = require('./config.js')
  , request = require('request')
  , port = process.argv.splice(2)[0]

server(route)

setInterval(function () {
  request('http://localhost:' + port)
}, config.delay)
