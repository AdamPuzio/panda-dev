'use strict'

const Core = require('panda-core')
const ctx = Core.ctx
const Scaffold = Core.entity('scaffold')
const path = require('path')
const fs = require('fs-extra')

const context = { context: ctx.context }
switch (ctx.context) {
  case 'inPanda':
    context.projectDir = ctx.PANDA_PATH
    context.baseCommand = 'panda'
    break
  case 'inProject':
    context.projectDir = ctx.PROJECT_PATH
    break
  case 'inPrivateLabel':
    context.projectDir = ctx.PRIVATE_LABEL_PATH
    context.baseCommand = ctx.label
    break
  case 'inPackage':
    context.projectDir = ctx.PACKAGE_PATH
    break
}

// if (!context.projectDir) throw new Error(`You need to be in a Project, Package or Library to perform this action`)
// Factory.setProjectDir(context.projectDir)

const scaffoldList = [
  { name: 'Basic', desc: 'A simple, no-frills command with just the base setup', value: 'command/templates/command', default: true },
  { name: 'Scaffold', desc: 'A command that includes scaffolding setup', value: 'command/templates/scaffold', applyEntity: true }
]

const tableFn = (arr) => {
  const names = arr.map(a => a.name)
  const maxLength = Math.max.apply(Math, names.map(function (el) { return el.length }))
  const rs = []
  arr.forEach((i) => {
    const spacing = maxLength + 5 - i.name.length
    const spacer = ' '.repeat(spacing > 0 ? spacing : 0)
    const name = `${i.name}${spacer}${i.desc || ''}`
    rs.push({ name, value: i.value })
  })
  return rs
}

const scaffold = new Scaffold({
  name: 'Command',
  desc: 'Create new Command',

  data: {
    scaffolds: scaffoldList
  },

  prompt: [
    {
      type: 'list',
      name: 'scaffold',
      message: 'Command Type:',
      default: 'command/templates/panda',
      choices: function (answers) {
        return tableFn(scaffoldList)
      }
    },
    {
      type: 'input',
      name: 'command',
      message: 'Command:',
      validate: async (val, answers) => {
        const check = val.length > 1 && /^[a-zA-Z0-9-_:]+$/.test(val)
        return check || 'command must be at least 2 characters and alphanumeric (plus dash, underscore and colon)'
      }
    },
    {
      type: 'input',
      name: 'desc',
      message: 'Description:',
      validate: async (val, answers) => {
        const check = val.length > 1
        return check || 'description must be at least 2 characters'
      }
    },
    {
      type: 'string',
      name: 'entity',
      message: 'Entity Type:',
      // default: 'project',
      default: function (answers) {
        return answers.command.split(':')[0]
      },
      when: function (answers) {
        // only display when the matching item has 'applyEntity' param
        const selectedItem = scaffoldList.find(({ value }) => value === answers.scaffold)
        return selectedItem.applyEntity
      }
    },
    {
      type: 'confirm',
      name: 'confirmInProject',
      message: 'Add in-Project check?'
    },
    {
      type: 'list',
      name: 'binadd',
      message: 'Add to bin entry?',
      choices: [
        { name: 'Yes', value: 'yes' },
        { name: 'Yes, as a hidden command', value: 'hidden' },
        { name: 'No', value: 'no' }
      ]
    }
  ],

  build: async function (data, opts) {
    const logger = this.logger

    // determine destination
    const destBase = context.projectDir
    const binDir = path.join(destBase, 'bin')
    let filename = `${data.command}.js`
    if (context.baseCommand) filename = `${context.baseCommand}-${filename}`
    const f = path.join(binDir, filename)
    logger.debug(`Command destination: ${f}`)

    // copy template to destination
    await this.copyTemplate(data.scaffold, filename, data, { projectDir: binDir })

    // add command to entry
    if (data.binadd === 'no') return true

    const entryFile = `${context.baseCommand}.js`
    const command = {
      command: data.command,
      desc: data.desc
    }
    if (data.binadd === 'hidden') command.options = { hidden: true }
    await this.addCommandsToEntry(command, entryFile, { projectDir: destBase, type: (data.binadd === 'yes' ? 'core' : 'internal') })

    return true
  },

  methods: {
    /**
     * Add commands to the entry file in the /bin directory
     *
     * { command: 'foo', desc: 'foo desc' }
     * { command: 'bar', desc: 'bar desc', { hidden: true } }
     *
     * @param {*} commands a command (or list of commands) to add
     * @param {String} filename the file to add it to (e.g. panda.js)
     * @param {Object} opts
     * @returns
     */
    async addCommandsToEntry (commands, filename, opts = {}) {
      opts = {
        ...{
          type: 'core',
          sort: true,
          projectDir: this.projectDir,
          binDir: 'bin'
        },
        ...opts
      }

      const entryFile = path.join(opts.projectDir, opts.binDir, filename)
      const content = await fs.readFile(entryFile, 'utf8')

      const splitObj = {
        core: {
          from: '/* +++ core commands +++ */ // do not remove',
          to: '  /* +++ internal commands +++ */ // do not remove'
        },
        internal: {
          from: '/* +++ internal commands +++ */ // do not remove',
          to: '/* +++ shortcut commands +++ */ // do not remove'
        },
        shortcut: {
          from: '/* +++ shortcut commands +++ */ // do not remove',
          to: '  .parse(process.argv)'
        }
      }
      if (!Array.isArray(commands)) commands = [commands]
      const split = content.split('\n')
      const obj = splitObj[opts.type]
      const findFrom = split.findIndex(el => el.includes(obj.from))
      const findTo = split.findIndex(el => el.includes(obj.to))
      const subStack = split.slice(findFrom + 1, findTo)
      commands.forEach((i) => {
        let optsStr = ''
        if (i.options) {
          if (i.options.hidden === true) opts.type = 'hidden'
          optsStr = `, ${JSON.stringify(i.options)}`
        }
        const cmd = `  .command('${i.command}', '${i.desc}'${optsStr})`
        subStack.push(cmd)
      })
      if (opts.sort) subStack.sort()
      split.splice(findFrom + 1, subStack.length - commands.length, ...subStack)
      await fs.writeFile(entryFile, split.join('\n'))
      return true
    }
  }
})

module.exports = scaffold
