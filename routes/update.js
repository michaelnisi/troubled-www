module.exports = update

var blake = require('blake')
  , c = require('../config.js')

function update (req, res) {
  res.writeHead(200) 
  res.end()
  process.chdir('/')
  blake(c.source, c.target, c.tweet, c.likes, function (err) {
    console.log('%s: tweet and likes updated', new Date())  
  })
}
