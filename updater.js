var server = require('./server.js')
  , route = require('./routes/update.js')
  , config = require('./config.js')
  , request = require('request')
  , format = require('url').format
  , url = config.urls.update
  , port = url.port
  , uri = format(url)

server(route, port)

setInterval(function () {
  request(uri)
    .on('error', console.error)
    .pipe(process.stdout)
}, config.delay)
