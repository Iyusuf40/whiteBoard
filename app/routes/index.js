const express = require('express')
const UsersController = require('../controllers/UsersController')
const CanvasController = require('../controllers/CanvasController')
const AppController = require('../controllers/AppController')
const MediaController = require('../controllers/MediaController')

const router = express.Router()

router.post('/account', UsersController.createAccount)

router.post('/login', UsersController.login)

router.post('/canvas_socket', CanvasController.createSock)

router.put('/canvas_points/:key', CanvasController.updatePoints)

router.put('/clear_canvas_points/:key', CanvasController.clearPoints)

router.get('/canvas/:key/:name', CanvasController.getCanvas)

router.post('/canvas', CanvasController.createCanvas)

router.get('/join/:key/:canvas', AppController.join)

router.get('/enter/:key', AppController.enter)

router.post('/create_media_room', MediaController.createMediaRoom)

router.put('/join_media_room', MediaController.joinMediaRoom)

module.exports = router
