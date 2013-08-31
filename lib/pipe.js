
// pipe - pipe from reader to writer

module.exports = function (reader, writer, cb) {
  reader.on('readable',  function () {
    var chunk
    while (null !== (chunk = reader.read())) {
      writer.write(chunk)
    }
  })

  reader.on('error', function (er) {
    console.error(er)
  }

  reader.on('end', cb)
}
