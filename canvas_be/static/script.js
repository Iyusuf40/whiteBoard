const root = document.getElementById('root')
const createAccountForm = document.getElementById('create--act--form')
const loginForm = document.getElementById('login--form')
const canvasForm = document.getElementById('create--canvas--form')
const createRoomBtn = document.getElementById('create--wss')
const sendMsgBtn = document.getElementById('send--msg')
const modeButtons = document.getElementsByClassName('mode--buttons')


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
let globalElRepo = {}

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

let socketCreated = false

createAccountForm.addEventListener('submit', handleCreateAcct)
loginForm.addEventListener('submit', handleLoginSubmit)
canvasForm.addEventListener('submit', handleCanvasCreation)
createRoomBtn.addEventListener('click', handleCreateWss)
sendMsgBtn.addEventListener('click', sendMsg)

async function handleCreateAcct(e) {
  e.preventDefault()
  const id = document.getElementById('create--act--id').value
  const password = document.getElementById('create--act--passwd').value
  const body = JSON.stringify({id, password})
  const data = await postData(baseUrl + 'account', body)
  if (!data) return alert('undefined behaviour occured during account creation')
  if (data.key) {
    key = data.key
  } else if (data.error) {
    alert (data.error)
  } else {
    throw new Error('undefined behavior occured')
  } 
}

async function handleLoginSubmit(e) {
  e.preventDefault()
  const id = document.getElementById('login--id').value
  const password = document.getElementById('login--passwd').value
  const body = JSON.stringify({id, password})
  const data = await postData(baseUrl + 'login', body)
  if (!data) return alert('undefined behaviour occured during login')
  if (data.key) {
    key = data.key
  } else if (data.error) {
    alert (data.error)
  } else {
    throw new Error('undefined behavior occured')
  }
}

async function handleCanvasCreation(e) {
  e.preventDefault()
  if (!key) return alert('you are not logged in')
  const name = document.getElementById('create--canvas--form--val').value
  const body = JSON.stringify({name: name, key: key})
  const data = await postData(baseUrl + 'canvas', body)
  if (!data) return alert('undefined behaviour occured during account creation')
  if (data.name) {
    alert(`canvas: ${data.name} created`)
    canvasName = data.name
    setupCanvas()
  } else if (data.error) {
    alert (data.error)
    if (data.error === 'canvas already exists') {
      canvasName = name
      setupCanvas()
      buildCanvas()
    }
  } else {
    throw new Error('undefined behavior occured')
  } 
}

async function handleCreateWss(e) {
  e.preventDefault()
  if (!key) return alert('you are not logged in')
  if (!canvasName) return alert('no canvas created')
  const body = JSON.stringify({key: key})
  const data = await postData(baseUrl + 'canvas_socket', body)
  if (!data) return alert('undefined behaviour occured during account creation')
  if (data.message) {
    alert(`${data.message}`)
    createSocket() // create local sock and connect to remote
    setSharedUrl(key)
  } else if (data.error) {
    alert (data.error)
  } else {
    throw new Error('undefined behavior occured')
  } 
}

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

function createSocket() {

  if (!key) return alert ('you are not logged in')

  if (socketCreated) return

  socket = new WebSocket('ws://localhost:3000/' + key);

  socketCreated = true

  socket.addEventListener('error', (err) => {
    console.error(err)
  })

  socket.addEventListener('open', (event) => {
    console.log('socket opened')
    // socket.send('Hello Server!');
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

function sendMsg(e) {
  e.preventDefault()
  if (!socket) return
  sendToSocket('no action', 12, -7)
}

function setSharedUrl(key) {
  if (!key) return alert('you are not logged in')
  if (!canvasName) return alert('canvas not created')
  const urlDiv = document.getElementById('share--url')
  urlDiv.innerText = baseUrl + `join/${key}/${canvasName}`
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

async function buildCanvas(name=null) {
  const cName = name || canvasName
  if (!key) return alert('key required to get canvas')
  if (!cName) return alert('canvas name required to get canvas')
  const _canvas = await getCanvas()
  if (!_canvas) return alert(`canvas: ${cName} not found`)
  Object.keys(_canvas.points).forEach((point) => {
    const [x, y] = point.split(':')
    // const props = canvas.points[point]
    const ink = write(x, y, false)
    canvas.appendChild(ink)
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
  const payload = JSON.stringify({action, point: {x, y}, key, name: canvasName})
  const res = await putData(url, payload)
  return res
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

function handleSocketMessage(data) {
  const {action, x, y} = data
  if (!action) return console.log('action missing')
  if (!x) return console.log('x-axis missing')
  if (!y) return console.log('y-axis missing')
  if (action === 'delete') {
    eraseWrapper(x, y)
  } else {
    writeWrapper(x, y)
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
  canvas.appendChild(ink)
}

function write(x, y, persist=true, props=null) {
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
  const key = `${x}:${y}`
  globalElRepo[key] = ink
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
  let xDiff = abs(x1) - abs(x2)
  let y1 = pointsArr[0][1]
  let y2 = pointsArr[1][1]
  let yDiff = abs(y1) - abs(y2)

  let longest = null
  if (abs(xDiff) >= abs(yDiff)) {
    longest = abs(xDiff)
  } else {
    longest = abs(yDiff)
  }

  for (let i = 0; i < longest; i++) {
    if (x1 === x2) {
      x1 = x1
    } else if (x1 > x2) {
      x1--
    } else {
      x1++
    }
  
    if (y1 === y2) {
      y1 = y1
    } else if (y1 > y2) {
      y1--
    } else {
      y1++
    }
  
    let el = write(`${x1}px`, `${y1}px`)
    canvas.appendChild(el)
  }
}

function sendToSocket(action, x, y) {
  if (!x) return alert('x-axis missing')
  if (!y) return alert('y-axis missing')
  if (!action) return alert('action missing')
  if (!socket) return console.log('no socket set')
  const data = JSON.stringify({action, x, y})
  socket.send(data)
}
