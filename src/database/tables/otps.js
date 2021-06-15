export default table => {
  table.increments()

  table.text('name')
  table.integer('type')
  table.integer('key_size')
  table.integer('code_size')
  table.text('secret')
  table.integer('epoch') // NOTE: TOTP only
  table.integer('time_slice') // NOTE: HOTP only

  return table
}
