const express = require('express')
const UsersController = require('../controllers/UsersController')
const CanvasController = require('../controllers/CanvasController')

const router = express.Router()

router.post('/account', UsersController.createAccount)

router.post('/login', UsersController.login)

router.post('/canvas_socket', CanvasController.createSock)

router.put('/canvas_points/:key', CanvasController.updatePoints)

router.get('/canvas/:key/:name', CanvasController.getCanvas)

router.post('/canvas', CanvasController.createCanvas)

module.exports = router
