'use strict'

const Core = require('panda-core')
const Scaffold = Core.entity('scaffold')
const Utility = Core.Utility
const ctx = Core.ctx

const projectJson = ctx.getProjectDetails()

const scaffoldList = [
  {
    name: 'Basic',
    value: 'component/templates/basic',
    default: true
  }
]

const typeList = [
  { name: 'Visual', value: 'visual' },
  { name: 'Structural', value: 'structural' },
  { name: 'Functional', value: 'functional' },
  { name: 'Logical', value: 'logical' },
  { name: 'Foundational', value: 'foundational' }
]

module.exports = new Scaffold({
  data: {
    scaffolds: scaffoldList
  },

  prompt: [
    {
      type: 'input',
      name: 'name',
      message: 'Component Name:',
      default: 'Panda Component',
      validate: async (val, answers) => {
        const check = val.length > 1 && /^[a-zA-Z0-9-_ ]+$/.test(val)
        return check || 'model name must be at least 2 letters and alphanumeric (plus dash & underscore)'
      }
    },
    {
      type: 'input',
      name: 'slug',
      message: 'Component Slug:',
      default: function (answers) {
        return Utility.slugify(answers.name)
      },
      validate: async (val, answers) => {
        const check = val === Utility.slugify(val)
        return check || 'slug must be lowercase and alphanumeric (plus dash & underscore, no spaces)'
      }
    },
    {
      type: 'input',
      name: 'namespace',
      message: 'Component Namespace:',
      default: function (answers) {
        return `${projectJson.name}.ui.components.${answers.slug}`
      },
      validate: async (val, answers) => {
        const check = val.length > 1 && /^[a-zA-Z0-9-_.]+$/.test(val)
        return check || 'namespace must be at least 2 letters and alphanumeric (plus dash & underscore)'
      }
    },
    {
      type: 'list',
      name: 'type',
      message: 'Component Type:',
      choices: typeList
    },
    {
      type: 'list',
      name: 'scaffold',
      message: 'Component Scaffold:',
      when: function (answers) {
        if (scaffoldList.length === 1) {
          answers.scaffold = scaffoldList[0].value
          return false
        }
        return true
      },
      choices: scaffoldList
    }
  ],

  build: async function (data, opts) {
    // copy the component scaffold
    const dest = `app/ui/components/${data.slug}`
    await this.copy(data.scaffold, dest, opts)

    // copy the component.json file
    const cmpJson = `app/ui/components/${data.slug}/component.json`
    await this.copyTemplate('component/templates/component.json', cmpJson, data, opts)

    // rename the view
    await this.rename(`app/ui/components/${data.slug}/ui/web.html`, `app/ui/components/${data.slug}/ui/${data.slug}.html`)
  }
})
