'use strict'

const Core = require('panda-core')
const Factory = Core.Factory
const Scaffold = Core.entity('scaffold')
const Utility = Core.Utility

const scaffoldList = [
  {
    name: 'Web',
    value: 'web',
    defaultPort: 6000,
    appCfg: { app: 'web' },
    services: [
      {
        name: 'component',
        core: true,
        base: '{PANDA_PATH}',
        path: 'base/services/component.service.js'
      }
    ]
  },
  {
    name: 'API',
    value: 'api',
    defaultPort: 6005,
    appCfg: {
      app: 'api',
      config: {
        path: '/api',

        whitelist: [
          'project.*',
          'component.*'
        ]
      }
    },
    services: []
  }
]

module.exports = new Scaffold({
  data: {
    // scaffolds: scaffoldList
  },

  prompt: [
    {
      type: 'list',
      name: 'scaffold',
      message: 'Service Type:',
      choices: scaffoldList
    },
    {
      type: 'input',
      name: 'name',
      message: 'App Name:',
      default: 'Example',
      when: function (answers) {
        return answers.scaffold === '--other--'
      },
      validate: async (val, answers) => {
        const check = val.length > 1 && /^[a-zA-Z0-9-_ ]+$/.test(val)
        return check || 'project name must be at least 2 letters and alphanumeric (plus dash & underscore, no spaces)'
      }
    },
    {
      type: 'input',
      name: 'slug',
      message: 'Service Slug:',
      when: function (answers) {
        return answers.scaffold === '--other--'
      },
      default: function (answers) {
        return Utility.slugify(answers.name)
      },
      validate: async (val, answers) => {
        return val === Utility.slugify(val)
      }
    },
    {
      type: 'number',
      name: 'port',
      message: 'Port:',
      default: function (answers) {
        const selectedItem = scaffoldList.find(({ value }) => value === answers.scaffold)
        return selectedItem.defaultPort
      },
      when: function (answers) {
        // only display when the matching item has 'requiresPort' param
        const selectedItem = scaffoldList.find(({ value }) => value === answers.scaffold)
        return selectedItem.defaultPort
      }
    }
  ],

  build: async function (data, opts) {
    // copy the service file
    // const dest = `app/services/${data.slug}.service.js`
    // await this.copyTemplate('service/templates/service', dest, data, opts)
    const selectedItem = scaffoldList.find(({ value }) => value === data.scaffold)

    const appCfg = selectedItem.appCfg
    appCfg.port = data.port
    await Factory.addAppToProjectJson(appCfg)

    /* if (selectedItem.services) selectedItem.services.forEach((svc) => {
      await Factory.addServiceToProjectJson(svc)
    }) */
    for (let i = 0; i < selectedItem.services.length; i++) {
      const svc = selectedItem.services[i]
      await Factory.addServiceToProjectJson(svc)
    }
    /* await Factory.addServiceToProjectJson({
      name: data.slug,
      base: '{PROJECT_PATH}',
      path: `app/services/${data.slug}.service.js`
    }) */
  }
})
