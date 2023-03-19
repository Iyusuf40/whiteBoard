const canvas = document.getElementsByClassName('canvas')[0]
const modeButtons = document.getElementsByClassName('mode--buttons')

let trackClick = false
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
    const x = e.changedTouches[0].pageX
    const y = e.changedTouches[0].pageY

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
  }
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

function getSurroundingInk(x, y, diff=5) {
  let arr = []
  for (let i = x - diff; i <= x + diff; i++) {
    for (let j = y - diff; j <= y + diff; j++) arr.push([i, j])
  }
  return arr
}

function eraseMultiple(position) {
  const [x, y] = position.split(':')
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

function abs(x) {
  if (x < 0) return -x
  return x
}

function computeDistance(p1, p2) {
  if (p1 < 0 && p2 < 0) return abs(p1 + p2)
  if (p1 < 0 && p2 >= 0) return abs(p1 - p2)
  if (p1 >= 0 && p2 < 0) return abs(p2 - p1)
  if (p1 >= 0 && p2 >= 0) return abs(p1 - p2)
  return p1 - p2
}
