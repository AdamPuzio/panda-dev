#!/usr/bin/env node

const Core = require('panda-core')
const Factory = Core.Factory
const Wasp = Core.Wasp
const program = new Wasp.Command()

const path = require('path')
const util = require('util')
const glob = util.promisify(require('glob'))

program
  .description('Development playground')
  .option('-d, --debug [level]', 'Run in debug mode', false)
  .action(async (opts, cmd) => {
    const logger = cmd.logger
    logger.debug('command: play')
    const options = await Wasp.parse(cmd)
    logger.info('welcome to the playground')
  })

program.parse(process.argv)
