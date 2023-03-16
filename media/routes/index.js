const express = require('express');
const socketController = require('../controllers/socketController');
const userController = require('../controllers/userController');

const router = express.Router();
router.use(express.json())

// router.use(express.static('public'))

// userController will use the route later on
router.get('/', userController.getUser)

router.post('/account', userController.createAccount)

// router.post('/login', userController.login)

router.post('/create-room', socketController.enterRoom)

router.get('/create-room', socketController.createRoom)

router.get('/create-room/:roomId', socketController.inRoom)

module.exports = router;
