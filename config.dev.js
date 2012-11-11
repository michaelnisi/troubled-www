
exports.source = '/Users/michael/workspace/troubled'
exports.target = '/Users/michael/workspace/troubled-site'

exports.port = 8000

exports.urls = {
  publish: { protocol:'http', hostname:'localhost', port:8080, open:true }
, upload:  { protocol:'http', hostname:'localhost', port:8081 }
, update:  { protocol:'http', hostname:'localhost', port:8082 }
}
