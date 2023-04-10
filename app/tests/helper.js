const request = require('request');
const util = require('util');
request.put = util.promisify(request.put)
request.post = util.promisify(request.post)

const baseUrl = 'http://127.0.0.1:3000/'
let key = null

const user_cred = {
    id: 'test',
    password: 'test'
  }
  
async function getKey() {
  if (key) return key
  let user = await request.post({
    url: baseUrl + 'account',
    json: true,
    body: user_cred
  })
  if (user.body.status === 'success') return user.body.key;
  user = await request.post({
    url: baseUrl + 'login',
    json: true,
    body: user_cred
  })
  key = user.body.key
  return key
}

async function postOrPut(path = '', method='post', body={}) {
  let data
  if (method === 'post') {
    data = await request.post({
      url: baseUrl + path,
      json: true,
      body
    })
  } else {
    data = await request.put({
      url: baseUrl + path,
      json: true,
      body
    })
  }
  return data.body
}

module.exports.getKey = getKey
module.exports.postOrPut = postOrPut
  