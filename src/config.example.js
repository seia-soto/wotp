export default {
  app: {
    port: 3000,
    secret: 'wotp.shared__CHANGE_ME__'
  },
  database: {
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',
      user: '',
      password: '',
      database: 'wotp'
    }
  }
}
