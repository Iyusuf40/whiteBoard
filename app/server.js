const express = require('express')
const cors = require('cors')
const router = require('./routes/index')
const CanvasController = require('./controllers/CanvasController')
const PORT = process.env.NODE_PORT || 3001
const app = express()

app.use(cors())
app.use(express.static('static'))
app.use(express.json())
app.set('view engine', 'ejs')
app.use(router)

const server = app.listen(PORT, () => console.log('listening on', PORT))

server.on('upgrade', function upgrade(req, socket, head) {

    const path = req.url
    const parts = path.split('/')
    const key = parts[parts.length - 1]
    const wss = CanvasController.globalSocketsServers[key]
    if (!wss) return
    wss.handleUpgrade(req, socket, head, function done(ws) {
      wss.emit('connection', ws, req);
    });

  });
