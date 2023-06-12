const root = document.getElementById('root')
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


let canvas = null
let key = null
let canvasName = null
let socket = null
const baseUrl = 'http://localhost:3000/'
let socketCreated = false
let trackClick = false
let globalPoints = []
let pointsBuffer = []
let globalElRepo = {}
const myPeer = new Peer()
let admin = false
let roomCreated = true
let startMedia = false
let peerId = null
let peers = {}
let currAction = {}
let canvasReady = false

myPeer.on('open', (id) => peerId = id)

clearCanvasBtn.addEventListener('click', sendClearCanvasToBE)
startMediaBtn.addEventListener('click', handleStartMedia)

setKey()
setCanvasName()
setupCanvas()
createSocket()
buildCanvas()

function setCanvasName() {
  const canvasEl = document.getElementById('canvasName')
  canvasName = canvasEl.innerText
  canvasName = canvasName.split(":")[1]
  if (!canvasName) alert ('canvas name failed to set')
}
