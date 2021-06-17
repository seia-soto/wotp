export default table => {
  table.increments()

  table.integer('user_id')

  table.text('name')
  table.integer('type')
  table.text('secret')
  table.integer('period') // NOTE: totp-only feature
  table.integer('counter') // NOTE: hotp-only feature

  return table
}
