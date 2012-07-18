module.exports = update

var blake = require('blake')
  , c = require('./config')

function update (req, res) {
  blake(c.source, c.target, c.tweet, c.likes, function (err) {
    res.writeHead(200)
    res.end()
  })
}
