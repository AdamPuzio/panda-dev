#!/usr/bin/env node

const Core = require('panda-core')
const Wasp = Core.Wasp
const program = new Wasp.Command()

program
  .description('Provides context information')
  .option('-c, --ctx [context]', 'Check a specific context', 'full')
  .option('-d, --debug [level]', 'Run in debug mode', false)
  .action(async (opts, cmd) => {
    const logger = cmd.logger
    logger.debug('command: info')
    const options = await Wasp.parse(cmd)
    const start = Date.now()

    logger.out('info', 'General Information', 'underline.bold')

    const ctx = Core.ctx

    let o = ctx[options.ctx]()
    o = Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {})

    logger.tableOut(o)
    logger.debug(`time: ${Date.now() - start}ms`)
  })

program.parse(process.argv)
