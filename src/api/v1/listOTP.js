import { knex } from '../../database'
import debug from '../../debug'
import auth from '../functions/auth'

export default {
  url: '/otps',
  method: 'GET',
  preHandler: [
    auth
  ],
  handler: async (request, response) => {
    const {
      username
    } = request.user

    try {
      debug('listing otps from username:', username)

      const [{ id }] = await knex('users').select('id').where({ username })
      const otps = await knex('otps')
        .select(
          'id',
          'name',
          'type',
          'secret',
          'counter',
          'period'
        )
        .where({
          user_id: id
        })

      return {
        status: 0,
        message: 'otps retrieved',
        otps
      }
    } catch (error) {
      debug('listing otps failed due to error:', error)

      response.code(418)

      return {
        status: 1,
        message: 'listing otps failed due to unknown reason'
      }
    }
  }
}
