// generate - generate site

module.exports = generate

var config = require('../config.js')
  , blake = require('blake')
  , join = require('path').join
  , Reader = require('fstream').Reader
  , cop = require('cop')

function generate (req, res) {
  var source = config.source
    , target = config.target
    , props = { path:join(source, 'data') } 
    , reader = new Reader(props)

  reader
    .pipe(cop('path'))
    .pipe(blake(source, target))
    .pipe(cop(function (filename) { return filename + '\n' }))
    .pipe(res)
}
