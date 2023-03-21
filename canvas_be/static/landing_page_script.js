const createAccountForm = document.getElementById('create--act--form')
const loginForm = document.getElementById('login--form')
const showCreateActForm = document.getElementById('create--acct--btn')
const showLoginActForm = document.getElementById('login--btn')
const goToCanvas = document.getElementById('canvas--btn')
const removeFormBtns = document.getElementsByClassName('remove--form')


let key = null
const baseUrl = 'https://collab.cloza.tech/'

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


createAccountForm.addEventListener('submit', handleCreateAcct)
loginForm.addEventListener('submit', handleLoginSubmit)
showCreateActForm.addEventListener('click', showActForm)
showLoginActForm.addEventListener('click', showLoginForm)
goToCanvas.addEventListener('click', handleGoToCanvas)

Array.from(removeFormBtns).forEach((btn) => {
  btn.addEventListener('click', () => {
    hideActForm()
    hideLoginForm()
  })
})

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
    alert('login successful')
  } else if (data.error) {
    alert (data.error)
  } else {
    throw new Error('undefined behavior occured')
  }
}

function handleGoToCanvas() {
  if (!key) return alert('you are not logged in')
  console.log(key)
  const url = baseUrl + `enter/${key}`
  // go to canvas and set key to key
  window.location.href = url
}

function showActForm() {
  hideLoginForm()
  createAccountForm.style.display = 'block'
}

function showLoginForm() {
  hideActForm()
  loginForm.style.display = 'block'
}

function hideActForm() {
  createAccountForm.style.display = 'none'
}

function hideLoginForm() {
  loginForm.style.display = 'none'
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
