const videoGrid = document.getElementById('video-grid')
let localStream;

const myVideo = document.createElement('video')
myVideo.muted = true

// remember to handle errors && also  put in a function
async function userMedia() {
	try {
		return navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true,
		}).then((stream) => {
			setupMetadata(stream);
			addVideoStream(myVideo, stream, undefined);
			answerCall(stream);
            return stream
		}).catch((err) => {
			console.log(err);
		})
	} catch (err) {
		console.log(err);
	}
}

function setupMetadata(stream) {
    localStream = stream
	stream.getAudioTracks()[0].enabled = false;
	stream.getVideoTracks()[0].enabled = false;
	const toggleAudioBtn = document.getElementById('myBtn')
	const toggleVideoBtn = document.getElementById('myBtn-v')
	toggleAudioBtn.addEventListener("click", ToggleAudio)
	toggleVideoBtn.addEventListener("click", ToggleVideo)
	toggleAudioBtn.style.display = 'inline'
	toggleVideoBtn.style.display = 'inline'
};

function addVideoStream(video, stream, call) {
	video.srcObject = stream;
	video.addEventListener('loadedmetadata', () => {
		video.play();
	})
	videoGrid.append(video);
	if (call !== undefined) {
		peers[call.peer] = video;
		call.on('close', () => {
			video.remove();
		});
	}
}

function answerCall(stream) {
	myPeer.on('call', call => {
		call.answer(stream);
		const video = document.createElement('video')
		call.on('stream', userVideoStream => {
			addVideoStream(video, userVideoStream, call);
		})
	})
}

function ToggleVideo() {
	if (localStream.getVideoTracks()[0].enabled) {
		localStream.getVideoTracks()[0].enabled = false
	}
	else if (!localStream.getVideoTracks()[0].enabled){
		localStream.getVideoTracks()[0].enabled = true
	}
}

function ToggleAudio() {
	if (localStream.getAudioTracks()[0].enabled) {
		localStream.getAudioTracks()[0].enabled = false
	}
	else if (!localStream.getAudioTracks()[0].enabled){
		localStream.getAudioTracks()[0].enabled = true
	}
}


async function connectToNewUser(userId, stream) {
	const call = myPeer.call(userId, stream);
	const video = document.createElement('video');
	call.on('error', (err) => {
		console.log(err);
	})
	call.on('stream', userVideoStream => {
		addVideoStream(video, userVideoStream, call);
	});
}
