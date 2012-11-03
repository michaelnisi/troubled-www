var routes = require('routes')
  , Router = routes.Router
  , Route = routes.Route
  , router = new Router()
  , config = require('./config.js')

module.exports = router

router.addRoute('/push', require('./routes/push.js'))
// router.addRoute('/update', require('./routes/update.js'))
// router.addRoute('/generate', require('./routes/generate.js'))
// router.addRoute(config.hook, require('./routes/hook.js'))
