var server = require('./server.js')
  , route = require('./routes/update.js')
  , config = require('./config.js')
  , request = require('request')
  , url = 'http://localhost:' + server(route).port

setInterval(function () {
  request(url, function (err) {
    if (err) console.error(err)
  })
}, config.delay)
