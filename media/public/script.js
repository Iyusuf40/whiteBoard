const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
	host: '/',
	port: '3001',
})
const peers = []

const myVideo = document.createElement('video')
myVideo.muted = true

myPeer.on('open', id => {
	socket.emit('join-room', ROOM_ID, id);
})

// remember to handle errors && also  put in a function
navigator.mediaDevices.getUserMedia({
	video: true,
	audio: true,
}).then((stream) => {
	addVideoStream(myVideo, stream);

	myPeer.on('call', function(call) {
		peers[call.peer] = call;
		call.answer(stream);
		const video = document.createElement('video')
		call.on('stream', userVideoStream => {
			addVideoStream(video, userVideoStream);
		})
		call.on('close', () => {
			video.remove();
		});
	})
	socket.emit('ready');

	socket.on('user-connected', userId => {
		connectToNewUser(userId, stream);
	})

	socket.on('user-disconnected', userId => {
		if (peers[userId]) peers[userId].close();
	})

})


function connectToNewUser(userId, stream) {
	const call = myPeer.call(userId, stream);
	const video = document.createElement('video');
	call.on('error', (err) => {
		console.log(err);
	})
	call.on('stream', userVideoStream => {
		addVideoStream(video, userVideoStream);
	});
	call.on('close', () => {
		video.remove();
	});
	peers[userId] = call;
	return call
}

function addVideoStream(video, stream) {
	video.srcObject = stream;
	video.addEventListener('loadedmetadata', () => {
		video.play();
	})
	videoGrid.append(video);
}
