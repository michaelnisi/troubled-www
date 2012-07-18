var worker = require('./worker')
  , args = [].slice.call(arguments)
  , port = process.argv.splice(2)[0]

if (!port) {
  throw new Error('No port provided.')
}

worker(port)
