const UsersController = require('./UsersController')

class MediaController {
  
  static roomsRepo = {}  // for testing, using redis would be better

  static async createMediaRoom(req, res) {
    const key = req.body.key
    const peerId = req.body.peerId
    if (!key) return res.status(401).send({error: 'key must be specified'})
    if (!peerId) return res.status(401).send({error: 'peerId must be specified'})
    const user = await UsersController.findUserByKey(key)
    if (!user) return res.status(403).send({error: 'no user found with this key'})
    MediaController.roomsRepo[key] = [peerId]
    res.status(201).send({staus: 'media room created successfully', key})
  }

  static async joinMediaRoom(req, res) {
    const peerId = req.body.peerId
    const key = req.body.key
    if (!key) return res.status(401).send({error: 'key must be specified'})
    if (!peerId) return res.status(401).send({error: 'peerId must be specified'})
    if (!MediaController.roomsRepo[key]) return res.status(404).send({
        error: 'room not found'
    })
    MediaController.insertIntoRoom(key, peerId)
    return res.send({peers: MediaController.roomsRepo[key]})
  }

  static async insertIntoRoom(key, peerId) {
    if (MediaController.roomsRepo[key].includes(peerId)) return
    MediaController.roomsRepo[key].push(peerId)
  }

  static async removeFromRoom(key, peerId) {
    const index = MediaController.roomsRepo[key].indexOf(peerId)
    if (index === -1) return
    MediaController.roomsRepo[key].splice(index, 1)
  }
}

module.exports = MediaController
