const Zeta = require('zeta')
const Router = Zeta.Router
const router = new Router()

router.get('/', async (ctx, next) => {
  ctx.body = ''
})

module.exports = router
