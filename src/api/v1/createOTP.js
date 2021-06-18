import notp from 'notp'

import { knex } from '../../database'
import { WOTP_OTP_TYPES } from '../../symbols'
import debug from '../../debug'
import auth from '../functions/auth'

export default {
  url: '/otps',
  method: 'POST',
  schema: {
    body: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 1,
          maxLength: 256
        },
        type: {
          type: 'string',
          enum: WOTP_OTP_TYPES
        },
        secret: {
          type: 'string',
          minLength: 8,
          maxLength: 128
        },
        counter: {
          type: 'integer',
          minimum: 0
        },
        period: {
          type: 'integer',
          minimum: 5,
          maximum: 120
        }
      },
      requiredProperties: [
        'name',
        'type',
        'secret',
        'counter',
        'period'
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
      name,
      type,
      secret,
      counter,
      period
    } = request.body

    const psk = secret.replace(/[\W]+/g, '').toUpperCase()

    try {
      // NOTE: One-time check
      notp[type].gen(secret, {
        counter,
        time: period
      })
    } catch (error) {
      debug('otp registeration failed due to invalid secret:', error)

      response.code(400)

      return {
        status: 1,
        message: 'otp registeration failed due to invalid secret'
      }
    }

    const [{ id }] = await knex('users')
      .select('id')
      .where({
        username
      })
    await knex('otps')
      .insert({
        user_id: id,
        name,
        type: WOTP_OTP_TYPES.indexOf(type),
        secret: psk,
        counter,
        period
      })

    return {
      status: 0,
      message: 'otp registered'
    }
  }
}
