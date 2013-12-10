
// lino - split stream into line sized chunks

var Transform = require('stream').Transform

module.exports = function () {
  var stream = new Transform()
    , extra = null

  stream._transform = function (chunk, enc, cb) {
    var con
    if (extra) {
      var len = extra.length + chunk.length
      con = Buffer.concat([extra, chunk], len)
      extra = null
    } else {
      con = chunk
    }

    var start = end = 0
    while (end < con.length) {
      var split = -1
        , buf = con[end++]
        , next = con[end+1]

      if (buf === 10) {
        split = end
      } else if (buf === 13) {
        split = next === 10 ? ++end : end
      }

      if (split > -1) {
        stream.push(con.slice(start, end))
        start = end
      }
      extra = con.slice(start, con.length)
    }
    cb()
  }

  stream._flush = function (cb) {
    if (extra) {
      stream.push(extra)
    }
    cb()
  }

  return stream
}
