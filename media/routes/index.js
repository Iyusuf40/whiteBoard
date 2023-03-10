const express = require('express');
const socketController = require('../controllers/socketController');

const router = express.Router();

// router.use(express.static('public'))

// userController will use the route later on
router.get('/', (req, res) => {
	res.send('Hello World!');
})

router.get('/create-room', socketController.getRoom)

router.get('/create-room/:roomId', socketController.inRoom)

module.exports = router;
