const root = document.getElementById('root')
const modeButtons = document.getElementsByClassName('mode--buttons')
const clearCanvasBtn = document.getElementById('clear--canvas')
const startMediaBtn = document.getElementById('start--media')
const colorPickerContainer = document.getElementById("color--picker")
const colors = document.getElementsByClassName("colors")
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


Array.from(colors).forEach(function(el) {
  el.addEventListener("click", function() {
    const val = el.getAttribute("value")
    ctx.strokeStyle = val
  })
})


let canvas = null
let key = null
let canvasName = null
let socket = null
const baseUrl = 'https://collab.cloza.org/'
let socketCreated = false
let trackClick = false
let doNothing = true
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

myPeer.on('error', function(err) { console.log(err, "\n============\n", err.type) })

// set peerId incase 'open' event fails to fire
setPeerId()

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
