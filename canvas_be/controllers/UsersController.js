const dbClient = require('../utils/dbClient')
const v4 = require('uuid').v4

class UsersController {
  static async createAccount(req, res) {
    if (dbClient.isAlive()) {
      const id = req.body.id
      if (!id) return res.status(401).send({error: 'id must be specified'})
      const user = await UsersController.findUser(id)
      if (user) return res.status(403).send({error: 'user exists'})
      const key = v4()
      const newUser = {id, key}
      await dbClient.saveUser(newUser)
      res.status(201).send({staus: 'success', key})
    } else {
      res.status(500).send({error: 'storage unavailable'})
    }
  }

  static async login(req, res) {
    if (!dbClient.isAlive()) return res.status(500).send({error: 'storage unavailable'})
    const id = req.body.id
    if (!id) return res.status(401).send({error: 'id must be specified'})
    const user = await UsersController.findUser(id)
    if (!user) return res.status(404).send({error: 'user Not found'})
    return res.send({key: user.key})
  }

  static async findUser(id) {
    if (!id) return null
    const user = await dbClient.findByColAndFilter('users', 'id', id)
    return user
  }

  static async findUserByKey(key) {
    if (!key) return null
    const user = await dbClient.findByColAndFilter('users', 'key', key)
    return user
  }
}

module.exports = UsersController
