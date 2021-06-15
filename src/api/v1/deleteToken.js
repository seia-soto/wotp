import argon2 from 'argon2'

import { knex } from '../../database'
import debug from '../../debug'
import auth from '../functions/auth'

export default {
  url: '/tokens',
  method: 'DELETE',
  schema: {
    body: {
      type: 'object',
      properties: {
        password: {
          type: 'string',
          minLength: 12,
          maxLength: 4096
        }
      },
      requiredProperties: [
        'password'
      ]
    }
  },
  preHandler: [
    auth
  ],
  handler: async (request, response) => {
    const {
      username
    } = request.user
    const {
      password
    } = request.body

    try {
      const [user] = await knex('users').select('id', 'password').where({ username })

      if (!await argon2.verify(user.password, password)) {
        debug('token deletion failed due to password mismatch')

        return {
          status: 1,
          message: 'session clearance failed due to password mismatch'
        }
      }

      await knex('tokens').where({ user_id: user.id }).del()

      debug('token deletion from username:', username)

      return {
        status: 1,
        message: 'session cleared'
      }
    } catch (error) {
      debug('token deletion failed due to error:', error)

      response.code(418)

      return {
        status: 1,
        message: 'session clearance failed due to unknown reason'
      }
    }
  }
}
