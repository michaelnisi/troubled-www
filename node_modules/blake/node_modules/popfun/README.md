# popfun - pop fun off

[![Build Status](https://secure.travis-ci.org/michaelnisi/popfun.png)](http://travis-ci.org/michaelnisi/popfun) [![devDependency Status](https://david-dm.org/michaelnisi/popfun/dev-status.png)](https://david-dm.org/michaelnisi/popfun#info=devDependencies)

The popfun node module removes the last element from an array and returns that value to the caller, if the element is of type 'function'; for example, the callback in an arguments array.

## Usage
```js
var popfun = require('popfun')

function echo () {
  var args = Array.prototype.slice.call(arguments)
    , callback = popfun(args)
  
  if (callback) callback(null, args.join(' '))
}

echo('hey', 'you', function (err, msg) {
  console.log(msg)
})
```
## API

### popfun(args)

- `args` Object to pop if last element is of type 'function'

Returns function or null.

## Installation

[![npm](https://nodei.co/npm/popfun.png?compact=true)](https://npmjs.org/package/popfun) 

## License

[MIT License](https://raw.github.com/michaelnisi/popfun/master/LICENSE)
