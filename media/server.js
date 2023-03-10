const express = require('express');
const app = express();
const server = require('http').Server(app);
const router = require('./routes/index')
global.io = require ('socket.io')(server) //sorry man, Hate globals but had to do this

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(router)

server.listen(3000, () => {
	console.log('listening on port 3000');
})
