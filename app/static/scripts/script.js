const root = document.getElementById('root')
const canvasForm = document.getElementById('create--canvas--form')
const createRoomBtn = document.getElementById('create--wss')
const toggleShowBtns = document.getElementsByClassName("toggle--show--buttons")
const urButtons = document.getElementsByClassName('undoredo--buttons')
const clearCanvasBtn = document.getElementById('clear--canvas')
const startMediaBtn = document.getElementById('start--media')
const collapsable = document.getElementsByClassName("collapsable")
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

Array.from(urButtons).forEach(function(el) {
  el.addEventListener('click', handleUndoRedo)
})

Array.from(toggleShowBtns).forEach(function(el) {
  el.addEventListener('click', function(){
    let currentEl = el
    let classList = Array.from(el.classList)
    if (classList.includes("plus--sign")) {
      // display buttons
      showCollapsable()
    } else {
      hideCollapsable()
    }

    // swicth button from plus to minus and vice-varsa
    Array.from(toggleShowBtns).forEach(function(el) {
      if (el === currentEl) {
        el.classList.add("no--display")
      } else {
        el.classList.remove("no--display")
      }
    })
  })
})


Array.from(colors).forEach(function(el) {
  el.addEventListener("click", function() {
    const val = el.getAttribute("value")
    ctx.strokeStyle = val
  })
})

let key = null
let socket = null
let canvasName = null
let canvas = null
const baseUrl = 'https://collab.cloza.org/'
let trackClick = false
let doNothing = true
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

myPeer.on('error', function(err) { console.log(err, "\n============\n", err.type) })

// set peerId incase 'open' event fails to fire
setTimeout(() => {
  peerId = myPeer._id
}, 1000)

let socketCreated = false

canvasForm.addEventListener('submit', handleCanvasCreation)
createRoomBtn.addEventListener('click', handleCreateWss)
clearCanvasBtn.addEventListener('click', sendClearCanvasToBE)
startMediaBtn.addEventListener('click', handleStartMedia)

setKey()
