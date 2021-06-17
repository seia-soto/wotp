import createUser from './createUser'
import updateUser from './updateUser'
import deleteUser from './deleteUser'
import createToken from './createToken'
import deleteToken from './deleteToken'
import createOTP from './createOTP'
import listOTP from './listOTP'

export default (fastify, opts, done) => {
  // URL: /users
  fastify.route(createUser)
  fastify.route(updateUser)
  fastify.route(deleteUser)

  // URL: /tokens
  fastify.route(createToken)
  fastify.route(deleteToken)

  // URL:O /otps
  fastify.route(createOTP)
  fastify.route(listOTP)

  done()
}
