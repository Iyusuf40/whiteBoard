const dbClient = require('../utils/dbClient')
const UsersController = require('./UsersController')
const MediaController = require('./MediaController')
const WebSocketServer = require('ws').WebSocketServer
const v4 = require('uuid').v4

class CanvasController {

  static globalSocketsServers = {}
  static wsToPeerIdMap = {}

  static async createSock(req, res) {
    if (!dbClient.isAlive()) return res.status(500).send({error: 'storage unavailable'})

    const key = req.body.key

    if (!key) return res.status(401).send({error: 'key must be specified'})
    const user = await UsersController.findUserByKey(key)
    if (!user) return res.status(404).send({error: 'user Not found'})
    if (CanvasController.globalSocketsServers[key]) return res.send({message: 'socket alive'})

    /**
     * 
     * implement service that cleans socket servers after a period
     * 
     * ? a que that delays for eg 2hrs and then closes the wss
     * 
     */
    const wss = new WebSocketServer({noServer: true})
    /**
     * 
     * Alternatively: create 1 global WSS
     * virtualize each room with key
     * for every new connection add ws object to a list of ws objects
     * indexed by key. so if a msg comes in we loop over each ws in
     * keyed array and send msgs there
     * 
     */
    wss.on('connection', (ws, req) => {
      const path = req.url
      const parts = path.split('/')
      const key = parts[parts.length - 1]
      ws.id = v4()  //  assign an id to the bound socket
      ws.on('error', console.error)
      ws.on('message', (data) => {
        const recvd = data.toString('utf8')
        const payload = JSON.parse(recvd)
        const currWss = CanvasController.globalSocketsServers[key]
        // the above code is unnecessary because currWss === wss
        if (payload.action === 'bind peerId to ws') {
          CanvasController.wsToPeerIdMap[ws.id] = payload.payload  // peerId
        } else {  // broadcast
          currWss.clients.forEach(function each(client) {
            if (ws !== client) {
              client.send(recvd);
            }
          });
        }
      })
      
      ws.on('close', async () => {
        console.log('closing socket with id', ws.id)
        const id = ws.id
        const peerId = CanvasController.wsToPeerIdMap[id]
        delete(CanvasController.wsToPeerIdMap[id]) // remember to do this with redis
        if (!Array.from(wss.clients).length) {
          // no any client connected to listening socket anymore
          // close it and cleam CanvasController.globalSocketServers
          delete(CanvasController.globalSocketsServers[key]) // implement with redis
          wss.close()
          console.log('closing web socket server with id:', key)
          // no clients to broadcast to at this juncture therefore return
          return
        }

        await MediaController.removeFromRoom(key, peerId)
        const message = JSON.stringify({payload: peerId, action: 'peer-disconnect'})

        wss.clients.forEach(function each(client) {
          if (ws !== client) {
            client.send(message);
          }
        });
        ws.close()
      })
      
    })

    CanvasController.globalSocketsServers[key] = wss

    // setTimeout(() => CanvasController.closeWss(key), 5000)

    return res.status(201).send({message: 'web socket server created successfully'})
  }

  static async closeWss(key) {
    if (!key) return
    const wss = CanvasController.globalSocketsServers[key]
    if (!wss) return
    wss.close()
    console.log(`WSS with key: ${key} closed`)
    delete (CanvasController.globalSocketsServers[key])
  }

  static async updatePoints(req, res) {
    if (!dbClient.isAlive()) return res.status(500).send({error: 'storage unavailable'})
    const key = req.params.key
    const name = req.body.name
    const payload = req.body.payload
    if (!name) return res.status(403).send({error: 'canvas name missing'}) 
    if (!key) return res.status(403).send({error: 'key missing'}) 
    if (
      !payload || 
      !CanvasController.isValidStackStructure(payload)
    ) return res.status(403).send({error: 'invalid payload: mainStack structure'}) 
    const canvasName = `${key}:${name}`
    const canvas = await CanvasController.findCanvas(canvasName)
    if (!canvas) return res.status(404).send({error: 'canvas Not found'})
    const filter = {name: canvasName}

    const resp = await dbClient.updateOne('canvas', filter, 'points', payload)

    if (!resp.modifiedCount) return res.status(403).send({error: 'no records changed'})
    return res.send({message: 'updated successfully'})
  }

  static async clearPoints(req, res) {
    if (!dbClient.isAlive()) return res.status(500).send({error: 'storage unavailable'})
    const key = req.params.key
    const name = req.body.name
    if (!name) return res.status(403).send({error: 'canvas name missing'}) 
    if (!key) return res.status(403).send({error: 'key missing'}) 
    const canvasName = `${key}:${name}`
    const canvas = await CanvasController.findCanvas(canvasName)
    if (!canvas) return res.status(404).send({error: 'canvas Not found'})
    const filter = {name: canvasName}
    const resp = await dbClient.updateOne('canvas', filter, `points`, {})
    if (!resp.modifiedCount) return res.status(500).send({error: 'update failed / canvas was empty'})
    return res.send({message: 'updated successfully'})
  }

  static async getCanvas(req, res) {
    if (!dbClient.isAlive()) return res.status(500).send({error: 'storage unavailable'})
    const key = req.params.key
    const name = req.params.name
    if (!name) return res.status(403).send({error: 'canvas name missing'}) 
    if (!key) return res.status(403).send({error: 'key missing'})
    const canvasName = `${key}:${name}`
    const canvas = await CanvasController.findCanvas(canvasName)
    if (!canvas) return res.status(404).send({error: 'canvas Not found'})
    delete (canvas._id)
    return res.send(canvas)
  }

  static async createCanvas(req, res) {
    if (!dbClient.isAlive()) return res.status(500).send({error: 'storage unavailable'})
    const key = req.body.key
    const name = req.body.name
    if (!name) return res.status(403).send({error: 'canvas name missing'}) 
    if (!key) return res.status(403).send({error: 'key missing'}) 
    const user = await UsersController.findUserByKey(key)
    if (!user) return res.status(404).send({error: 'user Not found'})   
    const canvasName = `${key}:${name}`
    const canvas = await CanvasController.findCanvas(canvasName)
    if (canvas) return res.status(403).send({error: 'canvas already exists'}) 
    await dbClient.saveCanvas({name: canvasName, points: []})
    return res.status(201).send({name: name})    
  }

  static async findCanvas(name) {
    if (!name) return null
    const canvas = await dbClient.findByColAndFilter('canvas', 'name', name)
    return canvas
  }

  static isValidStackStructure(stack) {

    // if (!Object.keys(stack).length) return false

    // to implement

    return true
  }
}

module.exports = CanvasController
