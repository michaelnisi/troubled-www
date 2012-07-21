module.exports = pull

var spawn = require('child_process').spawn

function pull (path, callback) {
  var me = spawn('git', ['pull'], { cwd: path })

  me.on('exit', function (code) {
    callback(code === 0 ? null : new Error(code))
    me.removeAllListeners()
    me.kill()
  })
  
  me.stdout.on('data', function (data) {
    console.error('stdout: ' + data);
  })

  me.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  })

  return me
}
