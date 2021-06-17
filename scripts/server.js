import build from '../src'

export default (async () => {
  const app = build()
  const {
    config,
    debug
  } = app

  const address = await app.listen(config.app.port)

  debug('listening on', address)
})()
