module.exports = johnny

var http = require('http')
  , cache 

function johnny (path, port) {
  load(path)
  return http.createServer(requestListener).listen(port)
}

function load (path) {
  if (!cache) cache = {}

}

function requestListener (req, res) {

}


