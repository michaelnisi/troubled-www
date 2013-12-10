
var showf = require('../')
  , cop = require('cop')

showf(process.cwd())
  .pipe(cop(function (s) { return s + '\n' }))
  .pipe(process.stdout)
