import createUser from './createUser'
import updateUser from './updateUser'
import deleteUser from './deleteUser'
import createToken from './createToken'
import deleteToken from './deleteToken'

export default (fastify, opts, done) => {
  fastify.route(createUser)
  fastify.route(updateUser)
  fastify.route(deleteUser)

  fastify.route(createToken)
  fastify.route(deleteToken)

  done()
}
