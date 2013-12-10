
// example - pipe file to stdout

var lino = require('../')
  , fs = require('fs')

fs.createReadStream('./test/manifesto.txt')
  .pipe(lino())
  .pipe(process.stdout)
