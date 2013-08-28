
// updater - service that updates tweet and likes

var server = require('./lib/server.js')
  , route = require('./lib/update.js')
  , config = require('./config.js')
  , http = require('http')
  , format = require('url').format

var url = config.update
  , port = url.port
  , uri = format(url)

server(route, port)

setInterval(function () {
  http.get(uri)
    .on('error', console.error)
    .pipe(process.stdout)
}, config.delay)
