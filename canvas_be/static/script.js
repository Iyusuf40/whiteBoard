const root = document.getElementById('root')
const canvasForm = document.getElementById('create--canvas--form')
const createRoomBtn = document.getElementById('create--wss')
const modeButtons = document.getElementsByClassName('mode--buttons')
const clearCanvasBtn = document.getElementById('clear--canvas')
const startMediaBtn = document.getElementById('start--media')


let drawOpts = {
  mode: ''
}

Array.from(modeButtons).forEach(function(el) {
  el.addEventListener('click', setMode)
})

function setMode(e) {
  drawOpts.mode = e.target.getAttribute('data-mode')
}


let key = null
let socket = null
let canvasName = null
let canvas = null
const baseUrl = 'http://localhost:3000/'
let trackClick = false
let globalPoints = []
let pointsBuffer = []
let globalElRepo = {}
const myPeer = new Peer()
let admin = false
let roomCreated = false
let startMedia = false
let peerId = null
let peers = {}

myPeer.on('open', (id) => peerId = id)

let socketCreated = false

canvasForm.addEventListener('submit', handleCanvasCreation)
createRoomBtn.addEventListener('click', handleCreateWss)
clearCanvasBtn.addEventListener('click', sendClearCanvasToBE)
startMediaBtn.addEventListener('click', handleStartMedia)

setKey()
