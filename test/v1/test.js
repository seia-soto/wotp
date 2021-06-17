const {
  test,
  before,
  teardown
} = require('tap')

const { default: build } = require('../../src')
const {
  profile,
  api
} = require('./data')

let app
let Authentication

before(t => {
  app = build()
})
teardown(async t => {
  await app.terminate()
})

test('user creation', async t => {
  const res = await app.inject({
    method: 'POST',
    url: api.USERS,
    body: profile
  })

  t.equal(res.statusCode, 200, 'returns a status code of 200')
  t.same(res.json(), {
    status: 0,
    message: 'user created'
  })
})
test('user creation with same username', async t => {
  const res = await app.inject({
    method: 'POST',
    url: api.USERS,
    body: profile
  })

  t.equal(res.statusCode, 418, 'returns a status code of 418')
  t.same(res.json(), {
    status: 1,
    message: 'username already taken by another user'
  })
})
test('token creation', async t => {
  const res = await app.inject({
    method: 'POST',
    url: api.TOKENS,
    body: {
      username: profile.username,
      password: profile.password
    }
  })
  const data = res.json()

  Authentication = data.token

  t.equal(res.statusCode, 200, 'returns a status code of 200')
  t.type(data.token, 'string', 'returns an authentication token')
})
test('token creation without valid user', async t => {
  const res = await app.inject({
    method: 'POST',
    url: api.TOKENS,
    body: {
      username: profile.username + ':invalid',
      password: profile.password + ':invalid'
    }
  })
  const data = res.json()

  t.equal(res.statusCode, 418, 'returns a status code of 418')
  t.same(data, {
    status: 1,
    message: 'username does not exist on this server'
  })
})
test('token creation without valid password', async t => {
  const res = await app.inject({
    method: 'POST',
    url: api.TOKENS,
    body: {
      username: profile.username,
      password: profile.password + ':invalid'
    }
  })
  const data = res.json()

  t.equal(res.statusCode, 403, 'returns a status code of 403')
  t.same(data, {
    status: 1,
    message: 'invalid password'
  })
})
test('user modification', async t => {
  const res = await app.inject({
    method: 'PATCH',
    url: api.USERS,
    headers: {
      Authentication
    },
    body: {
      name: profile.name,
      password: profile.password
    }
  })
  const data = res.json()

  t.equal(res.statusCode, 200, 'returns a status code of 200')
  t.same(data, {
    status: 0,
    message: 'user updated'
  })
})
test('user modification nothing to do', async t => {
  const res = await app.inject({
    method: 'PATCH',
    url: api.USERS,
    headers: {
      Authentication
    },
    body: {}
  })
  const data = res.json()

  t.equal(res.statusCode, 418, 'returns a status code of 418')
  t.same(data, {
    status: 1,
    message: 'user update failure due to undefined data'
  })
})
test('authentication test (via user modification)', async t => {
  const res = await app.inject({
    method: 'PATCH',
    url: api.USERS,
    body: {
      name: profile.name,
      password: profile.password
    }
  })
  const data = res.json()

  t.equal(res.statusCode, 403, 'returns a status code of 403')
  t.same(data, {
    status: 2,
    message: 'authentication failure'
  })
})
test('otp registeration via hotp method', async t => {
  const res = await app.inject({
    method: 'POST',
    url: api.OTPS,
    headers: {
      Authentication
    },
    body: {
      name: 'hotp test',
      type: 'hotp',
      secret: '12345678901234567890',
      counter: 0,
      period: 30
    }
  })
  const data = res.json()

  t.equal(res.statusCode, 200, 'returns a status code of 200')
  t.same(data, {
    status: 0,
    message: 'otp registered'
  })
})
test('otp registeration via totp method', async t => {
  const res = await app.inject({
    method: 'POST',
    url: api.OTPS,
    headers: {
      Authentication
    },
    body: {
      name: 'totp test',
      type: 'totp',
      secret: '12345678901234567890',
      counter: 0,
      period: 30
    }
  })
  const data = res.json()

  t.equal(res.statusCode, 200, 'returns a status code of 200')
  t.same(data, {
    status: 0,
    message: 'otp registered'
  })
})
test('otp listing', async t => {
  const res = await app.inject({
    method: 'GET',
    url: api.OTPS,
    headers: {
      Authentication
    }
  })
  const data = res.json()

  t.equal(res.statusCode, 200, 'returns a status code of 200')
  t.same(data, {
    status: 0,
    message: 'otps retrieved',
    otps: [
      {
        id: 1,
        name: 'hotp test',
        type: 0,
        secret: '12345678901234567890',
        counter: 0,
        period: 30
      },
      {
        id: 2,
        name: 'totp test',
        type: 1,
        secret: '12345678901234567890',
        counter: 0,
        period: 30
      }
    ]
  })
})
test('otp deletion', async t => {
  const res = await app.inject({
    method: 'DELETE',
    url: api.OTPS,
    headers: {
      Authentication
    },
    body: {
      id: 2
    }
  })
  const data = res.json()

  t.equal(res.statusCode, 200, 'returns a status code of 200')
  t.same(data, {
    status: 0,
    message: 'otp deleted'
  })
})
test('token clearance with invalid password', async t => {
  const res = await app.inject({
    method: 'DELETE',
    url: api.TOKENS,
    headers: {
      Authentication
    },
    body: {
      password: profile.password + ':invalid'
    }
  })
  const data = res.json()

  t.equal(res.statusCode, 200, 'returns a status code of 200')
  t.same(data, {
    status: 1,
    message: 'session clearance failed due to password mismatch'
  })
})
test('token clearance', async t => {
  const res = await app.inject({
    method: 'DELETE',
    url: api.TOKENS,
    headers: {
      Authentication
    },
    body: {
      password: profile.password
    }
  })
  const data = res.json()

  t.equal(res.statusCode, 200, 'returns a status code of 200')
  t.same(data, {
    status: 1,
    message: 'session cleared'
  })
})
test('user deletion with invalid password', async t => {
  const { token } = (await app.inject({
    method: 'POST',
    url: api.TOKENS,
    body: {
      username: profile.username,
      password: profile.password
    }
  })).json()

  Authentication = token

  const res = await app.inject({
    method: 'DELETE',
    url: api.USERS,
    headers: {
      Authentication
    },
    body: {
      password: profile.password + ':invalid'
    }
  })
  const data = res.json()

  t.equal(res.statusCode, 200, 'returns a status code of 200')
  t.same(data, {
    status: 1,
    message: 'user deletion failed due to password mismatch'
  })
})
test('user deletion', async t => {
  const res = await app.inject({
    method: 'DELETE',
    url: api.USERS,
    headers: {
      Authentication
    },
    body: {
      password: profile.password
    }
  })
  const data = res.json()

  t.equal(res.statusCode, 200, 'returns a status code of 200')
  t.same(data, {
    status: 1,
    message: 'user deleted'
  })
})
