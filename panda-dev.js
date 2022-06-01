'use strict'

const a = process.env.PANDA_PATHS; process.env.PANDA_PATHS = a.concat((a || '').split(';').find(e => e.startsWith(`panda-dev=`)) ? '' : `panda-dev=${require('path').dirname(__filename)};`)

const Core = require('panda-core')

let Logger

class PandaDev {
  constructor () {
    this.initialized = true
  }

  Core = Core

  ctx = Core.ctx

  getLogger () {
    // let's lazy load it
    if (!Logger) Logger = require('./src/logger')
    return Logger
  }

  entity (entity) {
    return Core.entity(entity)
  }

  Wasp = Core.Wasp
}

module.exports = new PandaDev()
