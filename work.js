var worker = require('./worker')
  , args = [].slice.call(arguments)
  , port = process.argv.splice(2)[0]

worker(port)
