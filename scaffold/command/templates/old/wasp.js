#!/usr/bin/env node

const Panda = require('panda-core')
const Wasp = Panda.Wasp
const program = new Wasp.Command()

program
  .description('<%-data.desc%>')
  .option('-d, --debug [level]', 'Run in debug mode', false)
  .action(async (opts, cmd) => {
    const logger = cmd.logger
    logger.debug('command: <%-data.command%>')
    const options = Wasp.parse(cmd)
  })

program.parse(process.argv)
