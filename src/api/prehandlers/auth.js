import jwt from 'jsonwebtoken'

import { knex } from '../../database'
import config from '../../config'

export default async (request, response) => {
  const { authentication } = request.headers

  if (!authentication) {
    response.code(403)

    return {
      status: 2,
      message: 'authentication failure'
    }
  }

  try {
    // NOTE: Verify as application side first
    const payload = jwt.verify(authentication, config)
    // NOTE: Token blacklist check
    const [token] = await knex('tokens').select('id').where({
      hash: crypto.createHash('md5').update(authentication).digest('hex')
    })

    if (!token) {
      response.code(403)

      return {
        status: 2,
        message: 'token state downgraded'
      }
    }

    response.auth = payload
  } catch (error) {
    response.code(403)

    return {
      status: 2,
      message: 'authentication failure'
    }
  }
}
