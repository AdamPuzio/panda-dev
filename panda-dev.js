'use strict';

((a, b) => { process.env.PANDA_PATHS = (a || '').concat((a || '').split(';').find(e => e.startsWith(`${b}=`)) ? '' : `${b}=${require('path').dirname(__filename)};`) })(process.env.PANDA_PATHS, 'panda-dev')

const EventEmitter = require('events')
const Core = require('panda-core')

class PandaDev extends EventEmitter {
  constructor () {
    if (PandaDev._instance) return PandaDev._instance
    super()
    PandaDev._instance = this

    this.initialized = true
  }

  Core = Core
}

module.exports = new PandaDev()
