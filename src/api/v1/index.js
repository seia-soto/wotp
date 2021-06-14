import createToken from './createToken'
import createUser from './createUser'

export default (fastify, opts, done) => {
  fastify.route(createUser)
  fastify.route(createToken)

  done()
}
