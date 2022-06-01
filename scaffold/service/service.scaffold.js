const Panda = require('../../')
const Factory = Panda.Core.Factory
const Scaffold = Panda.entity('scaffold')
const Utility = Panda.Core.Utility

/* const scaffoldList = [
  {
    name: 'Service',
    value: 'service/templates/service',
    default: true
  },
  {
    name: 'App',
    value: 'service/templates/app',
    requiresPort: true
  }
] */

module.exports = new Scaffold({
  data: {
    // scaffolds: scaffoldList
  },

  prompt: [
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
    /* {
      type: 'list',
      name: 'scaffold',
      message: 'Service Type:',
      choices: scaffoldList
    },
    {
      type: 'number',
      name: 'port',
      message: 'Port:',
      default: 5050,
      when: function(answers) {
        // only display when the matching item has 'requiresPort' param
        const selectedItem = scaffoldList.find(({ value }) => value === answers.scaffold)
        return selectedItem.requiresPort
      }
    } */
  ],

  build: async function (data, opts) {
    // copy the service file
    const dest = `app/services/${data.slug}.service.js`
    await this.copyTemplate('service/templates/service', dest, data, opts)
    await Factory.addServiceToProjectJson({
      name: data.slug,
      base: '{PROJECT_PATH}',
      path: `app/services/${data.slug}.service.js`
    })
  }
})
