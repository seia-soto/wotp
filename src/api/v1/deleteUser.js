import argon2 from 'argon2'

import { knex } from '../../database'
import debug from '../../debug'
import auth from '../functions/auth'

export default {
  url: '/users',
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
      hash,
      username
    } = request.user
    const {
      password
    } = request.body

    try {
      const [user] = await knex('users').select('id', 'password').where({ username })

      if (!user) {
        debug('user deletion failed due to token and credential mismatch')

        await knex('tokens').where({ hash }).del()

        return {
          status: 2,
          message: 'user deletion failed due to credential mismatch'
        }
      }

      if (!await argon2.verify(user.password, password)) {
        debug('user deletion failed due to password mismatch')

        return {
          status: 1,
          message: 'user deletion failed due to password mismatch'
        }
      }

      const trx = await knex.transaction()

      await trx('users').where({ username }).del()
        .catch(trx.rollback)
      await trx('tokens').where({ user_id: user.id }).del()
        .then(trx.commit)
        .catch(trx.rollback)

      debug('user deleted for username:', username)

      return {
        status: 1,
        message: 'user deleted'
      }
    } catch (error) {
      debug('user deletion failed due to error:', error)

      response.code(418)

      return {
        status: 1,
        message: 'user deletion failed due to unknown reason'
      }
    }
  }
}
