const canvas = document.getElementsByClassName('canvas')[0]

let trackClick = 0

let pixels = '';
// for (let i = 0; i < 250000; i++){
//   let pixel = `<span id=${i} class="pixel"></span>`
//   pixels += pixel;
//   if (i && !(i % 500)) {
//     pixels += '<br>'
//   } 
// }

for (let i = 0; i < 500; i++){
  let pixel = `<span class="pixel"></span>`.repeat(500)
  pixels += pixel;
  pixels += '<br>'
}

canvas.innerHTML = pixels;

let spans = document.getElementsByClassName('pixel')

// canvas.addEventListener("mousedown", function(e) {
//   const id = e.target.id
//   const touchedSpan = document.getElementById(id)
//   touchedSpan.style.backgroundColor = 'red';
//   trackClick = 1
// });

// canvas.addEventListener("mouseup", function(e) {
//   trackClick = 0
// });

// canvas.addEventListener("mouseover", function(e) {
//   if (!trackClick) {
//     return
//   }
//   const id = e.target.id
//   const touchedSpan = document.getElementById(id)
//   touchedSpan.style.backgroundColor = 'red';
// });

Array.from(spans).map(function(span) {
  span.addEventListener("mousedown", function(e) {
    span.style.backgroundColor = 'red';
    trackClick = 1
  });

  span.addEventListener("mouseup", function(e) {
    trackClick = 0
  });

  span.addEventListener("mouseover", function(e) {
    if (!trackClick) {
      return
    }
    span.style.backgroundColor = 'red';
  }); 
})
