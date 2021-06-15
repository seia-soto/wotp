import createUser from './createUser'
import updateUser from './updateUser'
import createToken from './createToken'

export default (fastify, opts, done) => {
  fastify.route(createUser)
  fastify.route(createToken)
  fastify.route(updateUser)

  done()
}
