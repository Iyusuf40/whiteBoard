const root = document.getElementById('root')
const canvasForm = document.getElementById('create--canvas--form')
const createRoomBtn = document.getElementById('create--wss')
const modeButtons = document.getElementsByClassName('mode--buttons')
const clearCanvasBtn = document.getElementById('clear--canvas')
const startMediaBtn = document.getElementById('start--media')
let noDrawBtn
let drawBtn
let allowTouchStart = true
let ctx

let mainStack = new Stack()
let undoStack = new Stack()
let currDraw = []

let ofsetX = 0
let ofsetY = 0

const urButtons = document.getElementsByClassName('undoredo--buttons')

let drawOpts = {
  mode: ''
}

Array.from(modeButtons).forEach(function(el) {
  el.addEventListener('click', setMode)
  if (el.getAttribute('action') === 'draw') {
    drawBtn = el
  } else {
    noDrawBtn = el
  }
})

Array.from(urButtons).forEach(function(el) {
  el.addEventListener('click', handleUndoRedo)
})


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
let currAction = {}
let canvasReady = false

myPeer.on('open', (id) => peerId = id)

let socketCreated = false

canvasForm.addEventListener('submit', handleCanvasCreation)
createRoomBtn.addEventListener('click', handleCreateWss)
clearCanvasBtn.addEventListener('click', sendClearCanvasToBE)
startMediaBtn.addEventListener('click', handleStartMedia)

setKey()
