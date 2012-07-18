module.exports = proxy

var http = require('http')
  , config = require('./config')
  , Pool = require('poolee')
  , pool = new Pool(http, config.endpoints, config.pool)

function proxy (req, res) {
  pool.request(req, function (err, pRes) {
    pRes.pipe(res)
  })
}
