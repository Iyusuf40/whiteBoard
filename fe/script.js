const canvas = document.getElementsByClassName('canvas')[0]

let trackClick = 0

canvas.addEventListener("mousedown", function(e) {
  trackClick = 1
});

canvas.addEventListener("mouseup", function(e) {
  trackClick = 0
});

canvas.addEventListener("mousemove", function(e) {
  if (!trackClick) {
    return
  }
  const x = e.clientX
  const y = e.clientY
  console.log(x, y)
  const el = write(`${x}px`, `${y}px`)
  canvas.appendChild(el)
});

function write(x, y) {
  let ink = document.createElement("span")
  ink.style.left = x
  ink.style.top = y
  return ink
}
