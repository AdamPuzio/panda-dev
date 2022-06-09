#!/usr/bin/env node

const Core = require('panda-core')
const packageJson = require('../package.json')
const { Command } = Core.Wasp
const program = new Command()

Core.Wasp.clear()

program
  .description('Panda Development Toolkit CLI')
  .version(packageJson.version, '-v, --version')
  /* +++ core commands +++ */ // do not remove
  .command('create-command', 'Create a new Panda Command')
  .command('scaffolds', 'get a list of available scaffolds')
  /* +++ internal commands +++ */ // do not remove
  /* +++ shortcut commands +++ */ // do not remove
  .parse(process.argv)
