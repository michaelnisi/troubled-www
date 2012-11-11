
// server - generic server

var http = require('http')

module.exports = function (route, port) {
  port = port || process.argv.splice(2)[0]

  if (!port) {
    throw new Error('No port provided')
  }

  var me = http.createServer(route).listen(port)

  me.port = port

  return me
}
