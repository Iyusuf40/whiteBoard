const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const router = require('./routes/index')
global.io = require ('socket.io')(server) //sorry man, Hate globals but had to do this

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(router)

io.on('connection', socket => {
	socket.on('join-room', (roomId, userId) => {
		socket.join(roomId);
		socket.on('ready', () => {
			socket.to(roomId).emit('user-connected', userId)
		})

		socket.on('disconnect', () => {
			socket.to(roomId).emit('user-disconnected', userId)
		})
	});
})

server.listen(3000, () => {
	console.log('listening on port 3000');
})
