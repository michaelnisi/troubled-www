module.exports = site

var resolve = require('path').resolve
  , filed = require('filed')
  , config = require('./config.js')

function site (req, res) {
  var file = resolve(config.target + req.url)
    , ext = file.split('.')[1]

  if (req.url != '/' && !ext) {
    file += '.html'
  } else if (!ext) {
    file += '/'
  }

  req.pipe(filed(file)).pipe(res)
}
