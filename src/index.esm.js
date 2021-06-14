import fastify from 'fastify'

import * as api from './api'
import config from './config'
import debug from './debug'

const app = fastify()

const init = async () => {
  app.register(api.v1, { prefix: 'v1' })

  const address = await app.listen(config.app.port)

  debug('listening on', address)
}

init()
