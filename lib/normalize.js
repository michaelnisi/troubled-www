
// normalize - normalize path

var path = require('path')

module.exports = function (p) {
  return p ? path.normalize(p).replace(/\/\/+/g, '/') : ''
}
