const socket = require('socket.io');
const uuid = require('uuid');

class socketController {
	static getRoom(req, res, next) {
		res.redirect(`/create-room/${uuid.v4()}`)
	}

	static inRoom(req, res, next) {
		// const io = req.app.get('socketio')
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
		res.render('room', { roomId: req.params.roomId })
	}
}


module.exports = socketController
