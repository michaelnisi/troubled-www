var http = require('http')
  , update = require('./update')
  , args = [].slice.call(arguments)
  , port = process.argv.splice(2)[0]

if (!port) {
  throw new Error('No port provided.')
}

process.chdir('/');
http.createServer(update).listen(port)
