#!/usr/bin/env node

const Panda = require('panda')
const commander = require('commander')
const program = new commander.Command()

program
  .description('<%-data.desc%>')
  .option('-d, --debug [level]', 'Run in debug mode', false)
  .action(async (opts, cmd) => {

  })
  .parse(process.argv)
