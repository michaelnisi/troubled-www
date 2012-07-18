exports.static = '/tmp/michaelnisi-site'

exports.endpoints = [
  '127.0.0.1:8080'
, '127.0.0.1:8081'
, '127.0.0.1:8082'
]

exports.pool = {
  maxPending: 1000
, maxSockets: 200
, timeout: 60000
, resolution: 1000
, ping: undefined 
, pingTimeout: 2000
, retryFilter: undefined
, retryDelay: 20
, name: undefined
}

if (module === require.main) {
  console.log(exports)
  process.exit(0)
}
