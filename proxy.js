var config = require('./config') 
  , ports = config.ports
  , bouncy = require('bouncy')
  , i = 0
  , port

bouncy(function (req, bounce) {
  if (req.url === config.hook) return bounce(config.publisher)

  port = ports[i++]
  bounce(port)
  if (i >= ports.length) i = 0
}).listen(8000);

