import createUser from './createUser'

export default (fastify, opts, done) => {
  fastify.route(createUser)

  done()
}
