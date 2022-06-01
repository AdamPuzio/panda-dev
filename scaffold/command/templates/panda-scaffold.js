#!/usr/bin/env node

const PandaCore = require('panda-core')
const Factory = PandaCore.Factory
const Wasp = PandaCore.Wasp
const program = new Wasp.Command()

program
  .description('<%-data.desc%>')
  .argument('[name]')
  .option('--name', 'The name of the <%- data.entity %>')
  .option('--slug', 'The slug and filename of the <%- data.entity %> being built')
  .option('--scaffold', 'The scaffold to apply', '<%- data.entity %>/templates/skeleton')
  .option('--scaffold-dir', 'The scaffolding directory to use')
  .option('--scaffold-list', 'List the available scaffolds to use')
  .option('-d, --debug [level]', 'Run in debug mode', false)
  .action(async (name, opts, cmd) => {
    const logger = cmd.logger
    logger.debug('command: <%- data.command %>')

    // check to make sure we are in a Project directory
    await Wasp.confirmInProject()

    await Wasp.parseScaffold(cmd, '<%- data.entity %>', { interactiveMode: !name, mapping: { name } })
      .then(() => { logger.success('<%- data.entityPretty %> successfully created') })
      .catch((err) => {
        logger.error('<%- data.entityPretty %> creation failed')
        logger.error(err.toString())
      })
  })

program.parse(process.argv)
