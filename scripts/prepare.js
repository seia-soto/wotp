import * as database from '../src/database'

const init = async () => {
  let shouldClean

  if (process.argv.slice(2)[0] === '-c') {
    console.log('[!] cleaning option enabled and now wotp will drop table before creation')

    shouldClean = 1
  }

  await database.init(shouldClean)

  database.knex.destroy(() => {
    console.log('complete preparing database source')
  })
}

init()
