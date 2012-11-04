// push - add, commit, and push to S3

module.exports = push

var pushup = require('pushup')
  , getProps = require('pushup/lib/getProps.js')
  , show = require('pushup/lib/show')
  , config = require('../config.js')
  , props = getProps()
  , target = config.target

function push (req, res) {
  add(function (err) {
    if (err) {
      end(err)
      return
    }
    commit(function (err) {
      if (err) {
        end(err)
        return
      }
      show(target)
        .pipe(pushup(props))
        .pipe(res)
    }
  })

  function end (err) {
    var id = 200
    if (err) {
      console.error(err)
      id = 500
    }
    var code = http.STATUS_CODES[id]
    res.writeHead(code)
    res.end(code + '\n')
  }
}

function add (callback) {
  child_process.exec('git add .', { cwd:config.target }, callback)
}

function commit (msg, callback) {
  msg = msg || 'no message'
  var command = 'git commit -m "' + msg + '"'
  child_process.exec(command, { cwd:target }, callback)
}
