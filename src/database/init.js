import knex from './knex'

import * as tables from './tables'

export default async clean => {
  const tableNames = Object.keys(tables)

  for (let i = 0, l = tableNames.length; i < l; i++) {
    const name = tableNames[i]

    if (clean) {
      await knex.schema.dropTableIfExists(name)
    }
    if (clean || !await knex.schema.hasTable(name)) {
      await knex.schema.createTable(name, tables[name])
    }
  }
}
