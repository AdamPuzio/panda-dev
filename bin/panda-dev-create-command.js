#!/usr/bin/env node

const PandaCore = require('panda-core')
const Wasp = PandaCore.Wasp
const command = new Wasp.Command()

command
  .description('Create a new Panda command')
  .argument('[command]')
  .option('--scaffold', 'The scaffold to apply', 'command/templates/wasp-internal')
  .option('--scaffold-dir', 'The scaffolding directory to use')
  .option('--scaffold-source', 'Change the source scaffold directory')
  .option('--scaffold-list', 'List the available scaffolds to use')
  .option('--no-fun', 'I\'m no fun')
  .option('-d, --debug [level]', 'Run in debug mode', false)
  .action(async (command, opts, cmd) => {
    const logger = Wasp.logger
    logger.debug('command: create-command')

    await Wasp.parseScaffold(cmd, 'command/panda', { interactiveMode: !command, mapping: { command } })
      .then(() => { logger.success('Panda command successfully created') })
      .catch((err) => {
        logger.exitError(err, 'Panda command creation failed')
      })
  })

command.parse(process.argv)
