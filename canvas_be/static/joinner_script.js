const root = document.getElementById('root')
const sendMsgBtn = document.getElementById('send--msg')

let key = null
let canvasName = null
let socket = null
const baseUrl = 'http://localhost:3000/'
let socketCreated = false
let trackClick = false
let globalPoints = []

let drawOpts = {
  mode: ''
}

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

setKey()
setCanvasName()
createSocket()
// buildCanvas()

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

/**
 * 
 * 
 * canvas functions from here bellow
 * 
 */

async function getCanvas(name=null) {
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
  const canvas = await getCanvas()
  if (!canvas) return alert(`canvas: ${cName} not found`)
  Object.keys(canvas.points).forEach((point) => {
    const [x, y] = point.split(':')
    // const props = canvas.points[point]
    write(x, y, false)
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
  const payload = JSON.stringify({action, x, y, key, name: canvasName})
  const res = await putData(url, payload)
  return res
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
    console.log('Message from server ', event.data);
  });

  socket.addEventListener('close', (event) => {
    console.log('socket closed')
    socket.close();
  });
}

function sendMsg(e) {
  e.preventDefault()
  if (!socket) return
  socket.send('hello server!')
}

function setKey() {
  const keyEl = document.getElementById('key')
  key = keyEl.innerText
  if (!key) alert('key failed to set')
}

function setCanvasName() {
  const canvasEl = document.getElementById('canvasName')
  canvasName = canvasEl.innerText
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
  let ink = document.createElement("span")
  ink.style.left = x
  ink.style.top = y
  ink.addEventListener('mousemove', handleMouseMoveErase)
  ink.setAttribute('data-pos', `${x}:${y}`)
  if (persist) {
    // call updateCanvasBE
  }
  if (props) {
    // add additional properties to ink
    updateCanvasBE('write', x, y)
    // to-do: send to socket
  }
  return ink
}

function erase(e) {
  // collect data-pos
  // send to backend
  const [x, y] = e.getAttribute('data-pos').split(':')
  e.remove()
  updateCanvasBE('delete', x, y)
  // to-do: send to socket
}

function handleMouseMoveDraw(e) {
  if (!trackClick) {
    return
  }
  if (drawOpts.mode === 'draw') {
    const x = e.pageX
    const y = e.pageY

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
      eraseMultiple(data)
    }
  }
}

function handleTouchMoveDraw(e) {
  if (!trackClick) {
    return
  }
  if (drawOpts.mode === 'draw') {
    const x = e.changedTouches[0].pageX
    const y = e.changedTouches[0].pageY

    globalPoints.push([x, y])

    if (globalPoints.length > 1) drawPoints(canvas, globalPoints)
  }
}

function handleTouchMoveErase(e) {

  if (drawOpts.mode === 'erase') {
    const loc = e.changedTouches[0]
    const surrounding = getSurroundingInk(loc.pageX, loc.pageY, 10)
    surrounding.forEach(function (pos) {
      const el =  document.elementFromPoint(pos[0], pos[1])
      const data = el.getAttribute('data-pos')
      if(data) {
        eraseMultiple(data)
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
  const xCoordinate = Number(x.slice(0, x.length - 2))
  const yCoordinate = Number(y.slice(0, y.length - 2))
  const surroundingInk = getSurroundingInk(xCoordinate, yCoordinate)
  surroundingInk.forEach(function(coordinate) {
    const el = document.elementFromPoint(coordinate[0], coordinate[1])
    if (el.getAttribute('data-pos')) {
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

