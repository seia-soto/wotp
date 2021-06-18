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
  }
}
