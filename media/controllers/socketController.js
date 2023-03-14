const uuid = require('uuid');
const redisClient = require('../utils/redis')

class socketController {
	static async createRoom(req, res, next) {
		// lets assume db data object for redis to be
		const user_params = {userId: '2939-23wu-382j-283i', created_at: Date()}
		const roomId = uuid.v4();
		await redisClient.set(roomId, JSON.stringify(user_params), 60);
		res.redirect(`/create-room/${roomId}`)
	}

	static async enterRoom(req, res, next) {
		const { roomLink } = req.body
		if (roomLink) {
			try {
				const roomId = roomLink.split('/')[4] || roomLink
				const user_params = await redisClient.get(roomId)
				console.log(user_params)
				if (!user_params) {
					throw(new Error('Room not found'))
				}
				res.redirect(`/create-room/${roomId}`)
			} catch {
				res.status(404).send('Not found')
			}

		} else {
			res.status(404).send('Please Input room link')
		}

	}

	static inRoom(req, res, next) {
		res.render('room', { roomId: req.params.roomId })
	}
}


module.exports = socketController
