var worker = require('./worker.js')
  , ports = ['8080', '8081', '8082']
  , bouncy = require('bouncy')
  , i = 0

ports.forEach(function (port) {
  worker(port)
})  
  
bouncy(function (req, bounce) {
  bounce(ports[i++])
  if (i >= 2) i = 0
}).listen(8000);

