import crypto from 'crypto'
import jwt from 'jsonwebtoken'

import { knex } from '../../database'
import config from '../../config'
import debug from '../../debug'

export default async (request, response) => {
  const { authentication } = request.headers

  if (!authentication) {
    debug('authentication failure due to inexistence of token')

    response.code(403)
    response.send({
      status: 2,
      message: 'authentication failure'
    })

    return response
  }

  try {
    // NOTE: Verify as application side first
    const payload = jwt.verify(authentication, config.app.secret)
    // NOTE: Token blacklist check
    const [token] = await knex('tokens').select('id').where({
      hash: crypto.createHash('md5').update(authentication).digest('hex')
    })

    if (!token || !payload.username) {
      debug('authentication failure due to invalid token')

      response.code(403)
      response.send({
        status: 2,
        message: 'token state downgraded'
      })

      return response
    }

    debug('authentication success from username:', payload.username)

    request.user = payload
  } catch (error) {
    debug('authentication failure due to unknown error:', error)

    response.code(403)
    response.send({
      status: 2,
      message: 'authentication failure'
    })
  }
}
