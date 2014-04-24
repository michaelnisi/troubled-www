
// pipe - pipe from reader to writer

module.exports = function (reader, writer, cb) {
  reader.on('readable',  function () {
    var chunk
    while (null !== (chunk = reader.read())) {
      writer.write(chunk)
    }
  })
  var ended = false
  function error (er) {
    console.error(er)
    if (!ended) cb(er)
    ended = true
  }
  reader.on('error', error)
  reader.on('end', cb)

  writer.on('error', error)
}
