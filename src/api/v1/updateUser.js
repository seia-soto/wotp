import argon2 from 'argon2'

import { knex } from '../../database'
import debug from '../../debug'
import auth from '../functions/auth'

export default {
  url: '/users',
  method: 'PATCH',
  schema: {
    body: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 1,
          maxLength: 64
        },
        password: {
          type: 'string',
          minLength: 12,
          maxLength: 4096
        }
      },
      requiredProperties: []
    }
  },
  preHandler: [
    auth
  ],
  handler: async (request, response) => {
    const {
      username
    } = request.user

    // NOTE: Check if there is a thing to update
    const keys = Object.keys(request.body)

    if (!keys.length) {
      response.code(418)

      return {
        status: 1,
        message: 'user update failure due to undefined data'
      }
    }

    if (request.body.password) {
      request.body.password = await argon2.hash(request.body.password)
    }

    await knex('users').update(request.body).where({ username })

    debug('user update success for username:', username)

    return {
      status: 0,
      message: 'user updated'
    }
  }
}
