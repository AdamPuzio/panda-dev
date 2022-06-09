const Panda = require('panda')
const Router = Panda.Router
const router = new Router()

router.get('/', async (ctx, next) => {
  ctx.body = ''
})

module.exports = router
