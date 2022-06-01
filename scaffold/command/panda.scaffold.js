'use strict'

const Panda = require('../../')
const Scaffold = Panda.entity('scaffold')
const path = require('path')
const fs = require('fs-extra')

const scaffoldList = [
  { name: 'Basic', value: 'command/templates/panda', default: true },
  { name: 'Scaffold', value: 'command/templates/panda-scaffold', applyEntity: true }
]

const scaffold = new Scaffold({
  name: 'Panda Command',
  desc: 'Create Panda & PandaDev Commands',

  data: {
    scaffolds: scaffoldList
  },

  prompt: [
    {
      type: 'list',
      name: 'target',
      message: 'Target Library:',
      default: 'panda',
      choices: [
        { name: 'Panda', value: 'panda' },
        { name: 'PandaDev', value: 'panda-dev' }
      ]
    },
    {
      type: 'input',
      name: 'command',
      message: 'Command:',
      validate: async (val, answers) => {
        const check = val.length > 1 && /^[a-zA-Z0-9-_]+$/.test(val)
        return check || 'command must be at least 2 characters and alphanumeric (plus dash & underscore)'
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
      type: 'list',
      name: 'scaffold',
      message: 'Command Type:',
      default: 'command/templates/panda',
      choices: function (answers) {
        return scaffoldList
      }
    },
    {
      type: 'string',
      name: 'entity',
      message: 'Entity Type:',
      // default: 'project',
      default: function (answers) {
        return answers.command.startsWith('create-') ? answers.command.slice(7) : 'project'
      },
      when: function (answers) {
        // only display when the matching item has 'applyEntity' param
        const selectedItem = scaffoldList.find(({ value }) => value === answers.scaffold)
        return selectedItem.applyEntity
      }
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
    const destBase = Panda.ctx[data.target === 'panda' ? 'PANDA_PATH' : 'PANDA_DEV_PATH']
    const binDir = path.join(destBase, 'bin')
    const filename = `${data.target}-${data.command}.js`
    const f = path.join(binDir, filename)
    logger.debug(`Command destination: ${f}`)

    // copy template to destination
    await this.copyTemplate(data.scaffold, filename, data, { projectDir: binDir })

    // add command to entry
    if (data.binadd === 'no') return true

    const entryFile = `${data.target}.js`
    const command = {
      command: data.command,
      desc: data.desc
    }
    if (data.binadd === 'hidden') command.options = { hidden: true }
    await this.addCommandsToEntry(command, entryFile, { projectDir: destBase })

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
        hidden: {
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
        const optsStr = ''
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
