export default table => {
  table.increments()

  table.text('username')
  table.text('name')
  table.text('password', 'longtext')

  return table
}
