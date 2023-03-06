const canvas = document.getElementsByClassName('canvas')[0]

let trackClick = false
let prevX = 0
let prevY = 0
let collectThirdPoint = false
let skippedQue = []

let drawOpts = {
  mode: 'draw'
}

canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("touchstart", handleMouseDown);

canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("touchend", handleMouseUp);

canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("touchmove", handleMouseMove);

function handleMouseUp(e) {
  trackClick = false
  prevX = 0
  prevY = 0
  collectThirdPoint = false
}

function handleMouseDown(e) {
  trackClick = !trackClick
}

function handleMouseMove(e) {
  if (!trackClick) {
    return
  }
  if (drawOpts.mode === 'draw') {
    const x = e.pageX
    const y = e.pageY

    if (collectThirdPoint) {
      skippedQue[2] = [x, y]
      collectThirdPoint = false
      // prevent race conditions by not using global skippedQue
      let sq = [skippedQue[0], skippedQue[1], skippedQue[2]]
      drawSkipped(canvas, sq)
    }

    if (
        (prevX !== 0 && prevY !== 0)
      && ( 
        ((abs(prevX) - abs(x)) > 5 || ((abs(prevX) - abs(x)) < 5)
      || ((abs(prevY) - abs(y)) > 5) || (abs(prevY) - abs(y)) < 5)
        )
    ) {
      collectThirdPoint = true
      skippedQue[0] = [prevX, prevY]
      skippedQue[1] = [x, y]
    }
    const el = write(`${x}px`, `${y}px`)
    canvas.appendChild(el)
    prevX = x
    prevY = y
  } else {
    if(e.target.getAttribute('data-pos')) {
      e.target.remove()
    }
  }
}

function write(x, y) {
  let ink = document.createElement("span")
  ink.style.left = x
  ink.style.top = y
  ink.setAttribute('data-pos', `${x}:${y}`)
  return ink
}

function abs(val) {
  if (val < 0) return val * -1
  return val
}

function drawSkipped(canvas, skippedQue) {
  const firstDiff = [skippedQue[0], skippedQue[1]]
  const secondDiff = [skippedQue[1], skippedQue[2]]
  connectTwoPoints(firstDiff, canvas)
  connectTwoPoints(secondDiff, canvas)
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

function getDirection(arr) {
  if (arr.length === 3) {
    return null
  }
  const firstPoint = arr[0]
  const mid = arr[1]
  const lastPoint = arr[2]
  if (mid[0] > firstPoint[0] && mid[0] > lastPoint[0]) {
    return ['+x', mid[0] - firstPoint[0], mid[0] - lastPoint[0]]
  }

  if (mid[0] < firstPoint[0] && mid[0] < lastPoint[0]) {
    return ['-x', firstPoint[0] - mid[0], lastPoint[0] - mid[0]]
  }

  if (mid[1] > firstPoint[1] && mid[1] > lastPoint[1]) {
    return ['+y', mid[1] - firstPoint[1], mid[1] - lastPoint[1]]
  }

  if (mid[1] < firstPoint[1] && mid[1] < lastPoint[1]) {
    return ['-y', firstPoint[1] - mid[1], lastPoint[1] - mid[1]]
  }

  return null
}
