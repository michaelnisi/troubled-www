module.exports = proxy

var http = require('http')
  , balancer = require('./balancer')

function proxy (port, hostname, backlog, callback) {
  var server = http.createServer(function(req, res) {
    balancer.pipe(req).pipe(res)
  })
  
  server.listen(port, hostname, backlog, callback)
