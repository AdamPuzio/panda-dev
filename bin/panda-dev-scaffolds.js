#!/usr/bin/env node

const Core = require('panda-core')
const Factory = Core.Factory
const Wasp = Core.Wasp
const program = new Wasp.Command()

program
  .description('get a list of available scaffolds')
  .option('--scaffold-source', 'Change the source scaffold directory')
  .option('-d, --debug [level]', 'Run in debug mode', false)
  .action(async function (opts, cmd) {
    this.debug('command: scaffolds')

    this.heading('Scaffold List:')

    const list = await Factory.getScaffoldList()
    Object.entries(list).forEach(([entity, scaffolds]) => {
      this.logger.out(`${entity}`, { level: 'info', styles: 'bold.magenta' })
      Object.entries(scaffolds).forEach(([scaffold, scaffoldInfo]) => {
        const info = scaffoldInfo.content || {}
        const scaffoldName = info.name || scaffold
        const slug = scaffold === entity ? scaffold : `${entity}/${scaffold}`
        this.logger.out(`  ${scaffoldName} [${slug}]`, { level: 'info', styles: 'green' })
        if (info.desc) this.logger.out(`    ${info.desc}`, { level: 'info', styles: 'gray' })
      })
    })
  })

program.parse(process.argv)
