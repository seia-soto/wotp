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

app.setErrorHandler((error, request, response) => {
  if (request.is404) {
    response.code(404)

    return response.send({
      status: 1,
      message: 'not found'
    })
  }

  const originSummary = JSON.stringify({
    identifier: request.id,
    trace: request.ips,
    to: `${request.method} ${request.url}`,
    headers: request.headers
  })

  if (error) {
    debug(
      'expected error occured while processing request:', error,
      '\n', originSummary
    )

    response.code(500)

    return response.send({
      status: 1,
      message: 'internal server error'
    })
  }

  debug('unexpected request:\n', originSummary)

  response.code(418)
  response.send({
    status: 1,
    message: 'unexpected'
  })
})

export default () => app
