// ── Helpers ──
const $=id=>document.getElementById(id);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function getUsers(){try{return JSON.parse(localStorage.getItem('kroxy_users')||'{}')}catch{return{}}}
function saveUsers(u){localStorage.setItem('kroxy_users',JSON.stringify(u))}
function setSession(u){localStorage.setItem('kroxy_session',JSON.stringify(u))}
function getSession(){try{return JSON.parse(localStorage.getItem('kroxy_session')||'null')}catch{return null}}

// Auto-redirect if already logged in
window.addEventListener('DOMContentLoaded',()=>{
  if(getSession()){window.location.href='chat.html';return}
  showCard('login')
})

function showCard(type){
  $('loginCard').classList.toggle('hidden',type!=='login')
  $('registerCard').classList.toggle('hidden',type!=='register')
}

function toggleEye(inputId,btn){
  const inp=$(inputId)
  inp.type=inp.type==='password'?'text':'password'
  btn.style.color=inp.type==='text'?'rgba(255,255,255,.7)':'rgba(255,255,255,.35)'
}

function checkStrength(val){
  const fill=$('strengthFill'),label=$('strengthLabel')
  if(!val){fill.style.width='0%';label.textContent='';return}
  let s=0
  if(val.length>=6)s++
  if(val.length>=10)s++
  if(/[A-Z]/.test(val))s++
  if(/[0-9]/.test(val))s++
  if(/[^A-Za-z0-9]/.test(val))s++
  const labels=['','Weak','Fair','Good','Strong','Very Strong']
  const colors=['','#ef4444','#f97316','#eab308','#22c55e','#10b981']
  const pcts=['0%','20%','40%','65%','85%','100%']
  fill.style.width=pcts[s];fill.style.background=colors[s]
  label.textContent=labels[s];label.style.color=colors[s]
}

function showError(id,msg){const el=$(id);el.textContent='⚠️ '+msg;el.classList.remove('hidden')}
function hideError(id){$(id).classList.add('hidden')}

async function handleLogin(){
  const email=$('loginEmail').value.trim()
  const pass=$('loginPass').value
  hideError('loginError')
  if(!email||!pass){showError('loginError','Please fill in all fields.');return}
  const users=getUsers()
  if(!users[email]){showError('loginError','No account found with that email.');return}
  if(users[email].password!==btoa(pass)){showError('loginError','Incorrect password.');return}
  const btn=$('loginBtn')
  btn.disabled=true
  btn.innerHTML='<div class="spinner"></div> Signing in...'
  await sleep(600)
  setSession({email,firstName:users[email].firstName,lastName:users[email].lastName})
  window.location.href='chat.html'
}

async function handleRegister(){
  const first=$('regFirst').value.trim()
  const last=$('regLast').value.trim()
  const email=$('regEmail').value.trim()
  const pass=$('regPass').value
  const confirm=$('regConfirm').value
  hideError('regError');$('regSuccess').classList.add('hidden')
  if(!first||!last||!email||!pass||!confirm){showError('regError','Please fill in all fields.');return}
  if(!email.includes('@')){showError('regError','Enter a valid email address.');return}
  if(pass.length<6){showError('regError','Password must be at least 6 characters.');return}
  if(pass!==confirm){showError('regError','Passwords do not match.');return}
  const users=getUsers()
  if(users[email]){showError('regError','An account with this email already exists.');return}
  const btn=$('registerBtn')
  btn.disabled=true
  btn.innerHTML='<div class="spinner"></div> Creating account...'
  await sleep(700)
  users[email]={firstName:first,lastName:last,password:btoa(pass)}
  saveUsers(users)
  btn.disabled=false
  btn.innerHTML='Create Account'
  const suc=$('regSuccess')
  suc.textContent='✅ Account created! Redirecting to login...'
  suc.classList.remove('hidden')
  await sleep(1200)
  showCard('login')
  $('loginEmail').value=email
}
