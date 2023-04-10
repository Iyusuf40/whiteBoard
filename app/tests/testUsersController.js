const request = require('request');
const util = require('util');
const dbClient = require('../utils/dbClient');
const assert = require('assert')
request.put = util.promisify(request.put)
request.post = util.promisify(request.post)
request.get = util.promisify(request.get)
const UsersController = require('../controllers/UsersController')
const { getKey, postOrPut } = require('./helper');

after(() => {
  dbClient.db.dropDatabase();
});

const baseUrl = 'http://127.0.0.1:3000/'

after(() => {
  dbClient.db.dropDatabase();
});

describe('Test UsersController', function () {
  describe('Test /account endpoint -> POST, creates a new user ', () => {
    it('should fail to create new user when id not passed in payload', async () => {
      const res = await postOrPut('account', 'post', {})
      assert(res.error === 'id must be specified')
    })

    it('should fail to create new user when password not passed in payload', async () => {
      const res = await postOrPut('account', 'post', {id: 'test'})
      assert(res.error === 'password must be specified')
    })

    it('should create a new user when password and id are passed in payload', async () => {
      const res = await postOrPut('account', 'post', {id: 'test_user', password: 'test'})
      assert(res.status === 'success')
    })

    it('should fail to create a new user when user exists', async () => {
      const res = await postOrPut('account', 'post', {id: 'test', password: 'test'})
      assert(res.error === 'user exists')
    })
  })
  
  describe('Test /login endpoint -> POST, logs a user in', () => {
    it('should fail to login user when id not passed in payload', async () => {
      const res = await postOrPut('login', 'post', {})
      assert(res.error === 'id must be specified')
    })

    it('should fail to login user when password not passed in payload', async () => {
      const res = await postOrPut('login', 'post', {id: 'test'})
      assert(res.error === 'password must be specified')
    })

    it('should login a user when correct password and correct id are passed in payload', async () => {
      const res = await postOrPut('login', 'post', {id: 'test', password: 'test'})
      assert(res.key)
    })

    it('should fail to login new user when user does not exist', async () => {
      const res = await postOrPut('login', 'post', {id: 'does_not_exist', password: 'test'})
      assert(res.error === 'user Not found')
    })

    it('should fail to login new user when wrong password is passed', async () => {
      const res = await postOrPut('login', 'post', {id: 'test', password: 'wrong password'})
      assert(res.error === 'user Not found')
    })
  }) 
})
