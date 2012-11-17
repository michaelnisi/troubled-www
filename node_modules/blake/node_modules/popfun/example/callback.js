var popfun = require('popfun')

function echo () {
  var args = Array.prototype.slice.call(arguments)
    , callback = popfun(args)
  
  if (callback) callback(null, args.join(' '))
}

echo('hey', 'you', function (err, msg) {
  console.log(msg)
})
