const root = document.getElementById('root')
const sendMsgBtn = document.getElementById('send--msg')
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

let canvas = null
let key = null
let canvasName = null
let socket = null
const baseUrl = 'https://collab.cloza.tech/'
let socketCreated = false
let trackClick = false
let globalPoints = []
let globalElRepo = {}
const myPeer = new Peer()
let admin = false
let roomCreated = true
let startMedia = false
let peerId = null
let peers = {}

myPeer.on('open', (id) => peerId = id)


const postOpt = {
  method: "POST",
  mode: "cors",
  cache: "no-cache",
  headers: {
    "Content-Type": "application/json",
  },
  // body: REMEMBER TO USE SPREAD SYNTAX TO INCLUDE BODY
}

const putOpt = {
  method: "PUT",
  mode: "cors",
  cache: "no-cache",
  headers: {
    "Content-Type": "application/json",
  },
  // body: REMEMBER TO USE SPREAD SYNTAX TO INCLUDE BODY
}

sendMsgBtn.addEventListener('click', sendMsg)
clearCanvasBtn.addEventListener('click', sendClearCanvasToBE)
startMediaBtn.addEventListener('click', handleStartMedia)

setKey()
setCanvasName()
setupCanvas()
createSocket()
buildCanvas()

async function postData(url, data) {
  const postOptLocal = {...postOpt, body: data}
  return fetch(url, postOptLocal)
  .then(data => {
    return data.json()
  })
  .then((data) => {
    return data
  })
  .catch((err) => {
    console.error(err)
    return null
  })
}

async function putData(url, data) {
  const putOptLocal = {...putOpt, body: data}
  return fetch(url, putOptLocal)
  .then(data => {
    return data.json()
  })
  .then((data) => {
    return data
  })
  .catch((err) => {
    console.error(err)
    return null
  })
}

async function handleStartMedia(e) {
  if (startMedia == false) {
    e.preventDefault()
    if (!roomCreated) return alert('room not created')
    const members = await getRoomMembers()
    const stream = await userMedia()
    sendToSocket('peer-connect', 0, 0, JSON.stringify({peerId, action: 'bind peerId to ws'}))
    for (const memberId of members) {
      if (memberId !== peerId) connectToNewUser(memberId, stream)
    }
    startMedia = true;
  } else console.log('Already connected')
}

async function getRoomMembers() {
  if (!key) return alert('room key not set')
  if (!peerId) return alert('peerId not set, please try again')
  const members = await joinMediaRoom()
  return members
}

async function joinMediaRoom() {
  if (!key) return alert('you are not logged in')
  if (!canvasName) return alert('no canvas created')
  if (!peerId) return alert('please try again, peerId not set')

  const body = JSON.stringify({key, peerId})
  const url = baseUrl + 'join_media_room'
  const data = await putData(url, body)
  if (!data) return alert('undefined behaviour occured during account creation')
  if (data.peers) {
    return data.peers
  } else if (data.error) {
    alert (data.error)
  } else {
    throw new Error('undefined behavior occured')
  }
}

/**
 *
 *
 * canvas functions from here bellow
 *
 */

function setupCanvas() {
  let _canvas = document.createElement('div')
  canvas = _canvas
  canvas.className = 'canvas'
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("touchstart", handleTouchStart);

  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("touchend", handleMouseUp);

  canvas.addEventListener("mousemove", handleMouseMoveDraw);
  canvas.addEventListener("touchmove", handleTouchMoveDraw);
  canvas.addEventListener("touchmove", handleTouchMoveErase);

  root.appendChild(canvas)
}

async function getCanvas(name=null) {
  if (!canvasName) return alert('canvas name not set')
  const cName = name || canvasName
  if (!key) return alert('key required to get canvas')
  if (!cName) return alert('canvas name required to get canvas')
  const url = baseUrl + `canvas/${key}/${cName}`
  return fetch(url)
  .then(res => res.json())
  .then((data) => {
    if (data.error) {
      alert(data.error)
      return null
    }
    return data
  })
  .catch((err) => {
    console.error(err)
    return null
  })
}

async function sendClearCanvasToBE(e) {
  e.preventDefault()
  if (!key) return alert('you are not logged in')
  if (!canvasName) return alert('canvas name not set')
  const url = baseUrl + `clear_canvas_points/${key}`
  const body = JSON.stringify({name: canvasName})
  putData(url, body)
  sendClearCanvasMsgToSocket()
  clearCanvas()
}

function clearCanvas() {
  for (const key in globalElRepo) {
    const ink = globalElRepo[key]
    erase(ink, false)
  }
}

async function buildCanvas(name=null) {
  if (!canvasName) return alert('canvas name not set')
  let cName = name || canvasName
  if (!key) return alert('key required to get canvas')
  if (!cName) return alert('canvas name required to get canvas')
  const _canvas = await getCanvas(cName)
  if (!_canvas) return alert(`canvas: ${cName} not found`)
  Object.keys(_canvas.points).forEach((point) => {
    const [x, y] = point.split(':')
    // const props = canvas.points[point]
    const ink = write(x, y, false)
    if (ink) canvas.appendChild(ink)
  })
}

async function updateCanvasBE(action, x, y) {
  /**
   * action
   * key
   * name
   * point = {x, y}
   */

  if (!action) return alert('action missing')
  if (!key) return alert('you are not logged in')
  if (!canvasName) return alert('no canvas chosen')
  if (!x || !y) return alert('coordinates missing')
  const url = baseUrl + `canvas_points/${key}`
  const name = canvasName
  const payload = JSON.stringify({action, point: {x, y}, key, name})
  const res = await putData(url, payload)
  return res
}

function createSocket() {

  if (!key) return alert ('you are not logged in')

  if (socketCreated) return

  socket = new WebSocket('wss://collab.cloza.tech/ws/' + key);

  socketCreated = true

  socket.addEventListener('error', (err) => {
    console.error(err)
  })

  socket.addEventListener('open', (event) => {
    console.log('socket opened')
    // socket.send('Hello Server!');
    // sendToSocket('write', -12, 7)
  });

  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data)
    handleSocketMessage(data)
  });

  socket.addEventListener('close', (event) => {
    console.log('socket closed')
    socket.close();
  });
}

function handleSocketMessage(data) {
  const {action, x, y, peerId} = data
  if (!action) return console.log('action missing')
  if (!x && x !== 0) return console.log('x-axis missing')
  if (!y && y !== 0) return console.log('y-axis missing')
  if (action === 'delete') {
    eraseWrapper(x, y)
  } else if (action === 'clear') {
    clearCanvas()
  } else if (action === 'peer-disconnect'){
    removePeerVideo(peerId)
  } else {
    writeWrapper(x, y)
  }
}

function removePeerVideo(peerId) {
  if (peerId){
    const video = peers[peerId]
    video.remove()
    delete peers[peerId]
  } else {
    console.log('Unknown peer')
  }
}

function eraseWrapper(x, y) {
  if (!x || !y) return console.log('required params missing')
  const key = `${x}:${y}`
  const el = globalElRepo[key]
  erase(el, false)
}

function writeWrapper(x, y) {
  if (!x || !y) return console.log('required params missing')
  const ink = write(x, y, false)
  if (ink) canvas.appendChild(ink)
}

function sendMsg(e) {
  e.preventDefault()
  if (!socket) return
  sendToSocket('no action', -21, 49)
}

function setKey() {
  const keyEl = document.getElementById('key')
  key = keyEl.innerText
  if (!key) alert('key failed to set')
}

function setCanvasName() {
  const canvasEl = document.getElementById('canvasName')
  canvasName = canvasEl.innerText
  canvasName = canvasName.split(":")[1]
  if (!canvasName) alert ('canvas name failed to set')
}

function handleMouseUp(e) {
  trackClick = false
  globalPoints.splice(0, 1)
}

function handleMouseDown(e) {
  trackClick = !trackClick
}

function handleTouchStart(e) {
  trackClick = true
}

function write(x, y, persist=true, props=null) {
  const key = `${x}:${y}`
  if (globalElRepo[key]) return null // do not allow zombie ink
  let ink = document.createElement("span")
  ink.style.left = x
  ink.style.top = y
  ink.addEventListener('mousemove', handleMouseMoveErase)
  ink.setAttribute('data-pos', `${x}:${y}`)
  if (persist) {
    // call updateCanvasBE
    updateCanvasBE('write', x, y)
    sendToSocket('write', x, y)
  }
  if (props) {
    // add additional properties to ink
  }
  globalElRepo[key] = ink  // do not allow zombie ink
  return ink
}

function erase(e, persist=true) {
  // collect data-pos
  // send to backend
  const key = e.getAttribute('data-pos')
  const [x, y] = key.split(':')
  e.remove()
  delete(globalElRepo[key])
  if (persist) {
    updateCanvasBE('delete', x, y)
    sendToSocket('delete', x, y)
  }
}

function handleMouseMoveDraw(e) {
  if (!trackClick) {
    return
  }
  if (drawOpts.mode === 'draw') {
    const x = Math.floor(e.pageX)
    const y = Math.floor(e.pageY)

    globalPoints.push([x, y])

    if (globalPoints.length > 1) drawPoints(canvas, globalPoints)
  }
}

function handleMouseMoveErase(e) {
  if (!trackClick) {
    return
  }
  if (drawOpts.mode === 'erase'){
    const data = e.target.getAttribute('data-pos')
    if(data) {
      /**
       *
       * clientX and Y pos is necessary because in erasemult
       * elements will be retrieved by using document.getElFromPos
       * which uses view port positions
       *
       *
       */
      const _data = `${e.clientX}:${e.clientY}`
      eraseMultiple(_data)
    }
  }
}

function handleTouchMoveDraw(e) {
  if (!trackClick) {
    return
  }
  if (drawOpts.mode === 'draw') {
    const x = Math.floor(e.changedTouches[0].pageX)
    const y = Math.floor(e.changedTouches[0].pageY)

    globalPoints.push([x, y])

    if (globalPoints.length > 1) drawPoints(canvas, globalPoints)
  }
}

function handleTouchMoveErase(e) {

  if (drawOpts.mode === 'erase') {
    const loc = e.changedTouches[0]
    const x = Math.floor(loc.clientX)
    const y = Math.floor(loc.clientY)
    const surrounding = getSurroundingInk(x, y, 10)
    surrounding.forEach(function (pos) {
      const el =  document.elementFromPoint(pos[0], pos[1])
      const data = el.getAttribute('data-pos')
      if(data) {
        erase(el)
      }
    })
  }
}

function abs(val) {
  if (val < 0) return val * -1
  return val
}

function drawPoints(canvas, points) {
  const diff = [points[0], points[1]]
  connectTwoPoints(diff, canvas)
  points.splice(0, 1)
}

function getSurroundingInk(x, y, diff=5) {
  let arr = []
  for (let i = x - diff; i <= x + diff; i++) {
    for (let j = y - diff; j <= y + diff; j++) arr.push([i, j])
  }
  return arr
}

function eraseMultiple(position) {
  const [x, y] = position.split(':')

  /**
   *
   * usage of Math.floor here is essential for performance.
   * operations on floatin point numbers used crazy memory
   * and was super slow
   *
   */
  const surroundingInk = getSurroundingInk(Math.floor(x), Math.floor(y))

  surroundingInk.forEach(function(coordinate) {
    const el = document.elementFromPoint(coordinate[0], coordinate[1])
    if (el && el.getAttribute('data-pos')) {
      erase(el)
    }
  })
}

function connectTwoPoints(pointsArr, canvas) {
  let x1 = pointsArr[0][0]
  let x2 = pointsArr[1][0]
  let y1 = pointsArr[0][1]
  let y2 = pointsArr[1][1]

  let longest = 0
  let xDiff = computeDistance(x1, x2)
  let yDiff = computeDistance(y1, y2)
  let xFactor
  let yFactor
  if (xDiff > yDiff) {
    longest = xDiff
  } else {
    longest = yDiff
  }
  
  xFactor = xDiff / longest
  yFactor = yDiff / longest
  
  let drawInterval = xFactor !== 1 ? 
                     Math.ceil((longest - xDiff) / xDiff) :
                     Math.ceil((longest - yDiff) / yDiff)
  
  for (let i = 1; i <= longest + 1; i++) {
    if (xFactor !== 1 && i % drawInterval) {
      x1 = x1
    } else {
      if (x1 > x2) {
        x1--
      } else if(x1 < x2) {
        x1++
      }
    }
  
    if (yFactor !== 1 && i % drawInterval) {
      y1 = y1
    } else {
      if (y1 > y2) {
        y1--
      } else if(y1 < y2) {
        y1++
      }
    }
    let el = write(`${x1}px`, `${y1}px`)
    canvas.appendChild(el)
  }
}

function sendToSocket(action, x, y, other) {
  if (!x && x !== 0) return alert('x-axis missing')
  if (!y && y !== 0) return alert('y-axis missing')
  if (!action) return alert('action missing')
  if (!socket) return console.log('no socket set')
  if (action === 'peer-connect') {
    if (typeof(other) !== 'string') return alert('Only JSON allowed')
    socket.send(other)
  } else {
    const data = JSON.stringify({action, x, y})
    socket.send(data)
  }
}

function sendClearCanvasMsgToSocket() {
  if (!socket) return console.log('no socket set')
  const data = JSON.stringify({action: 'clear', x: 0, y: 0})
  socket.send(data)
}

function computeDistance(p1, p2) {
  if (p1 < 0 && p2 < 0) return abs(p1 + p2)
  if (p1 < 0 && p2 >= 0) return abs(p1 - p2)
  if (p1 >= 0 && p2 < 0) return abs(p2 - p1)
  if (p1 >= 0 && p2 >= 0) return abs(p1 - p2)
  return p1 - p2
}
