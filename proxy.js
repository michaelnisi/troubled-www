var config = require('./config') 
  , bouncy = require('bouncy')
  , ports = config.ports
  , port
  , i = 0

bouncy(function (req, bounce) {
  port = ports[i++]
  bounce(port)
  if (i >= ports.length) i = 0
}).listen(config.port)

