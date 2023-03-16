const videoGrid = document.getElementById('video-grid')
const audioToggle = document.getElementById('myBtn')
const myPeer = new Peer()

let localStream;

const myVideo = document.createElement('video')
myVideo.muted = true

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
})

// remember to handle errors && also  put in a function
async function userMedia() {
	try {
		navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true,
		}).then((stream) => {
			setupMetadata(stream);
			addVideoStream(myVideo, stream, undefined);
			answerCall(stream);
			userStatus(stream);
		}).catch((err) => {
			console.log(err);
		})
	} catch (err) {
		console.log(err);
	}
}

function userStatus(stream) {
	socket.on('user-connected', userId => {
		connectToNewUser(userId, stream);
	})
	socket.on('user-disconnected', userId => {
		if (peers[userId]) peers[userId].close();
	})
}

function setupMetadata(stream) {
	localStream = stream;
	stream.getAudioTracks()[0].enabled = false;
	stream.getVideoTracks()[0].enabled = false;
	document.getElementById('myBtn').addEventListener("click", ToggleAudio)
	document.getElementById('myBtn-v').addEventListener("click", ToggleVideo)

};

function ToggleVideo() {
	if (localStream.getVideoTracks()[0].enabled) {
		console.log('Offing the Video')
		localStream.getVideoTracks()[0].enabled = false
	}
	else if (!localStream.getVideoTracks()[0].enabled){
		console.log('Oning the video')
		localStream.getVideoTracks()[0].enabled = true
	}
}

function ToggleAudio() {
	if (localStream.getAudioTracks()[0].enabled) {
		console.log('Offing the mic')
		localStream.getAudioTracks()[0].enabled = false
	}
	else if (!localStream.getAudioTracks()[0].enabled){
		console.log('Oning the mic')
		localStream.getAudioTracks()[0].enabled = true
	}
}

function answerCall(stream) {
	myPeer.on('call', call => {
		call.answer(stream);
		const video = document.createElement('video')
		call.on('stream', userVideoStream => {
			addVideoStream(video, userVideoStream, call);
			console.log('Stream is called')
		})
	})
	socket.emit('ready');
}

function connectToNewUser(userId, stream) {
	const call = myPeer.call(userId, stream);
	const video = document.createElement('video');
	call.on('error', (err) => {
		console.log(err);
	})
	call.on('stream', userVideoStream => {
		addVideoStream(video, userVideoStream, call);
		console.log('created room user stream')
	});
}

function addVideoStream(video, stream, call) {
	video.srcObject = stream;
	video.addEventListener('loadedmetadata', () => {
		video.play();
	})
	videoGrid.append(video);
	if (call !== undefined) {
		peers[call.peer] = call;
		call.on('close', () => {
			video.remove();
			delete peers[call.peer];
		});
	}
}

userMedia()
