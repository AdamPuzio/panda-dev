'use strict'

const Core = require('panda-core')
const Scaffold = Core.entity('scaffold')
const Utility = Core.Utility

const scaffoldList = [
  {
    name: 'ES-6 Class',
    value: 'model/templates/es6-class',
    default: false
  },
  {
    name: 'Mongoose Model',
    value: 'model/templates/mongoose',
    default: true
  }
]

module.exports = new Scaffold({
  data: {
    scaffolds: scaffoldList
  },

  prompt: [
    {
      type: 'input',
      name: 'name',
      message: 'Model Name:',
      default: 'Example',
      validate: async (val, answers) => {
        const check = val.length > 1 && /^[a-zA-Z0-9-_]+$/.test(val)
        return check || 'model name must be at least 2 letters and alphanumeric (plus dash & underscore, no spaces)'
      }
    },
    {
      type: 'input',
      name: 'slug',
      message: 'Model Slug:',
      default: function (answers) {
        return Utility.slugify(answers.name)
      },
      validate: async (val, answers) => {
        const check = val === Utility.slugify(val)
        return check || 'slug must be lowercase and alphanumeric (plus dash & underscore, no spaces)'
      }
    },
    {
      type: 'list',
      name: 'scaffold',
      message: 'Model Type:',
      choices: scaffoldList
    }
  ],

  build: async function (data, opts) {
    // copy the model file
    const dest = `app/models/${data.slug}.js`
    return await this.copyTemplate(data.scaffold, dest, data, opts)
  }
})
