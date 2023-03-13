const dbClient = require('../utils/dbClient')
const CanvasController = require('../controllers/CanvasController')

class AppController {
  static async join(req, res) {
    if (!dbClient.isAlive()) return res.status(500).send({error: 'storage unavailable'})
    const key = req.params.key
    const name = req.params.canvas
    if (!key || !name) return res.status(403).send({error: 'missing required params'})
    if (!CanvasController.globalSocketsServers[key]) {
      return res.status(403).send({error: 'no socket with the key you provided'})
    }
    const canvasName = `${key}:${name}`
    // const canvasName = name
    const canvas = await CanvasController.findCanvas(canvasName)
    if (!canvas) return res.status(403).send({error: 'no canvas with the name you provided'})
    return res.render('index', {key: key, canvas: canvasName})
  }
}

module.exports = AppController
