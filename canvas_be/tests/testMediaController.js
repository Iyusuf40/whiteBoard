const { expect } = require('chai');
const uuid = require('uuid');
const request = require('request');
const util = require('util');
request.put = util.promisify(request.put)
request.post = util.promisify(request.post)

describe('Tests for MediaController Api', function() {
  describe('Test for createMediaRoom', function() {
    const url = 'http://127.0.0.1:3000/create_media_room'

    it('should Test createMediaRoom when no key or peerId is provided', async function() {
      const resp = await request.post(url, {json: true});
      expect(resp.statusCode).to.equal(401)
      expect(resp.body).to.deep.equal({ error: 'key must be specified' })
    })

    it('should Test createMediaRoom when no key is provided', async function() {
      const resp = await request.post({
        url,
        json: true,
        body: {peerId: uuid.v4()},
      });
      expect(resp.statusCode).to.equal(401)
      expect(resp.body).to.deep.equal({ error: 'key must be specified' })
    })

    it('should Test createMediaRoom when no key is provided', async function() {
      const resp = await request.post({
        url,
        json: true,
        body: {peerId: uuid.v4()},
      });
      expect(resp.statusCode).to.equal(401)
      expect(resp.body).to.deep.equal({ error: 'key must be specified' })
    })

    it('should Test createMediaRoom when a valid user is entered', async function() {
      // Please input your personal key in the database
      const key = '694e7dc2-3b74-4914-a9c7-70248e38f175';
      const resp = await request.post({
        url,
        json: true,
        body: {peerId: uuid.v4(), key},
      });
      expect(resp.statusCode).to.equal(201)
      expect(resp.body).to.deep.equal({ staus: 'media room created successfully', key })
    })

    it('should Test createMediaRoom when a non-valid user is entered', async function() {
      // This key does not exist
      const key = '4628edc2-3c97-4344-a9c7-ec78e9914e75';
      const resp = await request.post({
        url,
        json: true,
        body: {peerId: uuid.v4(), key},
      });
      expect(resp.statusCode).to.equal(403)
      expect(resp.body).to.deep.equal({error: 'no user found with this key'})
    })

  });


  describe('Test for joinMediaRoom', function() {
    const url = 'http://127.0.0.1:3000/join_media_room'

    it('should Test joinMediaRoom when no key or peerId is provided', async function() {
      const resp = await request.put(url, {json: true});
      expect(resp.statusCode).to.equal(401)
      expect(resp.body).to.deep.equal({ error: 'key must be specified' })
    })

    it('should Test joinMediaRoom when no key is provided', async function() {
      const resp = await request.put({
        url,
        json: true,
        body: {peerId: uuid.v4()},
      });
      expect(resp.statusCode).to.equal(401)
      expect(resp.body).to.deep.equal({ error: 'key must be specified' })
    })

    it('should Test joinMediaRoom when no key is provided', async function() {
      const resp = await request.put({
        url,
        json: true,
        body: {peerId: uuid.v4()},
      });
      expect(resp.statusCode).to.equal(401)
      expect(resp.body).to.deep.equal({ error: 'key must be specified' })
    })
  });


});
