import argon2 from 'argon2'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

import { knex } from '../../database'
import config from '../../config'
import debug from '../../debug'

export default {
  url: '/tokens',
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
        password: {
          type: 'string',
          minLength: 12,
          maxLength: 4096
        }
      },
      requiredProperties: [
        'username',
        'password'
      ]
    }
  },
  handler: async (request, response) => {
    const {
      username,
      password
    } = request.body
    const [user] = await knex('users')
      .select('*')
      .where({
        username
      })

    if (!user) {
      debug('user authentication failed due to undefined user:', username)

      response.code(418)

      return {
        status: 1,
        message: 'username does not exist on this server'
      }
    }

    try {
      if (!await argon2.verify(user.password, password)) {
        debug('user authentication failed due to invalid password for user:', username)

        response.code(403)

        return {
          status: 1,
          message: 'invalid password'
        }
      }

      const token = jwt.sign({
        username,
        agent: request['user-agent'] || 'unknown',
        creation: Date.now()
      }, config.app.secret, {
        expiresIn: '1w'
      })

      await knex('tokens').insert({
        user_id: user.id,
        hash: crypto.createHash('md5').update(token).digest('hex')
      })

      debug('user authentication success for username:', username)

      return {
        status: 0,
        message: 'token created',
        token
      }
    } catch (error) {
      debug('user authentication failed due to error:', error)

      response.code(418)

      return {
        status: 1,
        message: 'user authentication failed due to unknown reason'
      }
    }
  }
}
