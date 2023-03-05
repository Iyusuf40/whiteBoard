const canvas = document.getElementsByClassName('canvas')[0]

let trackClick = 0
let prevX = 0
let prevY = 0

canvas.addEventListener("mousedown", function(e) {
  trackClick = 1
});

canvas.addEventListener("mouseup", function(e) {
  trackClick = 0
  prevX = 0
  prevY = 0
});

canvas.addEventListener("mousemove", function(e) {
  if (!trackClick) {
    return
  }
  const x = e.clientX
  const y = e.clientY
  if ((prevX || prevY) 
    && (abs(prevX - x) > 5)
    || (abs(prevY - y) > 5)) {
      console.log(prevX - x, prevY - y)
      // set flag to wait for 3rd position
      // project line
    }
  const el = write(`${x}px`, `${y}px`)
  canvas.appendChild(el)
  prevX = x
  prevY = y
});

function write(x, y) {
  let ink = document.createElement("span")
  ink.style.left = x
  ink.style.top = y
  return ink
}

function abs(val) {
  if (val < 0) return val * -1
  return val
}
