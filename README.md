# Seia-Soto/wOTP

API server for web based OTP system for ease of backing up.

## Table of Contents

- [Configuration](#configuration)
- [Development](#development)
- [API](#api)
- [LICENSE](#license)

----

# Configuration

To host wOTP server, you need to prepare environment which can run Node.JS and MariaDB(, or compatible DBMS).
After cloning or downloading this repository, copy `src/config.example.js` to `src/config.js` and start editing it.

- `app.port`: port to host wOTP server.
- `app.secret`: secret value to encrypt tokens.
- `database.client`: DBMS to use, only MariaDB compatible DBMS are mainline. However, you can use other DBMS which Knex.JS supports.
- `database.connection.host`: DBMS host.
- `database.connection.user`: DBMS user.
- `database.connection.password`: DBMS password.
- `database.connection.database` DBMS database name to use.

## Advanced

### Using another DBMS rather than MariaDB compatible

To use another DBMS instead of MariaDB compatible system, you need to install the dependency first and do test if server is working properly. We do not support DBMS except for mysql.

### Clustering

We recommend you to cluster this application via PM2 to increase handling performance by distributing the load.

- For example, running 4 processes.

```sh
pm2 start src/index.js -i 4
```

For more information, please refer [PM2 documentation](https://pm2.keymetrics.io/docs/usage/cluster-mode/).

# Development

There are some recommended and required stacks to develop wOTP server.
Before we start, ensure that we have following dependencies installed on your system.

- Git
- Node.JS latest LTS release
- Yarnpkg
- Native module compiler
- MariaDB or compatible DBMS system
- Editor supporting PnP modules with ESlint v7

Then clone this repository and run following commands:

```sh
yarn
yarn prepare # this will install husky hooks (pre-commit)
```

Now, you can configure the project by copying `src/config.example.js` to `src/config.js`.

## Scripts

There are some scripts available for ease of development.

### `yarn start`

Starts the wOTP server with environment vars.

- DEBUG=wotp*

### `yarn debug`

Starts the wOTP server with environment vars.

- DEBUG=*

### `yarn lint`

Checks whether the code will fit in Standard.JS rules by ESlint.

**You should pass this test to contribute.**

### `yarn release`

Maintains project pipeline by standard-version.

**Will not maintained in forked state! Please never touch.**

```sh
yarn release --major
yarn release --minor
yarn release --patch
```

### `yarn prepare`

Prepares husky hook on your system.
Please check out PATHs of Node.JS if this not working.

# API

Followings are API specification for this server.
The base url is prefixed with version of API.

## `/v1`

- Prefix: `/v1`
- Body: `application/json`
- Status in response
  - Valid: `0`
  - Invalid: `1`
  - Authentication failure: `2`

### Authentication

To authenticate before using private APIs you need to attach `Authentication` header which is json web token from `POST /tokens`.
If you encounter authentication related problems while server processing, you will meet `status: 2` in response data.

- Notice that token will be expire in one week.

#### Response

**Success** (null)

You'll get response which you requested for.

**Failure - empty token** (0x2)

- Code: `403`

```json
{
  "status": 2,
  "message": "authentication failure"
}
```

**Failure - state downgraded** (0x2)

This occurs when token is valid but expired by user manually via `DELETE /tokens`.

- Code: `403`

```json
{
  "status": 2,
  "message": "token state downgraded"
}
```

**Failure - ISE** (0x2)

- Code: `403`

```json
{
  "status": 2,
  "message": "authentication failure"
}
```

### `POST /users`

To create user.

#### Request

**Headers**

- Content-Type: `application/json`

**Body**

```json
{
	"username": "{{ _.username }}",
	"name": "{{ _.username }}",
	"password": "{{ _.password }}"
}
```

#### Response

**Success** (0x0)

```json
{
  "status": 0,
  "message": "user created"
}
```

**Failure - username already in use** (0x1)

```json
{
  "status": 1,
  "message": "username already taken by another user"
}
```

**Failure - ISE** (0x1)

- Code: `418`

```json
{
  "status": 1,
  "message": "user creation failed due to unknown reason"
}
```

### `PATCH /users`

To update user data.

#### Request

**Headers**

- Content-Type: `application/json`
- Authentication: `{{ _.token }}`

**Body**

```json
{
	"name": "{{ _.username }}",
	"password": "{{ _.password }}"
}
```

#### Response

**Success** (0x0)

```json
{
  "status": 1,
  "message": "user updated"
}
```

**Failure - nothing to do** (0x1)

- Code: `418`

```json
{
  "status": 1,
  "message": "user update failure due to undefined data"
}
```

**Failure - ISE** (0x1)

- Code: `418`

```json
{
  "status": 1,
  "message": "user update failed due to unknown reason"
}
```

### `DELETE /users`

To delete user.

#### Reqeust

**Headers**

- Content-Type: `application/json`
- Authentication: `{{ _.token }}`

**Body**

```json
{
	"password": "{{ _.password }}"
}
```

#### Response

**Success** (0x0)

```json
{
  "status": 1,
  "message": "user deleted"
}
```

**Failure - credential mismatch** (0x2)

```json
{
  "status": 2,
  "message": "user deletion failed due to credential mismatch"
}
```

**Failure - password mismatch** (0x1)

```json
{
  "status": 1,
  "message": "user deletion failed due to password mismatch"
}
```

**Failure - ISE** (0x1)

```json
{
  "status": 1,
  "message": "user deletion failed due to unknown reason"
}
```

### `POST /tokens`

To create token to authenticate.

#### Request

**Headers**

- Content-Type: `application/json`

**Body**

```json
{
	"username": "{{ _.username }}",
	"password": "{{ _.password }}"
}
```

#### Response

**Success** (0x0)

```json
{
  "status": 0,
  "message": "token created",
  "token": "<JWT>"
}
```

**Failure - undefined user** (0x1)

```json
{
  "status": 1,
  "message": "username does not exist on this server"
}
```

**Failure - invalid password** (0x1)

```json
{
  "status": 1,
  "message": "invalid password"
}
```

**Failure - ISE** (0x1)

- Code: `418`

```json
{
  "status": 1,
  "message": "user authentication failed due to unknown reason"
}
```

### `DELETE /tokens`

To delete all tokens.

#### Request

**Headers**

- Content-Type: `application/json`
- Authentication: `{{ _.token }}`

**Body**

```json
{
	"password": "{{ _.password }}"
}
```

#### Response

**Success** (0x0)

```json
{
  "status": 1,
  "message": "session cleared"
}
```

**Failure - password mismatch** (0x1)

```json
{
  "status": 1,
  "message": "session clearance failed due to password mismatch"
}
```

**Failure - ISE** (0x1)

- Code: `418`

```json
{
  "status": 1,
  "message": "session clearance failed due to unknown reason"
}
```

### `GET /otps`

To list all otps registered.

#### Request

**Headers**

- Content-Type: `application/json`
- Authentication: `{{ _.token }}`

#### Response

**Success** (0x0)

- `otps[].counter` is only for `HOTP` method.
- `otps[].period` is only for `TOPT` method.

```json
{
  "status": 0,
  "message": "otps retrieved",
  "otps": [
    {
      "id": 1,
      "name": "OTP",
      "type": 1,
      "secret": "<secret>",
      "counter": 0,
      "period": 30
    }
  ]
}
```

**Failure - ISE** (0x1)

```json
{
  "status": 1,
  "message": "listing otps failed due to unknown reason"
}
```

### `POST /otps`

To register new OTP.

#### Request

**Headers**

- Content-Type: `application/json`
- Authentication: `{{ _.token }}`

**Body**

- The length of `name` should be exist or longer than 1.
- `type` is expected to be one of `totp` and `hotp`.
- `secret` is expected to be base32 string.
- `counter` is only for HOTP method.
- `period` is only for TOTP method minimum size at 5.

```json
{
	"name": "OTP",
	"type": "totp",
	"secret": "<secret>",
	"counter": 0,
	"period": 30
}
```

#### Response

**Success** (0x0)

```json
{
  "status": 0,
  "message": "otp registered"
}
```

**Failure - invalid secret** (0x1)

- Code: `400`

```json
{
  "status": 1,
  "message": "otp registeration failed due to invalid secret"
}
```

**Failure - ISE** (0x1)

- Code: `418`

```json
{
  "status": 1,
  "message": "otp registeration failed due to unknown error"
}
```

### `DELETE /otps`

To delete specific OTP.

#### Request

**Headers**

- Content-Type: `application/json`
- Authentication: `{{ _.token }}`

**Body**

- `id` should be 1 or bigger than 1, and can be retrieved via `GET /otps`.

```json
{
	"id": 0
}
```

#### Response

**Success** (0x0)

```json
{
  "status": 1,
  "message": "otp deleted"
}
```

**Failure - ISE** (0x1)

- Code: `418`

```json
{
  "status": 1,
  "message": "otp deletion failed due to unknown reason"
}
```

# LICENSE

This repository is distributed under [MIT License](/LICENSE).
