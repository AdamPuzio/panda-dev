#!/usr/bin/env node

const Dev = require('../')
const Core = require('panda-core')
const packageJson = require('../package.json')
const { Command } = Core.Wasp
const program = new Command()

program
  .description('Panda Development Toolkit CLI')
  .version(packageJson.version, '-v, --version')
  /* +++ core commands +++ */ // do not remove
  .command('create-command', 'Create a new Panda Command')
  .command('create-project', 'create a new project')
  .command('ctx', 'Provides context information')
  .command('install', 'install a new package')
  .command('play', 'Development playground')
  .command('scaffolds', 'get a list of available scaffolds')
  .command('uninstall', 'uninstall a package')
  /* +++ internal commands +++ */ // do not remove
  /* +++ shortcut commands +++ */ // do not remove
  .parse(process.argv)
