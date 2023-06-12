const request = require('request');
const util = require('util');
const dbClient = require('../utils/dbClient');
const assert = require('assert')
request.put = util.promisify(request.put)
request.post = util.promisify(request.post)
request.get = util.promisify(request.get)
const CanvasController = require('../controllers/CanvasController')
const WebSocketServer = require('ws').WebSocketServer
const { getKey, postOrPut } = require('./helper');
const { get } = require('request');

after(() => {
  dbClient.db.dropDatabase();
});

const baseUrl = 'http://127.0.0.1:3000/'

after(() => {
  dbClient.db.dropDatabase();
});

describe('Test CanvasController', function () {
  describe('Test create canvas endpoint', () => {
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

  describe('Test get canvas endpoint', () => {
    it('should fail to get any canvas with wrong key and name', async () => {
      const res = await request.get(baseUrl + 'canvas/wrong_key/wrong_name')
      assert(res.statusCode === 404)
    })

    it('should fail to get any canvas with right key but wrong name', async () => {
      const key = await getKey()
      const res = await request.get(baseUrl + `canvas/${key}/wrong_name`)
      assert(res.statusCode === 404)
    })

    it('should get a canvas with right key and right name', async () => {
      const key = await getKey()
      const payload = {name: 'test', key}
      await postOrPut('canvas', 'post', payload)
      const res = await request.get(baseUrl + `canvas/${key}/test`)
      assert(res.statusCode === 200)
    })
  })

  describe('Test /canvas_points/:key endpoint -> creates or deletes inks', () => {
    const payload = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
    const body = {name: 'test', payload}
    it('should fail to persist ink when canvas does not exist cos of wrong key', async () => {
      const res = await postOrPut('canvas_points/wrong_key', 'put', body)
      assert(res.error === 'canvas Not found')
    })

    it('should fail to persist ink when user with key exist but canvas does not exits', async () => {
      const key = await getKey()
      const body = {name: 'doesnt exist', payload}
      const res = await postOrPut(`canvas_points/${key}`, 'put', body)
      assert(res.error === 'canvas Not found')
    })

    it('should fail to persist ink when canvas name not passed in payload', async () => {
      const key = await getKey()
      const body = {name: '', payload}
      const res = await postOrPut(`canvas_points/${key}`, 'put', body)
      assert(res.error === 'canvas name missing')
    })

    it('should fail to persist ink when payload is empty', async () => {
      const key = await getKey()
      const body = {name: 'test', payload: []}
      const res = await postOrPut(`canvas_points/${key}`, 'put', body)
      assert(res.error === 'invalid payload: mainStack structure')
    })

    it('should fail to persist ink when payload structure is not correct', async () => {
      const key = await getKey()
      const payload = [[]]  // one step missing
      const body = {name: 'test', payload}
      const res = await postOrPut(`canvas_points/${key}`, 'put', body)
      assert(res.error === 'invalid payload: mainStack structure')
    })

    it('should successfully persist ink in storage', async () => {
      const key = await getKey()
      const res = await postOrPut(`canvas_points/${key}`, 'put', body)
      assert(res.message === 'updated successfully')
    })

    it('should validate that successfully persisted ink exists in storage', async () => {
      const key = await getKey()
      const res = await request.get(baseUrl + `canvas/${key}/test`)
      assert(res.statusCode === 200)
      const canvas = JSON.parse(res.body)
      const points = canvas.points
      assert(points.length === payload.length)
    })
  })

  describe('Test /clear_canvas_points/:key endpoint -> clears inks from storage', () => {
    const payload = {points: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]], action: 'write'}
    const body = {name: 'test', payload}

    it('should fail to clear when no canvas name is supplied', async () => {
      const key = await getKey()
      const res = await postOrPut(`clear_canvas_points/${key}`, 'put', {})
      assert(res.error === 'canvas name missing')
    })

    it('should fail to clear when canvas does not exist', async () => {
      const key = await getKey()
      const res = await postOrPut(`clear_canvas_points/${key}`, 'put', {name: 'does not exist'})
      assert(res.error === 'canvas Not found')
    })

    it('should fail to clear when canvas does not exist', async () => {
      const key = await getKey()
      const res = await postOrPut(`clear_canvas_points/wrong_key`, 'put', {name: 'does not exist'})
      assert(res.error === 'canvas Not found')
    })

    it('should clear canvas successfully', async () => {
      const key = await getKey()
      await postOrPut(`canvas_points/${key}`, 'put', body) // persist ink in storage
      const res = await postOrPut(`clear_canvas_points/${key}`, 'put', {name: 'test'})
      assert(res.message === 'updated successfully')
    })

    it('should return error if canvas is empty', async () => {
      const key = await getKey()
      const res = await postOrPut(`clear_canvas_points/${key}`, 'put', {name: 'test'})
      assert(res.error === 'update failed / canvas was empty')
    })
  })

  describe('Test canvas_socket endpoint -> POST, creates a web socket server', () => {

    it('should fail to create WSS if key not sent in payload', async () => {
      const res = await postOrPut('canvas_socket', 'post', {})
      assert(res.error === 'key must be specified')      
    })

    it('should fail to create WSS if invalid is key sent in payload', async () => {
      const res = await postOrPut('canvas_socket', 'post', {key: 'wrong key'})
      assert(res.error === 'user Not found')      
    })

    it('should create a WSS if correct key is passed', async () => {
      const key = await getKey()
      const res = await postOrPut('canvas_socket', 'post', {key})
      assert(res.message === 'web socket server created successfully')      
    })

    it('should not create a new WSS if a user has one running', async () => {
      const key = await getKey()
      const res = await postOrPut('canvas_socket', 'post', {key})
      assert(res.message === 'socket alive')      
    })
  })
  
})
