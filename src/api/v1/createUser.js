import argon2 from 'argon2'

import { knex } from '../../database'
import debug from '../../debug'

export default {
  url: '/users',
  method: 'POST',
  schema: {
    body: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          minLength: 4,
          maxLength: 32
        },
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
      requiredProperties: [
        'username',
        'name',
        'password'
      ]
    }
  },
  handler: async (request, response) => {
    const {
      username,
      name,
      password
    } = request.body

    if ((await knex('users').select('id').where({ username })).length) {
      debug('user creation failed due to username conflict:', username)

      response.code(400)

      return {
        status: 1,
        message: 'username already taken by another user'
      }
    }

    const hash = await argon2.hash(password)

    await knex('users')
      .insert({
        username,
        name,
        password: hash
      })

    debug('user creation success for username:', username)

    return {
      status: 0,
      message: 'user created'
    }
  }
}
