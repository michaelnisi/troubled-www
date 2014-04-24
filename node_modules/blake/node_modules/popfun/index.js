
// popfun - pop array, if last element is function

module.exports = function (args) {
  if (Object.prototype.toString.call(args) === '[object Array]') {
    if (typeof args[args.length - 1] === 'function') {
      return args.pop()
    }
  }
  return null
}
