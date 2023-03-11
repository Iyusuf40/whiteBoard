const express = require('express')
const router = require('./routes/index')
const CanvasController = require('./controllers/CanvasController')
const WebSocketServer = require('ws').WebSocketServer

const wss = new WebSocketServer({noServer: true})

wss.on('connection', (ws) => {
  
  ws.on('error', console.error)
  ws.on('message', (data) => {
    const recvd = data.toString('utf8')
    console.log(recvd)
    ws.send('Hello client!')
  })

  ws.on('close', () => {
    console.log('closing...')
    ws.close()
  })

})

const app = express()

app.use(express.static('static'))
app.use(express.json())
app.use(router)

const server = app.listen(3000, () => console.log('listening on 3000'))

server.on('upgrade', function upgrade(req, socket, head) {
  
    const path = req.path
    const parts = path.split('/')
    const key = parts[parts.length - 1]
    const wss = CanvasController.globalSocketsServers[key]
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });

  });
