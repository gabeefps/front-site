const API_BASE_URL = String(window.DISCOVEY_CONFIG?.apiBaseUrl || '').replace(/\/$/, '');
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');

toggle.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  toggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.desktop-nav a').forEach(link => link.addEventListener('click', () => {
  header.classList.remove('menu-open');
  toggle.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: .16 });

document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const item = entry.target;
    const target = Number(item.dataset.count);
    const start = performance.now();
    const animate = now => {
      const progress = Math.min((now - start) / 1100, 1);
      item.textContent = Math.floor(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    countObserver.unobserve(item);
  });
}, { threshold: .5 });

document.querySelectorAll('[data-count]').forEach(item => countObserver.observe(item));

const playerCounter = document.querySelector('#players');
setInterval(() => {
  const current = Number(playerCounter.textContent);
  const next = Math.max(450, Math.min(520, current + Math.floor(Math.random() * 7) - 3));
  playerCounter.textContent = next;
}, 3500);

async function syncStreamers(){
  const grid=document.querySelector('.streamer-grid');
  if(!grid)return;
  grid.innerHTML='';
  try{
    const response=await fetch(`${API_BASE_URL}/api/streamers`);
    if(!response.ok)return;
    const {streamers}=await response.json();
    if(!Array.isArray(streamers)||!streamers.length)return;
    grid.innerHTML=streamers.slice(0,6).map((item,index)=>`<a class="streamer-card visible ${item.is_live?'is-live':''}" href="${safeUrl(item.is_live?item.live_url:item.channel_url)}" target="_blank" rel="noopener"><div class="streamer-visual ${index%3===1?'alt':index%3===2?'third':''}" ${item.live_thumbnail||item.profile_image_url?`style="background-image:linear-gradient(rgba(10,10,15,.22),rgba(10,10,15,.75)),url('${safeUrl(item.live_thumbnail||item.profile_image_url)}');background-size:cover;background-position:center"`:''}><span class="${item.is_live?'live-badge':'video-badge'}">${item.is_live?'● AO VIVO':String(item.platform).toUpperCase()}</span><b>${item.profile_image_url?'':initials(item.name)}</b><i>${item.is_live?`${item.viewer_count??''} ${item.viewer_count!=null?'ASSISTINDO':''}`:'OFFLINE'}</i></div><div class="streamer-info"><span><strong>${safeText(item.name)}</strong><small>${item.is_live?safeText(item.live_title):safeText(item.handle)}</small></span><b>↗</b></div></a>`).join('');
  }catch{}
}
function safeText(value){const element=document.createElement('span');element.textContent=value??'';return element.innerHTML}
function safeUrl(value){try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:'#'}catch{return '#'}}
function initials(value){return String(value||'ST').split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase()}
syncStreamers();

let lastFocusedElement;
function openModal(id){const modal=document.getElementById(id);if(!modal)return;lastFocusedElement=document.activeElement;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');setTimeout(()=>modal.querySelector('input,button')?.focus(),50)}
function closeModal(modal){if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');modal.querySelector('.form-message.show')?.classList.remove('show');lastFocusedElement?.focus()}
document.querySelectorAll('[data-open-modal]').forEach(button=>button.addEventListener('click',()=>openModal(button.dataset.openModal)));
document.querySelectorAll('[data-close-modal]').forEach(button=>button.addEventListener('click',()=>closeModal(button.closest('.modal'))));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal(document.querySelector('.modal.open'))});
document.querySelectorAll('.show-password').forEach(button=>button.addEventListener('click',()=>{const input=button.previousElementSibling;const showing=input.type==='text';input.type=showing?'password':'text';button.textContent=showing?'MOSTRAR':'OCULTAR'}));
document.querySelectorAll('#login-modal [data-demo-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();form.querySelector('.form-message')?.classList.add('show')}));
document.querySelector('[data-steam-login]')?.addEventListener('click',event=>{event.currentTarget.textContent='Steam pronta para integração ✓'});
const loginView=document.querySelector('.login-view');const forgotView=document.querySelector('.forgot-view');
document.querySelector('[data-forgot-password]')?.addEventListener('click',()=>{loginView.classList.add('hidden');forgotView.classList.add('active');forgotView.querySelector('input')?.focus()});
document.querySelector('[data-back-login]')?.addEventListener('click',()=>{forgotView.classList.remove('active');loginView.classList.remove('hidden');loginView.querySelector('input')?.focus()});
const restrictedModal=document.querySelector('#restricted-modal');
if(restrictedModal){
  restrictedModal.querySelector('.modal-kicker').textContent='Acesso exclusivo da staff';
  restrictedModal.querySelector('.modal-subtitle').textContent='Painel interno reservado aos membros autorizados da equipe Discovey.';
  const staffNote=document.createElement('span');staffNote.className='staff-note';staffNote.textContent='ACESSO SOMENTE PARA STAFF • Tentativas de acesso são registradas.';
  restrictedModal.querySelector('.auth-form').before(staffNote);
  const form=restrictedModal.querySelector('.auth-form');
  form.id='staff-login-form';
  const labels=form.querySelectorAll('label');
  labels[0].childNodes[0].textContent='Usuário da staff';
  labels[0].querySelector('input').name='username';
  labels[0].querySelector('input').placeholder='Digite seu usuário';
  labels[0].querySelector('input').autocomplete='username';
  labels[1].childNodes[0].textContent='Senha';
  labels[1].querySelector('input').name='password';
  labels[1].querySelector('input').type='password';
  labels[1].querySelector('input').placeholder='Digite sua senha';
  labels[1].querySelector('input').autocomplete='current-password';
  form.querySelector('.modal-submit').textContent='Entrar no painel →';
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const message=form.querySelector('.form-message');
    const button=form.querySelector('.modal-submit');
    button.disabled=true;button.textContent='Validando...';message.classList.remove('show');
    try{
      const response=await fetch(`${API_BASE_URL}/api/auth/staff/login`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Não foi possível entrar.');
      location.href=data.redirect;
    }catch(error){message.textContent=error.message;message.classList.add('show');button.disabled=false;button.textContent='Entrar no painel →'}
  });
}
const loginModal=document.querySelector('#login-modal');
if(loginModal){
  loginModal.querySelector('.modal-kicker').textContent='Acesso do player';
  loginModal.querySelector('.modal-subtitle').textContent='Entre como jogador para acessar sua conta na Discovey.';
  loginModal.querySelector('[data-create-account]')?.closest('.modal-foot')?.remove();
}
