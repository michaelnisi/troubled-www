module.exports = server

var http = require('http')
  , port = process.argv.splice(2)[0]

if (!port) {
  throw new Error('No port provided.')
}

function server (route) {
  var me = http.createServer(route).listen(port)
  
  me.port = port

  return me
}
