// ═══════════════════════════════════════════════════════
// KROXY AI — chat.js
// ═══════════════════════════════════════════════════════

// ── Helpers ──
const $=id=>document.getElementById(id);
const randId=()=>Math.random().toString(36).slice(2,9);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// ── State ──
let currentUser = null;
let currentThreadId = null;
let threads = {};
let history = [];
let attachedFiles = [];
let mediaRecorder = null;
let isRecording = false;
let sidebarOpen = true;

// ── Session guard ──
window.addEventListener('DOMContentLoaded', () => {
  const session = getSession();
  if (!session) { window.location.href = 'index.html'; return; }
  currentUser = session;
  initUI();
});

function getSession(){ try{return JSON.parse(localStorage.getItem('kroxy_session')||'null')}catch{return null} }
function clearSession(){ localStorage.removeItem('kroxy_session') }

function loadThreads(){
  try{ return JSON.parse(localStorage.getItem(`kroxy_threads_${currentUser.email}`)||'{}') }catch{ return {} }
}
function saveThreads(){
  localStorage.setItem(`kroxy_threads_${currentUser.email}`, JSON.stringify(threads));
}

// ── Init ──
function initUI(){
  const u = currentUser;
  const initials = (u.firstName[0]+(u.lastName[0]||'')).toUpperCase();
  $('sbAvatar').textContent = initials;
  $('sbName').textContent = `${u.firstName} ${u.lastName}`;
  $('sbEmail').textContent = u.email;
  threads = loadThreads();
  renderThreadList();
  newChat();
}

function logout(){
  clearSession();
  window.location.href = 'index.html';
}

// ── Sidebar ──
function toggleSidebar(){
  sidebarOpen = !sidebarOpen;
  $('sidebar').classList.toggle('collapsed', !sidebarOpen);
  $('sbOpenBtn').classList.toggle('hidden', sidebarOpen);
}

// ── Threads ──
function renderThreadList(){
  const container = $('sbThreads');
  const keys = Object.keys(threads).sort((a,b)=>(threads[b].ts||0)-(threads[a].ts||0));
  if(!keys.length){ container.innerHTML='<div class="sb-empty">No chats yet. Start one!</div>'; return; }
  container.innerHTML = keys.map(id=>`
    <div class="thread-item ${id===currentThreadId?'active':''}" onclick="loadThread('${id}')">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
      <span class="thread-name">${esc(threads[id].title||'New Chat')}</span>
    </div>`).join('');
}

function newChat(){
  currentThreadId = randId();
  history = [];
  attachedFiles = [];
  threads[currentThreadId] = { title:'New Chat', messages:[], ts:Date.now() };
  saveThreads();
  renderThreadList();
  $('messages').innerHTML = '';
  $('messages').appendChild(buildWelcome());
  $('chatInput').value = '';
  $('attachRow').innerHTML = '';
}

function loadThread(id){
  currentThreadId = id;
  history = [];
  const t = threads[id];
  $('messages').innerHTML = '';
  if(!t.messages||!t.messages.length){
    $('messages').appendChild(buildWelcome());
  } else {
    t.messages.forEach(m=>renderMessage(m.role, m.content, false, m.imgs||[]));
    history = t.messages.map(m=>({role:m.role, content:m.content}));
  }
  renderThreadList();
}

function buildWelcome(){
  const div = document.createElement('div');
  div.className = 'welcome';
  div.id = 'welcome';
  div.innerHTML = `
    <svg width="60" height="60" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="url(#wg)"/>
      <path d="M14 24C14 18 19 14 24 14C29 14 34 18 34 24C34 30 29 34 24 34" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <circle cx="24" cy="24" r="4" fill="white"/>
      <path d="M24 30L20 37M24 30L28 37" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
      <defs><linearGradient id="wg" x1="0" y1="0" x2="48" y2="48"><stop offset="0%" stop-color="#8B5CF6"/><stop offset="100%" stop-color="#5B21B6"/></linearGradient></defs>
    </svg>
    <h2>Hi, I&apos;m <span class="purple">Kroxy</span> 👋</h2>
    <p>Ask me anything — I search the web 🔍, write code 💻, design thumbnails 🎬</p>
    <div class="chips">
      <button class="chip" onclick="quickSend('What\\'s trending on YouTube right now?')">🔍 What&apos;s trending on YouTube?</button>
      <button class="chip" onclick="quickSend('Help me create an epic Minecraft thumbnail')">⛏️ Minecraft thumbnail</button>
      <button class="chip" onclick="quickSend('Write me a Python Discord bot with slash commands')">🐍 Python Discord bot</button>
      <button class="chip" onclick="quickSend('Design a Roblox channel banner — dark neon theme')">🎮 Roblox channel art</button>
    </div>`;
  return div;
}

function quickSend(text){
  $('chatInput').value = text;
  sendMessage();
}

// ── Saving ──
function saveToThread(role, content, imgs=[]){
  if(!threads[currentThreadId]) return;
  if(!threads[currentThreadId].messages) threads[currentThreadId].messages = [];
  threads[currentThreadId].messages.push({role, content, imgs});

  // Auto-title from first user message using first 5 words
  if(role==='user' && threads[currentThreadId].title==='New Chat'){
    const words = content.trim().split(/\s+/).slice(0,6).join(' ');
    threads[currentThreadId].title = words + (content.split(/\s+/).length>6?'…':'');
  }
  threads[currentThreadId].ts = Date.now();
  saveThreads();
  renderThreadList();
}

// ── Input ──
function handleKey(e){
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()}
}
function autoResize(el){
  el.style.height='auto';
  el.style.height=Math.min(el.scrollHeight,160)+'px';
}

// ── Send ──
async function sendMessage(){
  const input = $('chatInput');
  const text = input.value.trim();
  if(!text && !attachedFiles.length) return;

  // Remove welcome
  const welcome = document.getElementById('welcome');
  if(welcome) welcome.remove();

  const imgPreviews = attachedFiles.filter(f=>f.type==='image').map(f=>f.dataUrl);
  renderMessage('user', text, true, imgPreviews);
  history.push({role:'user', content: text||'[Image attached]'});
  saveToThread('user', text||'[Image attached]', imgPreviews);

  input.value=''; input.style.height='auto';
  attachedFiles=[];$('attachRow').innerHTML='';

  const typingId = showTyping();
  $('sendBtn').disabled=true;

  try {
    // Stream response from Groq via our serverless function
    const reply = await streamChat(history, typingId);
    history.push({role:'assistant', content:reply});
    saveToThread('assistant', reply);
    speakReply(reply);
  } catch(e){
    removeTyping(typingId);
    renderMessage('ai', `❌ **Error:** ${e.message}\n\nMake sure your Vercel environment variables are set:\n- \`GROQ_API_KEY\`\n- \`GEMINI_API_KEY\``, true);
  }

  $('sendBtn').disabled=false;
}

async function streamChat(msgs, typingId){
  const res = await fetch(API.CHAT, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({messages: msgs}),
  });

  if(!res.ok){
    const err = await res.json().catch(()=>({}));
    throw new Error(err.error||`API error ${res.status}`);
  }

  removeTyping(typingId);

  // Create the AI message bubble for streaming
  const msgEl = renderMessage('ai', '', true);
  const bubbleEl = msgEl.querySelector('.bubble');
  let fullText = '';

  // SSE streaming
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while(true){
    const {done, value} = await reader.read();
    if(done) break;
    buffer += decoder.decode(value, {stream:true});
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for(const line of lines){
      if(!line.startsWith('data:')) continue;
      const raw = line.slice(5).trim();
      if(raw==='[DONE]') break;
      try{
        const json = JSON.parse(raw);
        const delta = json.choices?.[0]?.delta?.content||'';
        if(delta){
          fullText += delta;
          bubbleEl.innerHTML = renderMarkdown(fullText);
        }
      }catch{}
    }
  }

  const msgs2 = $('messages');
  msgs2.scrollTop = msgs2.scrollHeight;
  return fullText;
}

// ── Render message ──
function renderMessage(role, content, animate=true, imgs=[]){
  const wrap = $('messages');
  const div = document.createElement('div');
  div.className = `msg ${role}`;

  const aiAv = `<div class="msg-av">
    <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="url(#av${randId()})"/>
      <path d="M14 24C14 18 19 14 24 14C29 14 34 18 34 24C34 30 29 34 24 34" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <circle cx="24" cy="24" r="4" fill="white"/>
      <defs><linearGradient id="av${randId()}" x1="0" y1="0" x2="48" y2="48"><stop offset="0%" stop-color="#8B5CF6"/><stop offset="100%" stop-color="#5B21B6"/></linearGradient></defs>
    </svg></div>`;
  const userAv = `<div class="msg-av">${(currentUser.firstName[0]+(currentUser.lastName[0]||'')).toUpperCase()}</div>`;
  const av = role==='ai' ? aiAv : userAv;

  const imgHtml = imgs.map(src=>`<img src="${src}" class="msg-img" alt="attachment"/>`).join('');
  const bubbleContent = role==='ai' ? renderMarkdown(content) : `<p>${esc(content).replace(/\n/g,'<br/>')}</p>`;

  div.innerHTML = `${av}<div class="msg-body"><div class="bubble">${bubbleContent}${imgHtml}</div></div>`;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
  return div;
}

function showTyping(){
  const wrap = $('messages');
  const id = 'typing_'+randId();
  const div = document.createElement('div');
  div.id = id; div.className = 'msg ai';
  div.innerHTML = `<div class="msg-av"><svg width="30" height="30" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="url(#tg)"/><path d="M14 24C14 18 19 14 24 14C29 14 34 18 34 24C34 30 29 34 24 34" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="24" cy="24" r="4" fill="white"/><defs><linearGradient id="tg" x1="0" y1="0" x2="48" y2="48"><stop offset="0%" stop-color="#8B5CF6"/><stop offset="100%" stop-color="#5B21B6"/></linearGradient></defs></svg></div><div class="msg-body"><div class="bubble"><div class="typing-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div></div>`;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
  return id;
}
function removeTyping(id){ const el=$(id); if(el) el.remove(); }

// ── Markdown renderer ──
function renderMarkdown(text){
  if(!text) return '';

  // Fenced code blocks
  text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_,lang,code)=>{
    const l = lang||'code';
    const id = randId();
    return `<div class="code-block"><div class="code-header"><span class="code-lang">${l}</span><button class="copy-btn" id="cb${id}" onclick="copyCode('cb${id}')"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy</button></div><pre><code>${esc(code.trim())}</code></pre></div>`;
  });

  // Inline code
  text = text.replace(/`([^`]+)`/g,'<code>$1</code>');
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  // Italic
  text = text.replace(/\*([^*]+)\*/g,'<em>$1</em>');
  // Underline
  text = text.replace(/__(.+?)__/g,'<u>$1</u>');
  // H3 H2 H1
  text = text.replace(/^### (.+)$/gm,'<h3>$1</h3>');
  text = text.replace(/^## (.+)$/gm,'<h2>$1</h2>');
  text = text.replace(/^# (.+)$/gm,'<h1>$1</h1>');
  // Horizontal rule
  text = text.replace(/^---$/gm,'<hr/>');
  // Unordered list
  text = text.replace(/^[-*] (.+)$/gm,'<li>$1</li>');
  text = text.replace(/(<li>[\s\S]*?<\/li>\n?)+/g,m=>`<ul>${m}</ul>`);
  // Ordered list
  text = text.replace(/^\d+\. (.+)$/gm,'<li>$1</li>');
  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Wrap remaining lines in <p>
  const lines = text.split('\n');
  let html = '';
  for(const line of lines){
    if(!line.trim()) continue;
    if(/^<(h[123]|ul|ol|pre|li|hr|div|blockquote)/.test(line.trim())) html+=line;
    else html+=`<p>${line}</p>`;
  }
  return html;
}

function copyCode(btnId){
  const btn = $(btnId);
  const code = btn.closest('.code-block').querySelector('code');
  navigator.clipboard.writeText(code.innerText).then(()=>{
    btn.innerHTML='✅ Copied';
    setTimeout(()=>{ btn.innerHTML='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy'; },1500);
  });
}

// ── File attachments ──
function handleFiles(input){
  Array.from(input.files).forEach(f=>{
    const reader = new FileReader();
    reader.onload = e=>{
      const obj = {name:f.name, type:f.type.startsWith('image/')?'image':'file', dataUrl:e.target.result};
      attachedFiles.push(obj);
      renderAttachPreview(obj, attachedFiles.length-1);
    };
    reader.readAsDataURL(f);
  });
  input.value='';
}

function renderAttachPreview(obj, idx){
  const row = $('attachRow');
  const wrap = document.createElement('div');
  if(obj.type==='image'){
    wrap.className='attach-thumb';
    wrap.innerHTML=`<img src="${obj.dataUrl}" alt="${obj.name}"/><button class="attach-rm" onclick="removeAttach(${idx},this.parentNode)">×</button>`;
  } else {
    wrap.className='attach-file';
    wrap.innerHTML=`<span>📄</span><span style="overflow:hidden;max-width:44px;text-overflow:ellipsis;white-space:nowrap">${obj.name.split('.').pop().toUpperCase()}</span>`;
  }
  row.appendChild(wrap);
}

function removeAttach(idx, el){ attachedFiles.splice(idx,1); el.remove(); }

// ── Voice STT — Groq Whisper ──
function toggleVoice(){
  if(isRecording) stopVoice();
  else startVoice();
}

async function startVoice(){
  try{
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    const recorder = new MediaRecorder(stream, {mimeType:'audio/webm'});
    const chunks = [];
    recorder.ondataavailable = e=>{ if(e.data.size>0) chunks.push(e.data); };
    recorder.onstop = async()=>{
      stream.getTracks().forEach(t=>t.stop());
      $('micBtn').className='mic-btn transcribing';
      $('voiceStatus').textContent='Transcribing...';
      try{
        const blob = new Blob(chunks, {type:'audio/webm'});
        const fd = new FormData();
        fd.append('audio', blob, 'recording.webm');
        const res = await fetch(API.TRANSCRIBE, {method:'POST', body:fd});
        const data = await res.json();
        if(data.text){
          $('chatInput').value = data.text;
          autoResize($('chatInput'));
        }
      }catch(e){ console.error('Transcription failed:',e); }
      finally{
        $('voiceModal').classList.add('hidden');
        $('micBtn').className='mic-btn';
        isRecording=false;
        mediaRecorder=null;
      }
    };
    mediaRecorder=recorder;
    recorder.start();
    isRecording=true;
    $('micBtn').className='mic-btn recording';
    $('voiceModal').classList.remove('hidden');
    $('voiceStatus').textContent='Listening... 🎤';
    $('voiceTranscript').textContent='';
  }catch(e){
    alert('Microphone access denied. Please allow mic permissions and try again.');
  }
}

function stopVoice(){
  if(mediaRecorder) mediaRecorder.stop();
}

// ── TTS — browser speech synthesis ──
function speakReply(text){
  if(!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const clean = text
    .replace(/```[\s\S]*?```/g,'')
    .replace(/`[^`]*`/g,'')
    .replace(/\*\*|__|#{1,3} /g,'')
    .replace(/\[([^\]]+)\]\([^)]+\)/g,'$1')
    .slice(0,400);
  const utt = new SpeechSynthesisUtterance(clean);
  utt.rate=1.05; utt.pitch=1;
  window.speechSynthesis.speak(utt);
}
