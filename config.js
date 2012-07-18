exports.static = '/tmp/michaelnisi-site'

exports.ports =  [
  '127.0.0.1:8080'
, '127.0.0.1:8081'
, '127.0.0.1:8082'
]

if (module === require.main) {
  console.log(exports)
  process.exit(0)
}
