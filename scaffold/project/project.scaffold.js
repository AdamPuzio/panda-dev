'use strict'

const Core = require('panda-core')
const ctx = Core.ctx
const Factory = Core.Factory
const Utility = Core.Utility
const Scaffold = Core.entity('scaffold')
const path = require('path')
const _ = require('lodash')

const projectScaffoldList = [
  {
    name: 'Web Application',
    value: 'webapp',
    default: true,
    apps: ['web'],
    tools: ['testTool', 'buildTool', 'cssTool', 'lintTool']
  },
  {
    name: 'API',
    value: 'api',
    apps: ['api'],
    tools: ['testTool', 'lintTool']
  }
]

const appObjList = {
  web: {
    app: 'web',
    port: 5000
  },
  api: {
    app: 'api',
    port: 4000,
    config: {
      path: '/api',
      whitelist: []
    }
  }
}

const serviceObjList = {}

const scaffoldList = {
  webapp: [
    { name: 'Skeleton', value: 'project/templates/skeleton', default: true, apps: ['webapp'] },
    { name: 'Full Sample Site', value: 'project/templates/full-site', apps: ['webapp'] },
    { name: 'React', value: 'project/templates/react', apps: ['webapp'] }
  ],
  api: null,
  headless: null
}

module.exports = new Scaffold({
  name: 'Project',
  data: { scaffolds: scaffoldList },

  prompt: [
    {
      type: 'input',
      name: 'name',
      message: 'Project Name:',
      default: function (answers) {
        return Utility._.upperFirst(Utility.camelify(`new-${ctx.label || 'panda'}-project`))
      },
      validate: async (val, answers) => {
        const check = val.length > 1 && /^[a-zA-Z0-9-_ ]+$/.test(val)
        return check || 'project name must be at least 2 letters and alphanumeric (plus dash & underscore, no spaces)'
      }
    },
    {
      type: 'input',
      name: 'slug',
      message: 'Project Slug:',
      default: function (answers) {
        return _.kebabCase(answers.name)
      },
      validate: async (val, answers) => {
        const check = val.length > 1 && /^[a-zA-Z0-9-_]+$/.test(val) && val === _.kebabCase(val)
        return check || 'project slug must be at least 2 letters and alphanumeric (plus dash & underscore, no spaces)'
      }
    },
    {
      type: 'list',
      name: 'projectScaffold',
      message: 'Project Type:',
      choices: projectScaffoldList
    },
    {
      type: 'list',
      name: 'scaffold',
      message: 'Project Scaffold:',
      when: function (answers) {
        return scaffoldList[answers.projectScaffold]
      },
      choices: function (answers) {
        return scaffoldList[answers.projectScaffold]
      }
    },
    // tools & utilities
    {
      type: 'list',
      name: 'testTool',
      message: 'Testing Framework',
      when: function (answers) {
        const scaffold = projectScaffoldList.find(el => { return el.value === answers.projectScaffold })
        if (!scaffold.tools) return false
        return scaffold.tools.includes('testTool')
      },
      choices: [
        { name: '--none--', value: null },
        { name: 'Jest', value: 'jest' },
        { name: 'Mocha', value: 'mocha' }
      ]
    },
    {
      type: 'list',
      name: 'buildTool',
      message: 'Build Tool',
      when: function (answers) {
        const scaffold = projectScaffoldList.find(el => el.value === answers.projectScaffold)
        if (!scaffold.tools) return false
        return scaffold.tools.includes('buildTool')
      },
      choices: [
        { name: '--none--', value: null },
        { name: 'Webpack', value: 'webpack' },
        { name: 'Gulp', value: 'gulp' },
        { name: 'Grunt', value: 'grunt' }
      ]
    },
    {
      type: 'list',
      name: 'cssTool',
      message: 'CSS Preprocessor',
      when: function (answers) {
        const scaffold = projectScaffoldList.find(el => el.value === answers.projectScaffold)
        if (!scaffold.tools) return false
        return scaffold.tools.includes('cssTool')
      },
      choices: [
        { name: '--none--', value: null },
        { name: 'SASS', value: 'sass' },
        { name: 'LESS', value: 'less' }
      ]
    },
    {
      type: 'list',
      name: 'lintTool',
      message: 'Linter',
      when: function (answers) {
        const scaffold = projectScaffoldList.find(el => el.value === answers.projectScaffold)
        if (!scaffold.tools) return false
        return scaffold.tools.includes('lintTool')
      },
      choices: [
        { name: '--none--', value: null },
        { name: 'JSLint', value: 'jslint' },
        { name: 'ESLint', value: 'eslint' },
        { name: 'StandardJS', value: 'standard' },
        { name: 'JSHint', value: 'jshint' }
      ]
    }
  ],

  build: async function (data, opts) {
    const logger = this.logger
    const dest = data.slug
    const projectScaffold = projectScaffoldList.find(el => el.value === data.projectScaffold)
    if (projectScaffold.apps) data.apps = projectScaffold.apps.map((o) => { return appObjList[o] })
    if (projectScaffold.services) data.services = projectScaffold.services.map((o) => { return serviceObjList[o] })

    logger.info('Building your project...')
    await this.copy(data.scaffold, dest, opts)

    logger.info('  Setting up base packages...')
    const popts = { ...{}, ...Utility.pick(data, ['name', 'slug', 'apps', 'services', 'testTool', 'buildTool', 'cssTool', 'lintTool', 'privateLabel']) }
    const projectDir = path.join(process.cwd(), dest)
    await Factory.buildPackageJson(projectDir, popts)
    await Factory.buildProjectJson(projectDir, popts)

    const tools = ['testTool', 'buildTool', 'cssTool', 'lintTool']
    tools.forEach(async (tool) => {
      if (data[tool]) {
        logger.info(`  Installing ${data[tool]}...`)
        await Factory.npmInstallPackage(data[tool], { projectDir, saveDev: true })
      }
    })
  }
})
