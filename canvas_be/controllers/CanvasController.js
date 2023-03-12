const dbClient = require('../utils/dbClient')
const UsersController = require('./UsersController')
const WebSocketServer = require('ws').WebSocketServer
const WebSocket = require('ws').WebSocket

class CanvasController {

  static globalSocketsServers = {}

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
      ws.on('error', console.error)
      ws.on('message', (data) => {
        const recvd = data.toString('utf8')
        const currWss = CanvasController.globalSocketsServers[key]
        // the above code is unnecessary because currWss === wss
        currWss.clients.forEach(function each(client) {
          if (ws !== client) {
            client.send(recvd);
          }
        });
        console.log(recvd)
      })
      
      ws.on('close', () => {
        console.log('closing...')
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
    const point = req.body.point
    if (!name) return res.status(403).send({error: 'canvas name missing'}) 
    if (!key) return res.status(403).send({error: 'key missing'}) 
    if (!point) return res.status(403).send({error: 'point missing'}) 
    const x = point.x
    const y = point.y
    const action = req.body.action
    const canvasName = `${key}:${name}`
    const canvas = await CanvasController.findCanvas(canvasName)
    if (!canvas) return res.status(404).send({error: 'canvas Not found'})
    if (action == 'delete') {
      const filter = {name: canvasName, points: point}
      const r = await dbClient.deletePoint('canvas', filter, `points.${x}:${y}`, {})
      if (!r) return res.status(500).send({error: 'update failed'})
      return res.send({messgae: 'updated successfully'})
    }
    const filter = {name: canvasName}
    const resp = await dbClient.updateOne('canvas', filter, `points.${x}:${y}`, point)
    if (!resp) return res.status(500).send({error: 'update failed'})
    return res.send({messgae: 'updated successfully'})
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
    await dbClient.saveCanvas({name: canvasName, points: {}})
    return res.status(201).send({name: name})    
  }

  static async findCanvas(name) {
    if (!name) return null
    const canvas = await dbClient.findByColAndFilter('canvas', 'name', name)
    return canvas
  }
}

module.exports = CanvasController
