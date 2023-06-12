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

function setMode(e) {
  if (!canvasReady) return
  const el = e.target
  const mode = el.getAttribute('action')
  drawOpts.mode = modeButtons
  if (mode === 'nodraw') {
    setClass(el, 'light--red')
    clearClass(drawBtn, 'light--green')
    setCtxProps('do nothing')
  } else {
    setClass(el, 'light--green')
    clearClass(noDrawBtn, 'light--red')
    setCtxProps('draw')
  }
}

function setCtxProps(mode) {
  if (mode === 'erase') {
    let canvasContainer = document.getElementsByClassName('canvas--container')[0]
    ctx.strokeStyle = window.getComputedStyle(canvasContainer).backgroundColor
    ctx.lineWidth = 4
  } else if (mode === 'draw') {
    ctx.strokeStyle = "red"
    ctx.lineWidth = 2
  } else {
    ctx.lineWidth = 0
  }
}

function handleUndoRedo(e) {
  const mode = e.target.getAttribute('action')
  if (mode === 'undo') {
    handleMainStack('pop')
    currAction = { action: 'undo', payload: {} }
    sendToSocket(currAction.action, currAction.payload)
    updateCanvasBE(mainStack)
  } else {
    handleUndoStack('pop')
    currAction = { action: 'redo', payload: {} }
    sendToSocket(currAction.action, currAction.payload)
    updateCanvasBE(mainStack)
  }
}

function handleMainStack(action, event = [], persist = false) {
  if (action === 'push') {
    if (event.length) mainStack.push(copy(event))
  } else if (action === 'pop') {
    let popped = mainStack.pop()
    if (popped) {
      drawAll(popped, 'erase')
      handleUndoStack('push', copy(popped))
    }
  } else {
    throw new Error('action cannot be carried out on stack')
  }
  if (persist) updateCanvasBE(mainStack)
}

function handleUndoStack(action, event = [], persist = false) {
  if (action === 'push') {
    if (event.length) undoStack.push(copy(event))
  } else if (action === 'pop') {
    let popped = undoStack.pop()
    if (popped) {
      drawAll(popped, 'draw')
      handleMainStack('push', copy(popped))
    }
  } else {
    throw new Error('action cannot be carried out on stack')
  }
  if (persist) updateCanvasBE(mainStack)
}

async function handleCreateAcct(e) {
  e.preventDefault()
  const id = document.getElementById('create--act--id').value
  const password = document.getElementById('create--act--passwd').value
  const body = JSON.stringify({ id, password })
  const data = await postData(baseUrl + 'account', body)
  if (!data) return alert('undefined behaviour occured during account creation')
  if (data.key) {
    key = data.key
  } else if (data.error) {
    alert(data.error)
  } else {
    throw new Error('undefined behavior occured')
  }
}

function setKey() {
  const keyEl = document.getElementById('key')
  key = keyEl.innerText
  if (!key) alert('key failed to set')
}

async function handleLoginSubmit(e) {
  e.preventDefault()
  const id = document.getElementById('login--id').value
  const password = document.getElementById('login--passwd').value
  const body = JSON.stringify({ id, password })
  const data = await postData(baseUrl + 'login', body)
  if (!data) return alert('undefined behaviour occured during login')
  if (data.key) {
    key = data.key
  } else if (data.error) {
    alert(data.error)
  } else {
    throw new Error('undefined behavior occured')
  }
}

async function handleCanvasCreation(e) {
  e.preventDefault()
  if (!key) return alert('you are not logged in')
  const name = document.getElementById('create--canvas--form--val').value
  const body = JSON.stringify({ name: name, key: key })
  const data = await postData(baseUrl + 'canvas', body)
  if (!data) return alert('undefined behaviour occured during account creation')
  if (data.name) {
    alert(`canvas: ${data.name} created`)
    canvasName = data.name
    setupCanvas()
  } else if (data.error) {
    alert(data.error)
    if (data.error === 'canvas already exists') {
      canvasName = name
      setupCanvas()
      buildCanvas()
    }
  } else {
    throw new Error('undefined behavior occured')
  }
}

async function sendClearCanvasToBE(e) {
  e.preventDefault()
  if (!key) return alert('you are not logged in')
  if (!canvasName) return alert('canvas name not set')
  const url = baseUrl + `clear_canvas_points/${key}`
  const body = JSON.stringify({ name: canvasName })
  putData(url, body)
  sendClearCanvasMsgToSocket()
  clearCanvas()
}

function clearCanvas() {
  for (const line of mainStack) {
    drawAll(line, 'erase', false)
  }
  undoStack = []
  mainStack = []
}

async function handleCreateWss(e) {
  e.preventDefault()
  if (!key) return alert('you are not logged in')
  if (!canvasName) return alert('no canvas created')
  const body = JSON.stringify({ key: key })
  const data = await postData(baseUrl + 'canvas_socket', body)
  if (!data) return alert('undefined behaviour occured during account creation')
  if (data.message) {
    alert(`${data.message}`)
    createSocket() // create local sock and connect to remote
    const mediaRoomCreated = await createMediaRoom()
    if (!mediaRoomCreated) return alert('media room creation failed')
    setSharedUrl(key)
    admin = true
    roomCreated = true
  } else if (data.error) {
    alert(data.error)
  } else {
    throw new Error('undefined behavior occured')
  }
}

async function handleStartMedia(e) {
  if (startMedia == false) {
    e.preventDefault()
    if (!roomCreated) return alert('room not created')
    const members = await getRoomMembers()
    const stream = await userMedia()
    sendToSocket('bind peerId to ws', peerId)
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

  const body = JSON.stringify({ key, peerId })
  const url = baseUrl + 'join_media_room'
  const data = await putData(url, body)
  if (!data) return alert('undefined behaviour occured during account creation')
  if (data.peers) {
    return data.peers
  } else if (data.error) {
    alert(data.error)
  } else {
    throw new Error('undefined behavior occured')
  }
}

async function createMediaRoom() {
  if (!key) return alert('you are not logged in')
  if (!canvasName) return alert('no canvas created')
  if (!peerId) return alert('please try again, peerId not set')

  const body = JSON.stringify({ key, peerId })
  const url = baseUrl + 'create_media_room'
  const data = await postData(url, body)
  if (!data) return alert('undefined behaviour occured during account creation')
  if (data.status) {
    console.log(`${data.status}`)
    // emit peerId
    return true
  } else if (data.error) {
    alert(data.error)
  } else {
    throw new Error('undefined behavior occured')
  }
}

async function postData(url, data) {
  const postOptLocal = { ...postOpt, body: data }
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
  const putOptLocal = { ...putOpt, body: data }
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

  if (!key) return alert('you are not logged in')

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
  sendToSocket('no action', {})
}

function setSharedUrl(key) {
  if (!key) return alert('you are not logged in')
  if (!canvasName) return alert('canvas not created')
  const urlDiv = document.getElementById('share--url')
  urlDiv.innerText = baseUrl + `join/${key}/${canvasName}`
  urlDiv.style.display = 'block'
}

/**
 *
 *
 * canvas functions from here bellow
 *
 */

function setUpCanvasCtx(canvasContainer) {

  canvas = document.getElementById('canvas')

  ctx = canvas.getContext('2d')
  ctx.canvas.width = canvasContainer.offsetWidth || 1000
  ctx.canvas.height = canvasContainer.offsetHeight || 1000
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  ctx.strokeStyle = 'red';
}

function setupCanvas() {
  let canvasContainer = document.getElementsByClassName('canvas--container')[0]

  clearClass(canvasContainer, 'no--display')

  ofsetX = canvasContainer.getBoundingClientRect().left + window.scrollX
  ofsetY = canvasContainer.getBoundingClientRect().top + window.scrollY
  setUpCanvasCtx(canvasContainer)
  canvas.setAttribute('isCanvas', 'true')
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("touchstart", handleTouchStart);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("touchend", handleMouseUp);
  canvas.addEventListener("mouseleave", handleMouseUp);
  canvas.addEventListener("mousemove", handleMouseMoveDraw);
  canvas.addEventListener("touchmove", handleTouchMoveDraw);

  root.appendChild(canvasContainer)

  canvasReady = true
}

async function getCanvas(name = null) {
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

async function buildCanvas(name = null) {
  const cName = name || canvasName
  if (!key) return alert('key required to get canvas')
  if (!cName) return alert('canvas name required to get canvas')
  const _canvas = await getCanvas()
  if (!_canvas) return alert(`canvas: ${cName} not found`)
  _canvas.points.forEach((point) => {
    drawAll(point, 'draw', false)
    handleMainStack('push', point, false)
  })
}

async function updateCanvasBE(payload) {
  /**
   * payload: a list of changes to apply in backend
   */
  if (!key) return alert('you are not logged in')
  if (!canvasName) return alert('no canvas chosen')
  if (!payload.length) return console.log('payload empty')
  const url = baseUrl + `canvas_points/${key}`
  const changes = JSON.stringify({ payload, key, name: canvasName })
  let res
  try {
    res = await putData(url, changes)
  } catch (e) {
    console.error(e)
  }
  
  return res
}


function handleMouseUp(e) {
  // trackClick = false
  allowTouchStart = true
  globalPoints.splice(0, 1)
  if (pointsBuffer.length) handleMainStack('push', [...pointsBuffer])
  let validEmptyStack = [[[]]]
  if (trackClick) {
    updateCanvasBE(mainStack.length? mainStack : validEmptyStack)
    trackClick = false
  }
  /**
   * use currAction obj instead of pointsBuffer
   * has ref to current points popped or pushed
   * has action attribute
   */
  currAction = { action: 'draw', payload: mainStack[mainStack.length - 1] }
  sendToSocket(currAction.action, currAction.payload)
  pointsBuffer = []  // end of contigious line
}

// function handleMouseDown(e) {
//   trackClick = !trackClick
// }

function handleMouseDown(e) {
  trackClick = !trackClick
  pointsBuffer = []
}

// function handleTouchStart(e) {
//   if (!allowTouchStart) return
//   allowTouchStart = false
//   trackClick = true
// }

function handleTouchStart(e) {
  if (!allowTouchStart) return
  allowTouchStart = false
  trackClick = true
  pointsBuffer = []
}

function handleSocketMessage(data) {
  const { action, payload } = data
  if (!action) return console.log('action missing')
  if (action === 'erase') {
    eraseWrapper(payload)
  } else if (action === 'clear') {
    clearCanvas()
  } else if (action === 'peer-disconnect') {
    removePeerVideo(payload)  // payload is peerid
  } else if (action === 'undo') {
    handleMainStack('pop')
  } else if (action === 'redo') {
    handleUndoStack('pop')
  } else if (action === 'draw'){
    writeWrapper(payload)
  } else {
    console.log('no handler for action')
  }
}

function removePeerVideo(peerId) {
  if (peerId) {
    const video = peers[peerId]
    video.remove()
    delete peers[peerId]
  } else {
    console.log('Unknown peer')
  }
}

function setClass(el, className) {
  el.classList.add(className)
}

function clearClass(el, className) {
  el.classList.remove(className)
}

function connectTwoPoints(pointsArr) {
  let x1 = pointsArr[0][0]
  let x2 = pointsArr[1][0]
  let y1 = pointsArr[0][1]
  let y2 = pointsArr[1][1]

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2);
  ctx.stroke();
}


function eraseWrapper(pointsList) {
  if (!pointsList || !pointsList.length) return console.log('pointsList is either missing or empty')
  drawAll(pointsList, 'erase', false)
}


function writeWrapper(pointsList) {
  if (!pointsList || !pointsList.length) return console.log('pointsList is either missing or empty')
  drawAll(pointsList, 'draw', false)
  handleMainStack('push', pointsList, false)
  undoStack = []  // branch has moved forward 
}

function erase(points) {
  const diff = [points[0], points[1]]
  connectTwoPoints(diff)
  points.splice(0, 1)
}

// function handleMouseMoveDraw(e) {
//   if (!trackClick) {
//     return
//   }
//   if (drawOpts.mode === 'draw') {
//     const x = Math.floor(e.pageX)
//     const y = Math.floor(e.pageY)

//     globalPoints.push([x, y])

//     if (globalPoints.length > 1) drawPoints(canvas, globalPoints)
//   }
// }

function handleMouseMoveDraw(e) {
  if (!trackClick) {
    return
  }
  const x = e.pageX - ofsetX
  const y = e.pageY - ofsetY

  globalPoints.push([x, y])
  if (globalPoints.length > 1) draw(globalPoints, true)
}

function handleTouchMoveDraw(e) {
  e.preventDefault()
  if (!trackClick) {
    return
  }

  const x = Math.floor(e.changedTouches[0].pageX) - ofsetX
  const y = Math.floor(e.changedTouches[0].pageY) - ofsetY
  const loc = e.changedTouches[0]
  const clientX = Math.floor(loc.clientX)
  const clientY = Math.floor(loc.clientY)
  const el = document.elementFromPoint(clientX, clientY)
  if (!el.getAttribute('isCanvas')) {
    trackClick = false  // user has wandered outside canvas
    return
  }

  globalPoints.push([x, y])

  // if (globalPoints.length > 1) drawPoints(canvas, globalPoints)
  if (globalPoints.length > 1) draw(globalPoints, true)
}

// function handleTouchMoveDraw(e) {
//   if (!trackClick) {
//     return
//   }
//   if (drawOpts.mode === 'draw') {
//     const x = e.changedTouches[0].pageX - ofsetX
//     const y = e.changedTouches[0].pageY - ofsetY

//     globalPoints.push([x, y])

//     if (globalPoints.length > 1) draw(globalPoints)
//   }
// }

// function drawPoints(canvas, points) {
//   const diff = [points[0], points[1]]
//   connectTwoPoints(diff, canvas)
//   points.splice(0, 1)
// }

function draw(points, persist = false) {
  const diff = [points[0], points[1]]
  if (persist) {
    pointsBuffer.push(diff)
    undoStack = []  // new item will be pushed on mainstack, so redo
    // doesn't pop a previous undo unto mainstack 
  }
  connectTwoPoints(diff)
  points.splice(0, 1)
}

function drawAll(points = [], mode, persist = false) {
  setCtxProps(mode)
  let pointsCopy = copy(points)
  pointsCopy.forEach((line) => {
    draw(line, persist)
  })
}

function copy(arr) {
  return JSON.parse(JSON.stringify(arr))
}

function sendToSocket(action, payload) {
  if (!action) return console.log('action not specified')
  if (!socket) return console.log('no socket set')
  if (!payload) return console.log('payload not set')
  const data = JSON.stringify({ payload, action })
  socket.send(data)
}

function sendClearCanvasMsgToSocket() {
  if (!socket) return console.log('no socket set')
  const data = JSON.stringify({ action: 'clear' })
  socket.send(data)
}
