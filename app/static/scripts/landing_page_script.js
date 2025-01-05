const createAccountForm = document.getElementById('create--act--form')
const loginForm = document.getElementById('login--form')
const showLoginActForm = document.getElementById('login--btn')
const goToCanvas = document.getElementById('canvas--btn')
const removeFormBtns = document.getElementsByClassName('remove--form')
const blur = document.getElementById('blur')


let key = null
const baseUrl = 'https://collab.cloza.org/'

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
showLoginActForm.addEventListener('click', showLoginForm)
goToCanvas.addEventListener('click', handleGoToCanvas)
blur.addEventListener('click', hideAll)

Array.from(removeFormBtns).forEach((btn) => {
  btn.addEventListener('click', () => {
    hideAll()
  })
})

function hideAll() {
  hideActForm()
  hideLoginForm()
  hideBlur()
}

async function handleCreateAcct(e) {
  e.preventDefault()
  const id = document.getElementById('create--act--id').value
  const password = document.getElementById('create--act--passwd').value
  const body = JSON.stringify({ id, password })
  const data = await postData(baseUrl + 'account', body)
  if (!data) return alert('undefined behaviour occured during account creation')
  handleAuthResponse(data, 'Account creation successful')
}

async function handleLoginSubmit(e) {
  console.log('login')
  e.preventDefault()
  const id = document.getElementById('login--id').value
  const password = document.getElementById('login--passwd').value
  const body = JSON.stringify({ id, password })
  const data = await postData(baseUrl + 'login', body)
  if (!data) return alert('undefined behaviour occured during login')
  handleAuthResponse(data, 'Login successful')
}

function handleAuthResponse(data, successMessage) {
  if (!data) {
    alert('Undefined behavior occurred');
    return false;
  }

  if (data.key) {
    key = data.key;
    alert(successMessage);
    hideAll();
    document.getElementById('login--btn').classList.add('hidden');
    document.getElementById('hero-canvas-btn').classList.remove('hidden');
    document.getElementById('hero-get-started-btn').classList.add('hidden');
    goToCanvas.style.display = 'flex';
    return true;
  } 
  
  if (data.error) {
    alert(data.error);
    return false;
  } 

  throw new Error('Undefined behavior occurred');
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
  showBlur()
  createAccountForm.classList.remove("hidden")
  createAccountForm.classList.add("showing")
}

function showLoginForm() {
  hideActForm()
  showBlur()
  loginForm.classList.remove("hidden")
  loginForm.classList.add("showing")
}

function hideActForm() {
  createAccountForm.classList.add("hidden")
}

function hideLoginForm() {
  loginForm.classList.add("hidden")
}

function hideBlur() {
  blur.style.display = 'none'
}

function showBlur() {
  blur.style.display = 'block'
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
