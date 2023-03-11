const root = document.getElementById('root')
let socketCreated = false

function createSocket() {
  if (socketCreated) return
  const socket = new WebSocket('ws://localhost:3000');

  socketCreated = true

  socket.addEventListener('error', (err) => {
    console.error(err)
  })

  socket.addEventListener('open', (event) => {
    console.log('socket opened')
    // socket.send('Hello Server!');
  });

  socket.addEventListener('message', (event) => {
    console.log('Message from server ', event.data);
  });

  socket.addEventListener('close', (event) => {
    console.log('socket closed')
    socket.close();
  });
}
