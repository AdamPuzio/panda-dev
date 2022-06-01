#!/usr/bin/env node

const Core = require('panda-core')
const Factory = Core.Factory
const Wasp = Core.Wasp
const program = new Wasp.Command()

program
  .description('get a list of available scaffolds')
  .option('--scaffold-source', 'Change the source scaffold directory')
  .option('-d, --debug [level]', 'Run in debug mode', false)
  .action(async (opts, cmd) => {
    const logger = cmd.logger
    logger.debug('command: scaffolds')
    const options = await Wasp.parse(cmd)

    logger.out('info', 'Scaffold List:', 'bold')
    const list = await Factory.getScaffoldList()
    Object.entries(list).forEach(([entity, scaffolds]) => {
      logger.out('info', `${entity}`, 'bold.magenta')
      Object.entries(scaffolds).forEach(([scaffold, scaffoldInfo]) => {
        const info = scaffoldInfo.content || {}
        const scaffoldName = info.name || scaffold
        const slug = scaffold === entity ? scaffold : `${entity}/${scaffold}`
        logger.out('info', `  ${scaffoldName} [${slug}]`, 'green')
        if (info.desc) logger.out('info', `    ${info.desc}`, 'gray')
      })
    })
  })

program.parse(process.argv)
