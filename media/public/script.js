$( document ).ready( function() {
  function roomLogic() {
    const socket = io('/')

    $('body').append($('<div>').addClass('video-grid'))
    const myPeer = new Peer(undefined, {
      host: '/',
      port: '3001',
    })
    let localStream;
    const peers = {}

    let $video = $('<video>', {'class': 'myVideo', 'id': '1'})
    $video.prop('muted', true);
    let $myBtnAudio = $('<button>', { 'class': 'myBtnAudio' })
    let $myBtnVideo = $('<button>', { 'class': 'myBtnVideo' })

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
          $('.video-grid').append($video)
          addVideoStream('1', stream, undefined);
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
      stream.getVideoTracks()[0].enabled = true;
      $myBtnAudio.click(ToggleAudio)
      $myBtnVideo.click(ToggleVideo)
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
        $('.video-grid').append($('<video>', { 'class': 'newClient', 'id': `${ call.peer }` }))
        call.on('stream', userVideoStream => {
          addVideoStream(call.peer, userVideoStream, call);
          console.log('Stream is called')
        })
      })
      socket.emit('ready');
    }

    function connectToNewUser(userId, stream) {
      const call = myPeer.call(userId, stream);
      $('.video-grid').append($('<video>', { 'class': 'newClient', 'id': `${ userId }` }))
      call.on('error', (err) => {
        console.log(err);
      })
      call.on('stream', userVideoStream => {
        addVideoStream(userId, userVideoStream, call);
        console.log('created room user stream');
      });
    }

    function addVideoStream(id, stream, call) {
      const video = document.getElementById(id)
      video.srcObject = stream
      video.addEventListener('loadedmetadata', () => {
          video.play();
      })
      if (call !== undefined) {
        peers[call.peer] = call;
        call.on('close', () => {
          $(`#${id}`).remove();
          delete peers[call.peer];
        });
      } else {
        $myBtnAudio.text('ToggleAudio')
        $myBtnVideo.text('ToggleVideo')
        $('body').append($myBtnAudio, $myBtnVideo)
      }
    }
    userMedia()
  }
})
