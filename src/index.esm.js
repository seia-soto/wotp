import fastify from 'fastify'

import * as api from './api'
import * as database from './database'
import config from './config'
import debug from './debug'

const app = fastify()

app.decorate('config', config)
app.decorate('debug', debug)
app.decorate('terminate', () => new Promise((resolve, reject) => {
  debug('exiting')

  database.knex.destroy(() => {
    debug('finalized database connections')

    resolve()
  })
}))

app.register(api.v1, { prefix: 'v1' })

export default () => app
