'use strict'

const Core = require('panda-core')
const Scaffold = Core.entity('scaffold')
const Factory = Core.Factory
const Utility = Core.Utility

const scaffoldList = [
  {
    name: 'Base Service',
    desc: 'A simple, empty Service file with just the base structure',
    value: 'service/templates/service',
    default: true
  },
  {
    name: 'Example Service',
    desc: 'An example Service that contains sample code on how actions and methods can be used',
    value: 'service/templates/service-example'
  }
]

module.exports = new Scaffold({
  data: {
    scaffolds: scaffoldList
  },

  prompt: [
    {
      type: 'list',
      name: 'scaffold',
      message: 'Service Type:',
      choices: Utility.promptList(scaffoldList)
    },
    {
      type: 'input',
      name: 'name',
      message: 'Service Name:',
      default: 'Example',
      validate: async (val, answers) => {
        const check = val.length > 1 && /^[a-zA-Z0-9-_ ]+$/.test(val)
        return check || 'project name must be at least 2 letters and alphanumeric (plus dash & underscore, no spaces)'
      }
    },
    {
      type: 'input',
      name: 'slug',
      message: 'Service Slug:',
      default: function (answers) {
        return Utility.slugify(answers.name)
      },
      validate: async (val, answers) => {
        return val === Utility.slugify(val)
      }
    }
  ],

  build: async function (data, opts) {
    // copy the service file
    const dest = `app/services/${data.slug}.service.js`
    await this.copyTemplate(data.scaffold, dest, data, opts)
    await Factory.addServiceToProjectJson({
      name: data.slug,
      base: '{PROJECT_PATH}',
      path: dest
    })
  }
})
