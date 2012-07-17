module.exports = worker

var http = require('http')
  , site = require('./site.js')

function worker (port) {
  return http.createServer(site).listen(port)
}
