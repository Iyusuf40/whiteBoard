const request = require('request');
const util = require('util');
const dbClient = require('../utils/dbClient');
const assert = require('assert')
request.put = util.promisify(request.put)
request.post = util.promisify(request.post)
const { getKey, postOrPut } = require('./helper')

after(() => {
  dbClient.db.dropDatabase();
});

const baseUrl = 'http://127.0.0.1:3000/'

after(() => {
  dbClient.db.dropDatabase();
});

describe('Test CanvasController', function () {
  describe('Test create canvas', () => {
    it('should fail to create canvas on empty payload', async () => {
      const res = await postOrPut('canvas', 'post', {})
      assert(res.error === 'canvas name missing')
    })

    it('should fail to create canvas on missing key in payload', async () => {
      const payload = {name: 'test'}
      const res = await postOrPut('canvas', 'post', payload)
      assert(res.error === 'key missing')
    })

    it('should fail to create canvas on wrong key in payload', async () => {
      const payload = {name: 'test', key: 'wrong key'}
      const res = await postOrPut('canvas', 'post', payload)
      assert(res.error === 'user Not found')
    })

    it('should create a canvas', async () => {
      const payload = {name: 'test', key: await getKey()}
      const res = await postOrPut('canvas', 'post', payload)
      assert(res.name === 'test')
    })
  })
})
