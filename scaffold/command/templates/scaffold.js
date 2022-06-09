'use strict'

const Core = require('panda-core')
const Wasp = Core.Wasp
const program = new Wasp.ScaffoldCommand()

program
.description('<%-data.desc%>')
.argument('[name]')
.option('--name', 'The name of the <%- data.entity %>')
.option('--slug', 'The slug and filename of the <%- data.entity %> being built')
.action(async function(name, opts, cmd) {
  this.debug(`command: <%-data.command%>`)

  this.heading('Creating a new <%- data.entityPretty %>')
  <% if (data.confirmInProject) { %>
  // check to make sure we are in a Project directory
    await this.confirmInProject()    
  <% } %>
  await this.parseScaffold('<%- data.entity %>', { interactiveMode: !name, mapping: { name } })
  .then(() => { this.success('<%- data.entityPretty %> successfully created') })
  .catch((err) => {
    this.exitError(err, '<%- data.entityPretty %> creation failed')
  })
})
.parse(process.argv)

