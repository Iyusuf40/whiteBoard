const root = document.getElementById('root')
const createAccountForm = document.getElementById('create--act--form')
const loginForm = document.getElementById('login--form')
const canvasForm = document.getElementById('create--canvas--form')
const createRoomBtn = document.getElementById('create--wss')

let key = null
const baseUrl = 'http://localhost:3000/'

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
  } else if (data.error) {
    alert (data.error)
  } else {
    throw new Error('undefined behavior occured')
  } 
}

async function handleCreateWss(e) {
  e.preventDefault()
  if (!key) return alert('you are not logged in')
  const body = JSON.stringify({key: key})
  const data = await postData(baseUrl + 'canvas_socket', body)
  if (!data) return alert('undefined behaviour occured during account creation')
  if (data.message) {
    alert(`${data.message}`)
    createSocket() // create local sock and connect to remote
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

function createSocket() {

  if (!key) return alert ('you are not logged in')

  if (socketCreated) return

  const socket = new WebSocket('ws://localhost:3000/' + key);

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
