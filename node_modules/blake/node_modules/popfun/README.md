# popfun - pop last item of array, if it is a function

[![Build Status](https://secure.travis-ci.org/michaelnisi/popfun.png)](http://travis-ci.org/michaelnisi/popfun)

## Description

The popfun node module removes the last element from an array and returns that value to the caller, if the element is of type 'function'; for example, the callback in an arguments array.

## Usage

    var popfun = require('popfun')

    function echo () {
      var args = Array.prototype.slice.call(arguments)
        , callback = popfun(args)
      
      if (callback) callback(null, args.join(' '))
    }
    
    echo('hey', 'you', function (err, msg) {
      console.log(msg)
    })

## Installation

Install with [npm](http://npmjs.org/):

    npm install popfun

## License

[MIT License](https://raw.github.com/michaelnisi/popfun/master/LICENSE)
