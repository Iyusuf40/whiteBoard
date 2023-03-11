const dbClient = require('../utils/dbClient')
const UsersController = require('./UsersController')
const WebSocketServer = require('ws').WebSocketServer

class CanvasController {

  static globalSocketsServers = {}

  static async createSock(req, res) {
    if (!dbClient.isAlive()) return res.status(500).send({error: 'storage unavailable'})

    // create server and add to globalSS
    const id = req.body.id
    const key = req.body.key
    // const name = req.body.name
    if (!id) return res.status(401).send({error: 'id must be specified'})
    if (!key) return res.status(401).send({error: 'key must be specified'})
    const user = await UsersController.findUser(id)
    if (!user) return res.status(404).send({error: 'user Not found'})
    const wss = new WebSocketServer({noServer: true})
    wss.on('connection', (ws) => {
  
      ws.on('error', console.error)
      ws.on('message', (data) => {
        const recvd = data.toString('utf8')
        console.log(recvd)
        ws.send('Hello client!')
      })
      
      ws.on('close', () => {
        console.log('closing...')
        ws.close()
      })
      
    })

    CanvasController.globalSocketsServers[key] = wss

    return res.status(201).send({message: 'web socket server created successfully'})
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
    const id = req.body.id
    const key = req.body.key
    const name = req.body.name
    const user = await UsersController.findUser(id)
    if (!user) return res.status(404).send({error: 'user Not found'})   
    if (!name) return res.status(403).send({error: 'canvas name missing'}) 
    if (!key) return res.status(403).send({error: 'key missing'}) 
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
