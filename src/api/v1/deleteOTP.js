import { knex } from '../../database'
import debug from '../../debug'
import auth from '../functions/auth'

export default {
  url: '/otps',
  method: 'DELETE',
  schema: {
    body: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          minimum: 1
        }
      },
      requiredProperties: [
        'id'
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
      id: otpId
    } = request.body

    const [{ id }] = await knex('users').select('id').where({ username })
    await knex('otps')
      .where({
        id: otpId,
        user_id: id
      })
      .del()

    debug('otp deleted from username:', username)

    return {
      status: 0,
      message: 'otp deleted'
    }
  }
}
