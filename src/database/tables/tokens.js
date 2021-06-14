export default table => {
  table.increments()

  table.integer('user_id')
  table.string('hash')

  return table
}
