const canvas = document.getElementsByClassName('canvas')[0]
const modeButtons = document.getElementsByClassName('mode--buttons')

let trackClick = false
let collectThirdPoint = false
let globalPoints = []

let drawOpts = {
  mode: ''
}

Array.from(modeButtons).forEach(function(el) {
  el.addEventListener('click', setMode)
})

function setMode(e) {
  drawOpts.mode = e.target.getAttribute('data-mode')
}

canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("touchstart", handleTouchStart);

canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("touchend", handleMouseUp);

canvas.addEventListener("mousemove", handleMouseMoveDraw);
canvas.addEventListener("touchmove", handleTouchMoveDraw);
canvas.addEventListener("touchmove", handleTouchMoveErase);

function handleMouseUp(e) {
  trackClick = false
  prevX = 0
  prevY = 0
  collectThirdPoint = false
  globalPoints.splice(0, 1)
}

function handleMouseDown(e) {
  trackClick = !trackClick
}

function handleTouchStart(e) {
  trackClick = true
}

function erase(e) {
  // collect data-pos
  // send to backend
  e.target.remove()
}

function eraseT(e) {
  // collect data-pos
  // send to backend
  e.remove()
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
    if(e.target.getAttribute('data-pos')) {
      erase(e)
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

    // const loc = e.changedTouches[0]
    // const el =  document.elementFromPoint(loc.pageX, loc.pageY)
    var el = e.changedTouches[0].target
    if(el.getAttribute('data-pos')) {
      console.log('will erase l', el)
      eraseT(el)
    }
  }
}

function write(x, y) {
  let ink = document.createElement("span")
  ink.style.left = x
  ink.style.top = y
  ink.addEventListener('touchmove', handleTouchMoveErase)
  ink.addEventListener('mousemove', handleMouseMoveErase)
  ink.setAttribute('data-pos', `${x}:${y}`)
  return ink
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
