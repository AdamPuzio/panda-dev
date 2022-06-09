#!/usr/bin/env node

'use strict'

const Core = require('panda-core')
const Wasp = Core.Wasp
const program = new Wasp.Command()

program
.description('<%-data.desc%>')
.action(async function(opts, cmd) {
  this.debug(`command: <%-data.command%>`)

  this.heading('<%- data.desc %>')
  <% if (data.confirmInProject) { %>
  // check to make sure we are in a Project directory
    await this.confirmInProject()    
  <% } %>
})
.parse(process.argv)