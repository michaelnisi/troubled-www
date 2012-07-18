var config = require('./config') 
  , ports = config.ports
  , bouncy = require('bouncy')
  , i = 0
  , port

bouncy(function (req, bounce) {
  port = ports[i++]
  console.log(port)
  bounce(port)
  if (i > 2) i = 0
}).listen(8000);

