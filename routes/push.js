module.exports = push

var pushup = require('pushup')
  , http = require('http')
  , getProps = require('pushup/lib/getProps.js')
  , show = require('pushup/lib/show')
  , config = require('../config.js')
  
function push (req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.error(405)
  }
  
  var props = getProps()
    , target = config.target

  function end (err) {
    var id = 204
    if (err) {
      id = 500
      console.error(err)
    }
    var code = http.STATUS_CODES[id]
    res.writeHead(code)
    res.end(code + '\n')
  }

  show(target)
    .pipe(pushup(props))
    .on('error', end)
    .on('end', end)
    .pipe(process.stdout)
}
