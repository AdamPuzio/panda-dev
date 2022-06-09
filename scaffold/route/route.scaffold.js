'use strict'

const Core = require('panda-core')
const Scaffold = Core.entity('scaffold')
const path = require('path')

const scaffoldList = [
  {
    name: 'Skeleton',
    value: 'route/templates/skeleton',
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
      name: 'route',
      message: 'Base Route (e.g. admin or path/to/route):',
      default: '/'
    },
    {
      type: 'input',
      name: 'filename',
      message: 'Filename (no relevance to routing):',
      default: 'index'
    },
    {
      type: 'list',
      name: 'scaffold',
      message: 'Route Type:',
      default: 'route/templates/skeleton',
      when: function (answers) {
        return scaffoldList.length > 1
      },
      choices: function (answers) {
        return scaffoldList
      }
    }
  ],

  build: async function (data, opts) {
    // copy the route file
    const dest = path.join(
      'app',
      'routes',
      data.route.split('/').join(path.sep),
      data.filename.slice(-3) == '.js' ? data.filename : data.filename + '.js'
    )
    const scaffold = 'route/templates/skeleton'
    return await this.copyTemplate(scaffold, dest, opts)
  }
})
