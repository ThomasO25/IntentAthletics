// ═══════════════════════════════════════
//  Intent Athletics Admin — Supabase
// ═══════════════════════════════════════

// Guard — make sure supabase.js loaded correctly
if (!window.DB) {
  console.error('Supabase client (DB) not loaded. Check supabase.js is included before admin.js.');
  document.addEventListener('DOMContentLoaded', () => {
    const err = document.getElementById('login-error');
    if (err) {
      err.textContent = 'Admin panel failed to load. Try a hard refresh (Ctrl+Shift+R / Cmd+Shift+R).';
      err.style.display = 'block';
    }
  });
}

// ── AUTH ──
async function tryLogin() {
  const emailEl = document.getElementById('admin-email');
  const passEl  = document.getElementById('admin-pass');
  const errEl   = document.getElementById('login-error');
  const btn     = document.getElementById('login-btn');

  const email = emailEl ? emailEl.value.trim() : '';
  const pass  = passEl  ? passEl.value         : '';

  errEl.textContent = '';
  errEl.style.display = 'none';

  if (!email) {
    errEl.textContent = 'Please enter your email.';
    errEl.style.display = 'block';
    return;
  }
  if (!pass) {
    errEl.textContent = 'Please enter your password.';
    errEl.style.display = 'block';
    return;
  }

  if (!window.DB) {
    errEl.textContent = 'Admin panel not loaded correctly — try a hard refresh.';
    errEl.style.display = 'block';
    return;
  }

  btn.textContent = 'Signing in…';
  btn.disabled = true;

  let result;
  try {
    result = await window.DB.signIn(email, pass);
  } catch(e) {
    result = { error: { message: `Unexpected error: ${e.message}` } };
  }

  btn.textContent = 'Sign in';
  btn.disabled = false;

  if (!result) {
    errEl.textContent = 'No response from server — check your internet connection.';
    errEl.style.display = 'block';
    return;
  }

  if (result.error) {
    errEl.textContent = result.error.message || 'Incorrect email or password.';
    errEl.style.display = 'block';
    if (passEl) passEl.value = '';
    return;
  }

  if (!result.access_token) {
    errEl.textContent = 'Login did not complete. Make sure you confirmed your email from the Supabase invite.';
    errEl.style.display = 'block';
    return;
  }

  // Success
  const loginScreen = document.getElementById('login-screen');
  const adminWrap   = document.getElementById('admin-wrap');
  if (loginScreen) loginScreen.style.display = 'none';
  if (adminWrap)   adminWrap.style.display   = 'flex';
  setSection('merch');
}

document.getElementById('login-btn').addEventListener('click', tryLogin);
document.getElementById('admin-pass').addEventListener('keydown', e => { if(e.key==='Enter') tryLogin(); });
document.getElementById('admin-email').addEventListener('keydown', e => { if(e.key==='Enter') tryLogin(); });

// Password show/hide toggle
const toggleBtn  = document.getElementById('toggle-pass');
const passInput  = document.getElementById('admin-pass');
const eyeIcon    = document.getElementById('eye-icon');
const eyeOpen    = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
const eyeClosed  = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;

if (toggleBtn && passInput && eyeIcon) {
  toggleBtn.addEventListener('click', () => {
    const isHidden = passInput.type === 'password';
    passInput.type = isHidden ? 'text' : 'password';
    eyeIcon.innerHTML = isHidden ? eyeClosed : eyeOpen;
    toggleBtn.title = isHidden ? 'Hide password' : 'Show password';
    passInput.focus();
  });
}

document.getElementById('logout-btn').addEventListener('click', async () => {
  await window.DB.signOut();
  document.getElementById('admin-wrap').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-email').value = '';
  document.getElementById('admin-pass').value = '';
});

// Check if already logged in
if (window.DB.getSession()) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-wrap').style.display = 'flex';
  setTimeout(() => setSection('merch'), 100);
}

// ── TOAST ──
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── SECTION ROUTING ──
let currentSection = 'merch';

document.querySelectorAll('.sidebar-btn[data-section]').forEach(btn => {
  btn.addEventListener('click', () => setSection(btn.dataset.section));
});

function setSection(s) {
  currentSection = s;
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.toggle('active', b.dataset.section === s));
  const titles = { merch: 'Merch items', clients: 'Clients', training: 'Training programs', bio: 'Bio & About page', settings: 'Settings' };
  document.getElementById('editor-title').textContent = titles[s] || s;
  const addBtn = document.getElementById('add-btn');
  addBtn.style.display = (s === 'settings' || s === 'bio') ? 'none' : 'flex';
  renderEditor();
  renderPreview();
}

document.getElementById('add-btn').addEventListener('click', () => {
  if (currentSection === 'merch') openMerchForm(null);
  if (currentSection === 'clients') openClientForm(null);
  if (currentSection === 'training') openTrainingForm(null);
});

// ── DRAG TO REORDER ──
let dragSrc = null;

function makeDraggable(list, onDrop) {
  if (!list) return;
  list.querySelectorAll('.item-row').forEach((row, i) => {
    row.draggable = true;
    row.dataset.index = i;
    row.addEventListener('dragstart', e => { dragSrc = row; row.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    row.addEventListener('dragend',   () => { row.classList.remove('dragging'); list.querySelectorAll('.item-row').forEach(r => r.classList.remove('drag-over')); });
    row.addEventListener('dragover',  e => { e.preventDefault(); if(dragSrc!==row) row.classList.add('drag-over'); });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', async e => {
      e.preventDefault();
      row.classList.remove('drag-over');
      if (dragSrc === row) return;
      if (onDrop) await onDrop(parseInt(dragSrc.dataset.index), parseInt(row.dataset.index));
    });
  });
}

// ── IMAGE UPLOAD ──
function setupImg(inputId, previewId, thumbId, onLoad) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById(thumbId).src = e.target.result;
      document.getElementById(previewId).style.display = 'block';
      if (onLoad) onLoad(e.target.result, file);
    };
    reader.readAsDataURL(file);
  });
}

// ── RENDER ROUTER ──
function renderEditor() {
  if (currentSection === 'merch') renderMerchEditor();
  else if (currentSection === 'clients') renderClientsEditor();
  else if (currentSection === 'training') renderTrainingEditor();
  else if (currentSection === 'bio') renderBioEditor();
  else if (currentSection === 'settings') renderSettingsEditor();
}

function renderPreview() {
  if (currentSection === 'merch') renderMerchPreview();
  else if (currentSection === 'clients') renderClientsPreview();
  else if (currentSection === 'training') renderTrainingPreview();
  else if (currentSection === 'bio') renderBioPreview();
  else document.getElementById('preview-body').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#aaa;font-size:14px;">No preview for settings.</div>';
}

// ════════════════════════════
//  MERCH
// ════════════════════════════
let merchItems = [];
let editingMerchId = null;
let merchImgFile = null;
let merchImgPreview = '';

async function renderMerchEditor() {
  document.getElementById('editor-body').innerHTML = `<div class="empty-msg" style="color:#555;">Loading…</div>`;
  merchItems = await window.DB.get('merch');

  const settings = await window.DB.getSingle('settings', 'merch_settings');
  const ms = settings ? (settings.value || {}) : { mode: 'coming_soon', releaseDate: '' };
  const mode = ms.mode || 'coming_soon';

  let html = `
  <div class="form-section" style="margin-bottom:1rem;">
    <div class="form-section-title">Store display mode</div>
    <div class="field">
      <label>What visitors see on the Merch page</label>
      <select id="merch-mode-select" onchange="saveMerchMode()">
        <option value="coming_soon"  ${mode==='coming_soon' ?'selected':''}>Coming Soon</option>
        <option value="release_date" ${mode==='release_date'?'selected':''}>Countdown to release date</option>
        <option value="live"         ${mode==='live'        ?'selected':''}>Live — show merch items</option>
      </select>
    </div>
    <div id="release-date-field" style="${mode==='release_date'?'':'display:none;'}">
      <div class="field" style="margin-top:0.8rem;">
        <label>Release date</label>
        <input type="date" id="merch-release-date" value="${ms.releaseDate||''}" onchange="saveMerchMode()">
      </div>
    </div>
    <div style="margin-top:0.8rem;font-size:11px;color:#555;line-height:1.6;">
      <b style="color:#888;">Coming Soon</b> — splash page with email notify.<br>
      <b style="color:#888;">Countdown</b> — live countdown timer to your release date.<br>
      <b style="color:#888;">Live</b> — shows your actual merch items.
    </div>
  </div>
  <div class="item-list" id="merch-list">`;

  if (!merchItems.length) html += `<div class="empty-msg">No items yet. Click + Add to get started.</div>`;
  merchItems.forEach((item, i) => {
    html += `<div class="item-row" data-index="${i}" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-thumb">${item.image?`<img src="${item.image}" alt="">`:svgBox()}</div>
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-meta">${item.price?'$'+item.price:'No price'}</div>
      </div>
      <div class="item-actions">
        <button class="icon-btn" onclick="openMerchForm('${item.id}')">${svgEdit()}</button>
        <button class="icon-btn danger" onclick="deleteMerch('${item.id}')">${svgTrash()}</button>
      </div>
    </div>`;
  });
  html += `</div><div id="merch-form-area"></div>`;
  document.getElementById('editor-body').innerHTML = html;

  makeDraggable(document.getElementById('merch-list'), async (from, to) => {
    const ids = [...document.querySelectorAll('#merch-list .item-row')].map(r => r.dataset.id);
    const moved = ids.splice(from, 1)[0];
    ids.splice(to, 0, moved);
    await window.DB.authedReorder('merch', ids);
    await renderMerchEditor();
    toast('Order saved');
  });
}

async function saveMerchMode() {
  const mode = document.getElementById('merch-mode-select').value;
  const dateEl = document.getElementById('merch-release-date');
  const dateField = document.getElementById('release-date-field');
  if (dateField) dateField.style.display = mode === 'release_date' ? 'block' : 'none';
  await window.DB.authedUpsertSetting('merch_settings', { mode, releaseDate: dateEl ? dateEl.value : '' });
  renderPreview();
}

function openMerchForm(id) {
  editingMerchId = id;
  merchImgFile = null;
  merchImgPreview = '';
  const item = id ? (merchItems.find(m => m.id === id) || {}) : {};
  if (item.image) merchImgPreview = item.image;

  document.getElementById('merch-form-area').innerHTML = `
    <div class="form-section">
      <div class="form-section-title">${id ? 'Edit' : 'New'} item</div>
      <div class="field"><label>Name</label><input type="text" id="mf-name" value="${esc(item.name||'')}" placeholder="e.g. Intent Athletics Tee"></div>
      <div class="field-row">
        <div class="field"><label>Price ($)</label><input type="number" id="mf-price" value="${esc(item.price||'')}" placeholder="35"></div>
        <div class="field"><label>Buy link</label><input type="url" id="mf-link" value="${esc(item.link||'')}" placeholder="https://…"></div>
      </div>
      <div class="field"><label>Description</label><textarea id="mf-desc" placeholder="Short description…">${esc(item.description||'')}</textarea></div>
      <div class="field"><label>Photo</label>
        <div class="img-drop"><input type="file" id="mf-img" accept="image/*"><div class="img-drop-icon">📦</div><div class="img-drop-text">Click to upload</div></div>
        <div class="img-preview-wrap" id="mf-preview"${item.image?' style="display:block;"':''}>
          <img id="mf-thumb" src="${item.image||''}" alt="">
        </div>
      </div>
      <div class="btn-row">
        <button class="save-btn" onclick="saveMerch()">Save item</button>
        <button class="cancel-btn" onclick="renderMerchEditor();renderPreview();">Cancel</button>
      </div>
    </div>`;

  setupImg('mf-img', 'mf-preview', 'mf-thumb', (preview, file) => {
    merchImgPreview = preview;
    merchImgFile = file;
    renderPreview();
  });
  ['mf-name','mf-price','mf-desc'].forEach(id => { const el=document.getElementById(id); if(el) el.addEventListener('input', renderPreview); });
  document.getElementById('merch-form-area').scrollIntoView({ behavior:'smooth' });
}

async function saveMerch() {
  const name = document.getElementById('mf-name').value.trim();
  if (!name) { alert('Please enter a name.'); return; }

  let imageUrl = editingMerchId ? (merchItems.find(m=>m.id===editingMerchId)||{}).image || '' : '';

  if (merchImgFile) {
    toast('Uploading image…');
    const url = await window.DB.uploadImage('images', merchImgFile);
    if (url) imageUrl = url;
  }

  const data = {
    name,
    price: document.getElementById('mf-price').value.trim(),
    description: document.getElementById('mf-desc').value.trim(),
    link: document.getElementById('mf-link').value.trim(),
    image: imageUrl
  };

  if (editingMerchId) {
    await window.DB.authedUpdate('merch', editingMerchId, data);
  } else {
    data.sort_order = merchItems.length;
    await window.DB.authedInsert('merch', data);
  }

  editingMerchId = null; merchImgFile = null; merchImgPreview = '';
  await renderMerchEditor();
  renderPreview();
  toast('Item saved ✓');
}

async function deleteMerch(id) {
  if (!confirm('Delete this item?')) return;
  await window.DB.authedDelete('merch', id);
  await renderMerchEditor();
  renderPreview();
  toast('Deleted');
}

// ════════════════════════════
//  CLIENTS
// ════════════════════════════
let clientItems = [];
let editingClientId = null;
let clientImgFile = null;
let clientImgPreview = '';
let clientFeatured = false;

async function renderClientsEditor() {
  document.getElementById('editor-body').innerHTML = `<div class="empty-msg" style="color:#555;">Loading…</div>`;
  clientItems = await window.DB.get('clients');

  let html = `<div style="font-size:11px;color:#555;margin-bottom:10px;line-height:1.6;">Drag to reorder. ★ = featured client shown large at top of Clients page.</div>`;
  html += `<div class="item-list" id="clients-list">`;
  if (!clientItems.length) html += `<div class="empty-msg">No clients yet. Click + Add to get started.</div>`;
  clientItems.forEach((item, i) => {
    html += `<div class="item-row" data-index="${i}" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-thumb">${item.photo?`<img src="${item.photo}" alt="">`:svgPerson()}</div>
      <div class="item-info">
        <div class="item-name">${item.name}${item.featured?' ★':''}</div>
        <div class="item-meta">${item.program||''}${item.subtitle?' · '+item.subtitle:''}</div>
      </div>
      <div class="item-actions">
        <button class="icon-btn" onclick="openClientForm('${item.id}')">${svgEdit()}</button>
        <button class="icon-btn danger" onclick="deleteClient('${item.id}')">${svgTrash()}</button>
      </div>
    </div>`;
  });
  html += `</div><div id="client-form-area"></div>`;
  document.getElementById('editor-body').innerHTML = html;

  makeDraggable(document.getElementById('clients-list'), async (from, to) => {
    const ids = [...document.querySelectorAll('#clients-list .item-row')].map(r => r.dataset.id);
    const moved = ids.splice(from, 1)[0];
    ids.splice(to, 0, moved);
    await window.DB.authedReorder('clients', ids);
    await renderClientsEditor();
    toast('Order saved');
  });
}

function openClientForm(id) {
  editingClientId = id;
  clientImgFile = null;
  clientImgPreview = '';
  const item = id ? (clientItems.find(c => c.id === id) || {}) : {};
  clientFeatured = item.featured || false;
  if (item.photo) clientImgPreview = item.photo;

  const programs = ['Adult Training','Athlete Training','Youth Training','Semi-Private Training'];
  document.getElementById('client-form-area').innerHTML = `
    <div class="form-section">
      <div class="form-section-title">${id ? 'Edit' : 'New'} client</div>
      <div class="field-row">
        <div class="field"><label>Name</label><input type="text" id="cf-name" value="${esc(item.name||'')}" placeholder="e.g. Mike R."></div>
        <div class="field"><label>Subtitle</label><input type="text" id="cf-sub" value="${esc(item.subtitle||'')}" placeholder="2 years · Adult Training"></div>
      </div>
      <div class="field"><label>Program</label>
        <select id="cf-prog">${programs.map(p=>`<option value="${p}"${(item.program||'')==p?' selected':''}>${p}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Quote</label><textarea id="cf-quote" placeholder="What they said…">${esc(item.quote||'')}</textarea></div>
      <div class="field"><label>Photo</label>
        <div class="img-drop"><input type="file" id="cf-img" accept="image/*"><div class="img-drop-icon">🧑</div><div class="img-drop-text">Click to upload · Portrait works best</div></div>
        <div class="img-preview-wrap" id="cf-preview"${item.photo?' style="display:block;"':''}>
          <img id="cf-thumb" src="${item.photo||''}" alt="">
        </div>
      </div>
      <div class="field">
        <div class="toggle-row">
          <button class="toggle${clientFeatured?' on':''}" id="cf-featured"></button>
          <span class="toggle-label">Feature at top of clients page</span>
        </div>
      </div>
      <div class="btn-row">
        <button class="save-btn" onclick="saveClient()">Save client</button>
        <button class="cancel-btn" onclick="renderClientsEditor();renderPreview();">Cancel</button>
      </div>
    </div>`;

  document.getElementById('cf-featured').addEventListener('click', function() {
    clientFeatured = !clientFeatured;
    this.classList.toggle('on', clientFeatured);
    renderPreview();
  });
  setupImg('cf-img', 'cf-preview', 'cf-thumb', (preview, file) => {
    clientImgPreview = preview;
    clientImgFile = file;
    renderPreview();
  });
  ['cf-name','cf-sub','cf-quote'].forEach(id => { const el=document.getElementById(id); if(el) el.addEventListener('input', renderPreview); });
  document.getElementById('cf-prog').addEventListener('change', renderPreview);
  document.getElementById('client-form-area').scrollIntoView({ behavior:'smooth' });
}

async function saveClient() {
  const name = document.getElementById('cf-name').value.trim();
  if (!name) { alert('Please enter a name.'); return; }

  let photoUrl = editingClientId ? (clientItems.find(c=>c.id===editingClientId)||{}).photo || '' : '';

  if (clientImgFile) {
    toast('Uploading photo…');
    const url = await window.DB.uploadImage('images', clientImgFile);
    if (url) photoUrl = url;
  }

  // Only one featured at a time
  if (clientFeatured) {
    for (const c of clientItems) {
      if (c.featured && c.id !== editingClientId) {
        await window.DB.authedUpdate('clients', c.id, { featured: false });
      }
    }
  }

  const data = {
    name,
    subtitle: document.getElementById('cf-sub').value.trim(),
    program: document.getElementById('cf-prog').value,
    quote: document.getElementById('cf-quote').value.trim(),
    photo: photoUrl,
    featured: clientFeatured
  };

  if (editingClientId) {
    await window.DB.authedUpdate('clients', editingClientId, data);
  } else {
    data.sort_order = clientItems.length;
    await window.DB.authedInsert('clients', data);
  }

  editingClientId = null; clientImgFile = null; clientImgPreview = ''; clientFeatured = false;
  await renderClientsEditor();
  renderPreview();
  toast('Client saved ✓');
}

async function deleteClient(id) {
  if (!confirm('Delete this client?')) return;
  await window.DB.authedDelete('clients', id);
  await renderClientsEditor();
  renderPreview();
  toast('Deleted');
}

// ════════════════════════════
//  TRAINING
// ════════════════════════════
let trainingItems = [];
let editingTrainingId = null;
let trainingImgFile = null;
let trainingImgPreview = '';

function slugify(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }

async function renderTrainingEditor() {
  document.getElementById('editor-body').innerHTML = `<div class="empty-msg" style="color:#555;">Loading…</div>`;
  trainingItems = await window.DB.getTraining();

  let html = `<div style="font-size:11px;color:#555;margin-bottom:10px;line-height:1.6;">Drag to reorder. Hidden programs don't appear on the site or in the nav dropdown.</div>`;
  html += `<div class="item-list" id="training-list">`;
  if (!trainingItems.length) html += `<div class="empty-msg">No programs yet. Click + Add to get started.</div>`;
  trainingItems.forEach((item, i) => {
    html += `<div class="item-row" data-index="${i}" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-thumb">${item.image?`<img src="${item.image}" alt="">`:svgBox()}</div>
      <div class="item-info">
        <div class="item-name">${item.title} ${item.active?'':'<span style="font-size:10px;color:#555;">(hidden)</span>'}</div>
        <div class="item-meta">${(item.description||'').substring(0,50)}…</div>
      </div>
      <div class="item-actions">
        <button class="icon-btn" onclick="toggleTrainingActive('${item.id}',${item.active})" title="${item.active?'Hide':'Show'}">
          ${item.active
            ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
            : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'}
        </button>
        <button class="icon-btn" onclick="openTrainingForm('${item.id}')">${svgEdit()}</button>
        <button class="icon-btn danger" onclick="deleteTraining('${item.id}')">${svgTrash()}</button>
      </div>
    </div>`;
  });
  html += `</div><div id="training-form-area"></div>`;
  document.getElementById('editor-body').innerHTML = html;

  makeDraggable(document.getElementById('training-list'), async (from, to) => {
    const ids = [...document.querySelectorAll('#training-list .item-row')].map(r => r.dataset.id);
    const moved = ids.splice(from, 1)[0];
    ids.splice(to, 0, moved);
    await window.DB.authedReorder('training', ids);
    await renderTrainingEditor();
    renderPreview();
    toast('Order saved — nav dropdown updated');
  });
}

async function toggleTrainingActive(id, current) {
  await window.DB.authedUpdate('training', id, { active: !current });
  await renderTrainingEditor();
  renderPreview();
  toast(current ? 'Program hidden from site' : 'Program visible on site');
}

function openTrainingForm(id) {
  editingTrainingId = id;
  trainingImgFile = null;
  trainingImgPreview = '';
  const item = id ? (trainingItems.find(t => t.id === id) || {}) : {};
  if (item.image) trainingImgPreview = item.image;

  // Parse details
  let details = [];
  try {
    details = Array.isArray(item.details)
      ? item.details
      : JSON.parse(item.details || '[]');
  } catch { details = []; }

  const detailRows = details.map((d, i) => `
    <div class="detail-edit-row" id="detail-${i}" style="display:flex;gap:8px;margin-bottom:8px;align-items:center;">
      <input type="text" value="${esc(d.label)}" placeholder="Label" style="width:30%;background:#111;border:1px solid #333;border-radius:6px;padding:7px 10px;color:#fff;font-family:var(--font-body);font-size:12px;outline:none;">
      <input type="text" value="${esc(d.value)}" placeholder="Value" style="flex:1;background:#111;border:1px solid #333;border-radius:6px;padding:7px 10px;color:#fff;font-family:var(--font-body);font-size:12px;outline:none;">
      <button onclick="this.parentElement.remove();renderPreview();" style="background:#3a1010;border:none;color:#f87171;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:14px;flex-shrink:0;">×</button>
    </div>`).join('');

  document.getElementById('training-form-area').innerHTML = `
    <div class="form-section">
      <div class="form-section-title">${id ? 'Edit' : 'New'} program</div>
      <div class="field">
        <label>Program title</label>
        <input type="text" id="tf-title" value="${esc(item.title||'')}" placeholder="e.g. Adult Training" oninput="renderPreview()">
      </div>
      <div class="field">
        <label>Short description (shown on homepage cards)</label>
        <textarea id="tf-desc" style="min-height:60px;" placeholder="One line summary…" oninput="renderPreview()">${esc(item.description||'')}</textarea>
      </div>
      <div class="field">
        <label>Body paragraph 1</label>
        <textarea id="tf-body1" placeholder="Main description…" oninput="renderPreview()">${esc(item.body1||'')}</textarea>
      </div>
      <div class="field">
        <label>Body paragraph 2</label>
        <textarea id="tf-body2" placeholder="Additional detail…" oninput="renderPreview()">${esc(item.body2||'')}</textarea>
      </div>
      <div class="field">
        <label>Photo</label>
        <div class="img-drop"><input type="file" id="tf-img" accept="image/*"><div class="img-drop-icon">📸</div><div class="img-drop-text">Click to upload training photo</div></div>
        <div class="img-preview-wrap" id="tf-preview"${item.image?' style="display:block;"':''}>
          <img id="tf-thumb" src="${item.image||''}" alt="">
        </div>
      </div>
      <div class="field">
        <label>Detail rows (label + value pairs shown in the info card)</label>
        <div id="detail-rows-container">${detailRows}</div>
        <button onclick="addDetailRow()" class="add-btn" style="margin-top:8px;">+ Add row</button>
      </div>
      <div class="btn-row" style="margin-top:0.5rem;">
        <button class="save-btn" onclick="saveTraining()">Save program</button>
        <button class="cancel-btn" onclick="renderTrainingEditor();renderPreview();">Cancel</button>
      </div>
    </div>`;

  setupImg('tf-img', 'tf-preview', 'tf-thumb', (preview, file) => {
    trainingImgPreview = preview;
    trainingImgFile = file;
    renderPreview();
  });
  ['tf-title','tf-desc','tf-body1','tf-body2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', renderPreview);
  });
  document.getElementById('training-form-area').scrollIntoView({ behavior:'smooth' });
}

function addDetailRow() {
  const container = document.getElementById('detail-rows-container');
  const i = container.children.length;
  const div = document.createElement('div');
  div.className = 'detail-edit-row';
  div.id = `detail-${i}`;
  div.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;align-items:center;';
  div.innerHTML = `
    <input type="text" value="" placeholder="Label" style="width:30%;background:#111;border:1px solid #333;border-radius:6px;padding:7px 10px;color:#fff;font-family:var(--font-body);font-size:12px;outline:none;">
    <input type="text" value="" placeholder="Value" style="flex:1;background:#111;border:1px solid #333;border-radius:6px;padding:7px 10px;color:#fff;font-family:var(--font-body);font-size:12px;outline:none;">
    <button onclick="this.parentElement.remove();renderPreview();" style="background:#3a1010;border:none;color:#f87171;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:14px;flex-shrink:0;">×</button>`;
  container.appendChild(div);
  renderPreview();
}

function getDetailRows() {
  const rows = document.querySelectorAll('.detail-edit-row');
  const details = [];
  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const label = inputs[0]?.value.trim();
    const value = inputs[1]?.value.trim();
    if (label || value) details.push({ label: label||'', value: value||'' });
  });
  return details;
}

async function saveTraining() {
  const title = document.getElementById('tf-title').value.trim();
  if (!title) { alert('Please enter a program title.'); return; }

  let imageUrl = editingTrainingId
    ? (trainingItems.find(t=>t.id===editingTrainingId)||{}).image || ''
    : '';

  if (trainingImgFile) {
    toast('Uploading photo…');
    const url = await window.DB.uploadImage('images', trainingImgFile);
    if (url) imageUrl = url;
  }

  const data = {
    title,
    description: document.getElementById('tf-desc').value.trim(),
    body1: document.getElementById('tf-body1').value.trim(),
    body2: document.getElementById('tf-body2').value.trim(),
    image: imageUrl,
    details: getDetailRows(),
    active: true
  };

  if (editingTrainingId) {
    await window.DB.authedUpdate('training', editingTrainingId, data);
  } else {
    data.sort_order = trainingItems.length;
    await window.DB.authedInsert('training', data);
  }

  editingTrainingId = null; trainingImgFile = null; trainingImgPreview = '';
  await renderTrainingEditor();
  renderPreview();
  toast('Program saved ✓ — nav dropdown updated live');
}

async function deleteTraining(id) {
  if (!confirm('Delete this program? This cannot be undone.')) return;
  await window.DB.authedDelete('training', id);
  await renderTrainingEditor();
  renderPreview();
  toast('Program deleted — removed from nav and training page');
}

function renderTrainingPreview() {
  // Build live preview from current state
  let items = trainingItems.filter(t => t.active);
  const formTitle = document.getElementById('tf-title');
  if (formTitle) {
    const liveItem = {
      id: editingTrainingId || 'new',
      title: formTitle.value || 'New Program',
      description: (document.getElementById('tf-desc')||{}).value || '',
      body1: (document.getElementById('tf-body1')||{}).value || '',
      body2: (document.getElementById('tf-body2')||{}).value || '',
      image: trainingImgPreview,
      details: getDetailRows(),
      active: true
    };
    if (editingTrainingId) items = items.map(t => t.id===editingTrainingId ? liveItem : t);
    else items = [...items, liveItem];
  }

  const pb = document.getElementById('preview-body');

  if (!items.length) {
    pb.innerHTML = `<div style="padding:3rem;text-align:center;color:var(--ink-4);font-size:14px;">No active programs — add one using + Add above.</div>`;
    return;
  }

  // Nav dropdown preview
  const dropdownHtml = items.map(p =>
    `<div style="padding:9px 14px;font-size:12px;color:var(--ink-3);border-bottom:1px solid var(--border);">${p.title}</div>`
  ).join('');

  // Program sections preview
  const sectionsHtml = items.map((p, i) => {
    const details = Array.isArray(p.details) ? p.details : [];
    const photoSide = i % 2 === 0 ? 'right' : 'left';
    const textOrder = photoSide === 'right' ? 1 : 2;
    const photoOrder = photoSide === 'right' ? 2 : 1;

    return `<div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--border);min-height:280px;">
      <div style="order:${textOrder};padding:2.5rem;display:flex;flex-direction:column;justify-content:center;border-right:${photoSide==='right'?'1px solid var(--border)':'none'};border-left:${photoSide==='left'?'1px solid var(--border)':'none'};">
        <div style="font-family:var(--font-display);font-size:52px;color:var(--border-mid);line-height:1;margin-bottom:0.2rem;">0${i+1}</div>
        <div style="font-family:var(--font-display);font-size:28px;font-weight:400;color:var(--ink);margin-bottom:1rem;font-style:italic;">${p.title}</div>
        ${p.body1?`<p style="font-size:13px;color:var(--ink-3);line-height:1.85;margin-bottom:0.8rem;font-weight:300;">${p.body1}</p>`:''}
        ${details.length?`<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-top:0.8rem;">
          ${details.map(d=>`<div style="display:flex;gap:1rem;padding:0.7rem 1rem;border-bottom:1px solid var(--border);font-size:12px;">
            <span style="font-size:8px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--ink-4);min-width:80px;flex-shrink:0;padding-top:2px;">${d.label}</span>
            <span style="color:var(--ink-3);font-weight:300;">${d.value}</span>
          </div>`).join('')}
        </div>`:''}
      </div>
      <div style="order:${photoOrder};background:var(--surface);overflow:hidden;">
        ${p.image?`<img src="${p.image}" style="width:100%;height:100%;object-fit:cover;object-position:top;" alt="">`
          :`<div style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--border-mid);font-size:12px;">Photo goes here</div>`}
      </div>
    </div>`;
  }).join('');

  pb.innerHTML = `
    <div style="background:#111110;padding:1rem 1.5rem;border-bottom:1px solid #222;">
      <div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#555;margin-bottom:0.5rem;">Nav dropdown preview</div>
      <div style="background:#fff;border:1px solid var(--border);border-radius:8px;overflow:hidden;max-width:200px;">
        ${dropdownHtml}
      </div>
    </div>
    <div>
      <div style="padding:2.5rem 2.5rem 1rem;background:var(--off);border-bottom:1px solid var(--border);">
        <div style="font-family:var(--font-display);font-size:36px;font-weight:400;color:var(--ink);line-height:1.05;">Programs built<br><em style="font-style:italic;color:var(--ink-3);">around you.</em></div>
      </div>
      ${sectionsHtml}
    </div>`;
}

// ════════════════════════════
//  BIO
// ════════════════════════════
let bioData = {};

async function renderBioEditor() {
  document.getElementById('editor-body').innerHTML = `<div class="empty-msg" style="color:#555;">Loading…</div>`;
  const row = await window.DB.getSingle('settings', 'bio');
  bioData = row ? (row.value || {}) : {};

  const defaults = {
    intro1: "John has been training clients on Long Island for over 15 years — from 7-year-old youth athletes to adults in their 80s. Every program is built from scratch for the person in front of him.",
    intro2: "All of his clients are unique and have different goals, so training programs and nutritional counseling are catered to each person's individual needs.",
    experience: "15+ years training clients on Long Island",
    clientRange: "Ages 7–85 · Beginner to professional athlete",
    specialties: "Strength training · Youth athletics · Athletic performance · Older adults · Nutritional counseling",
    location: "Long Island, NY",
    storyP1: "John started his career with a different plan. After college and moving toward a teaching job — the expected, safe route — he had a moment of clarity. He walked away from it and went all-in on fitness.",
    storyP2: "The name Intent Athletics comes from that shift. Training with intent means knowing what you're doing, why you're doing it, and having a plan that makes sense for you specifically.",
    pullquote: "My goal is to help people understand how to train and take better care of their bodies — and to cut through an industry full of things that don't make sense.",
    storyP3: "You do not have to be, or have ever been, an athlete to take care of your body and train like one. All you need is a good plan, a positive attitude, and the willingness to work hard.",
    storyP4: "If you're a person with a goal of making yourself move, look, and feel better — you're most likely the right fit."
  };
  Object.keys(defaults).forEach(k => { if (!bioData[k]) bioData[k] = defaults[k]; });

  document.getElementById('editor-body').innerHTML = `
    <p style="font-size:11px;color:#555;line-height:1.6;margin-bottom:1rem;">Changes save to the database and go live for all visitors instantly when you hit Save.</p>
    <div class="form-section">
      <div class="form-section-title">Intro paragraphs</div>
      <div class="field"><label>First paragraph</label><textarea id="bio-intro1" oninput="renderBioPreview()">${esc(bioData.intro1)}</textarea></div>
      <div class="field"><label>Second paragraph</label><textarea id="bio-intro2" oninput="renderBioPreview()">${esc(bioData.intro2)}</textarea></div>
    </div>
    <div class="form-section" style="margin-top:1rem;">
      <div class="form-section-title">Quick facts card</div>
      <div class="field"><label>Experience</label><input type="text" id="bio-experience" value="${esc(bioData.experience)}" oninput="renderBioPreview()"></div>
      <div class="field"><label>Client range</label><input type="text" id="bio-clientRange" value="${esc(bioData.clientRange)}" oninput="renderBioPreview()"></div>
      <div class="field"><label>Specialties</label><input type="text" id="bio-specialties" value="${esc(bioData.specialties)}" oninput="renderBioPreview()"></div>
      <div class="field"><label>Location</label><input type="text" id="bio-location" value="${esc(bioData.location)}" oninput="renderBioPreview()"></div>
    </div>
    <div class="form-section" style="margin-top:1rem;">
      <div class="form-section-title">Story section</div>
      <div class="field"><label>Paragraph 1</label><textarea id="bio-storyP1" oninput="renderBioPreview()">${esc(bioData.storyP1)}</textarea></div>
      <div class="field"><label>Paragraph 2</label><textarea id="bio-storyP2" oninput="renderBioPreview()">${esc(bioData.storyP2)}</textarea></div>
      <div class="field"><label>Pull quote</label><textarea id="bio-pullquote" style="min-height:60px;" oninput="renderBioPreview()">${esc(bioData.pullquote)}</textarea></div>
      <div class="field"><label>Paragraph 3</label><textarea id="bio-storyP3" oninput="renderBioPreview()">${esc(bioData.storyP3)}</textarea></div>
      <div class="field"><label>Paragraph 4</label><textarea id="bio-storyP4" oninput="renderBioPreview()">${esc(bioData.storyP4)}</textarea></div>
    </div>
    <div class="btn-row" style="margin-top:1rem;">
      <button class="save-btn" onclick="saveBio()">Save bio</button>
    </div>`;
}

async function saveBio() {
  const fields = ['intro1','intro2','experience','clientRange','specialties','location','storyP1','storyP2','pullquote','storyP3','storyP4'];
  const bio = {};
  fields.forEach(f => { const el=document.getElementById('bio-'+f); if(el) bio[f]=el.value.trim(); });
  await window.DB.authedUpsertSetting('bio', bio);
  bioData = bio;
  toast('Bio saved ✓ — live for all visitors');
}

function renderBioPreview() {
  const fields = ['intro1','intro2','experience','clientRange','specialties','location','storyP1','storyP2','pullquote','storyP3','storyP4'];
  const bio = {};
  fields.forEach(f => { const el=document.getElementById('bio-'+f); bio[f]=el?el.value:(bioData[f]||''); });

  document.getElementById('preview-body').innerHTML = `
    <div style="padding:2.5rem;border-bottom:1px solid var(--border);background:var(--off);">
      <div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--ink-4);margin-bottom:0.6rem;">Owner / Trainer</div>
      <div style="font-family:var(--font-display);font-size:42px;font-weight:400;color:var(--ink);line-height:1;margin-bottom:1.5rem;">John<br><em style="font-style:italic;color:var(--ink-3);">Dunlop</em></div>
      <p style="font-size:14px;color:var(--ink-3);line-height:1.85;margin-bottom:1rem;font-weight:300;">${bio.intro1}</p>
      <p style="font-size:14px;color:var(--ink-3);line-height:1.85;font-weight:300;">${bio.intro2}</p>
      <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-top:1.5rem;">
        ${[['Experience',bio.experience],['Client range',bio.clientRange],['Specialties',bio.specialties],['Location',bio.location]].map(([l,v])=>`
          <div style="padding:0.9rem 1.2rem;border-bottom:1px solid var(--border);display:flex;gap:1rem;">
            <span style="font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--ink-4);min-width:90px;flex-shrink:0;padding-top:2px;">${l}</span>
            <span style="font-size:13px;color:var(--ink-3);font-weight:300;">${v}</span>
          </div>`).join('')}
      </div>
    </div>
    <div style="padding:2.5rem;">
      <div style="font-family:var(--font-display);font-size:28px;font-weight:400;color:var(--ink);line-height:1.1;margin-bottom:1.5rem;">Training with <em style="font-style:italic;color:var(--ink-3);">purpose.</em></div>
      <p style="font-size:14px;color:var(--ink-3);line-height:1.9;margin-bottom:1rem;font-weight:300;">${bio.storyP1}</p>
      <p style="font-size:14px;color:var(--ink-3);line-height:1.9;margin-bottom:1.5rem;font-weight:300;">${bio.storyP2}</p>
      <div style="background:var(--off);border-radius:12px;border-left:3px solid var(--border-mid);padding:1.4rem 1.6rem;margin-bottom:1.5rem;">
        <p style="font-family:var(--font-display);font-size:17px;color:var(--ink);line-height:1.55;font-style:italic;margin:0;">${bio.pullquote}</p>
      </div>
      <p style="font-size:14px;color:var(--ink-3);line-height:1.9;margin-bottom:1rem;font-weight:300;">${bio.storyP3}</p>
      <p style="font-size:14px;color:var(--ink-3);line-height:1.9;font-weight:300;">${bio.storyP4}</p>
    </div>`;
}

// ════════════════════════════
//  LIVE PREVIEW — MERCH
// ════════════════════════════
async function renderMerchPreview() {
  let items = [...merchItems];
  const liveN = document.getElementById('mf-name');
  if (liveN) {
    const liveItem = { name: liveN.value||'New item', price: (document.getElementById('mf-price')||{}).value||'', image: merchImgPreview };
    if (editingMerchId) items = items.map(m => m.id===editingMerchId ? {...m,...liveItem} : m);
    else items = [...items, liveItem];
  }

  const settingRow = await window.DB.getSingle('settings','merch_settings');
  const ms = settingRow ? (settingRow.value||{}) : {};
  const modeEl = document.getElementById('merch-mode-select');
  const mode = modeEl ? modeEl.value : (ms.mode||'coming_soon');
  const pb = document.getElementById('preview-body');

  if (mode === 'coming_soon') {
    pb.innerHTML = `<div class="pv-section" style="text-align:center;padding:4rem 2rem;background:var(--off);">
      <div style="display:inline-flex;align-items:center;gap:8px;background:var(--ink);color:#fff;font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;padding:7px 16px;border-radius:99px;margin-bottom:1.5rem;"><span style="width:6px;height:6px;border-radius:50%;background:#7aba2a;display:inline-block;"></span>Coming Soon</div>
      <div style="font-family:var(--font-display);font-size:52px;color:var(--ink);line-height:1;margin-bottom:1rem;">Intent<br><em style="font-style:italic;color:var(--ink-3);">Athletics</em></div>
      <div style="font-size:14px;color:var(--ink-3);">Merch is on the way.</div>
    </div>`; return;
  }
  if (mode === 'release_date') {
    const dateEl = document.getElementById('merch-release-date');
    const d = dateEl ? dateEl.value : (ms.releaseDate||'');
    const label = d ? new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : 'TBD';
    pb.innerHTML = `<div class="pv-section" style="text-align:center;padding:4rem 2rem;background:#111110;color:#fff;">
      <div style="font-size:9px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:1.2rem;">Dropping Soon</div>
      <div style="font-family:var(--font-display);font-size:52px;color:#fff;line-height:1;margin-bottom:1rem;">Merch<br><em style="font-style:italic;color:rgba(255,255,255,0.35);">is coming.</em></div>
      <div style="font-size:14px;color:rgba(255,255,255,0.4);margin-bottom:2rem;">Launches ${label}</div>
    </div>`; return;
  }
  if (!items.length) { pb.innerHTML=`<div class="pv-section"><div class="pv-empty">Add items using + Add above.</div></div>`; return; }
  pb.innerHTML = `<div class="pv-section"><span class="pv-eyebrow">Merch</span><div class="pv-h2">Intent <em>Athletics</em></div>
    <div class="pv-merch-grid">${items.map(item=>`<div class="pv-merch-card">
      <div class="pv-merch-img">${item.image?`<img src="${item.image}" alt="">`:svgBox()}</div>
      <div class="pv-merch-body"><div class="pv-merch-name">${item.name}</div><div class="pv-merch-price">${item.price?'$'+item.price:''}</div></div>
    </div>`).join('')}</div></div>`;
}

// ════════════════════════════
//  LIVE PREVIEW — CLIENTS
// ════════════════════════════
function renderClientsPreview() {
  let items = [...clientItems];
  const liveN = document.getElementById('cf-name');
  if (liveN) {
    const liveItem = { name: liveN.value||'Client Name', subtitle:(document.getElementById('cf-sub')||{}).value||'', quote:(document.getElementById('cf-quote')||{}).value||'', program:(document.getElementById('cf-prog')||{}).value||'Adult Training', photo:clientImgPreview, featured:clientFeatured };
    if (editingClientId) items = items.map(c => c.id===editingClientId ? {...c,...liveItem} : c);
    else items = [...items, liveItem];
  }

  const pb = document.getElementById('preview-body');
  if (!items.length) { pb.innerHTML=`<div class="pv-section"><div class="pv-empty">Add a client to see the preview.</div></div>`; return; }

  const featured = items.find(t=>t.featured) || items[0];
  const rest = items.filter(t=>t!==featured);

  let html = `<div class="pv-featured">
    <div class="pv-featured-photo">${featured.photo?`<img src="${featured.photo}" alt="">`:'<div style="height:280px;background:var(--surface);"></div>'}</div>
    <div class="pv-featured-content">
      <span class="pv-badge">${featured.program||'Training'}</span>
      <div class="pv-client-name">${featured.name}</div>
      <div class="pv-client-sub">${featured.subtitle||''}</div>
      ${featured.quote?`<div class="pv-quote">"${featured.quote}"</div>`:''}
    </div>
  </div>`;
  if (rest.length) {
    html += `<div class="pv-clients-grid">${rest.map(t=>`<div class="pv-client-card">
      <div class="pv-client-photo">${t.photo?`<img src="${t.photo}" alt="">`:'<div style="height:160px;background:var(--surface);"></div>'}</div>
      <div class="pv-client-body">
        <span class="pv-client-badge">${t.program||''}</span>
        <div class="pv-client-name2">${t.name}</div>
        ${t.subtitle?`<div class="pv-client-meta">${t.subtitle}</div>`:''}
        ${t.quote?`<div class="pv-client-quote">"${t.quote}"</div>`:''}
      </div>
    </div>`).join('')}</div>`;
  }
  pb.innerHTML = html;
}

// ════════════════════════════
//  SETTINGS
// ════════════════════════════
async function renderSettingsEditor() {
  const user = JSON.parse(sessionStorage.getItem('ia_user')||'{}');
  document.getElementById('editor-body').innerHTML = `
    <div class="form-section">
      <div class="form-section-title">Logged in as</div>
      <p style="font-size:13px;color:#888;">${user.email||'—'}</p>
    </div>
    <div class="form-section" style="margin-top:1rem;">
      <div class="form-section-title">Contact submissions</div>
      <p style="font-size:12px;color:#555;margin-bottom:1rem;line-height:1.6;">View all contact form submissions from visitors. Go to your Supabase dashboard → Table Editor → contacts to see them all.</p>
      <a href="https://supabase.com/dashboard" target="_blank" class="save-btn" style="display:inline-block;text-decoration:none;text-align:center;">Open Supabase dashboard</a>
    </div>
    <div class="form-section" style="margin-top:1rem;">
      <div class="form-section-title">Change password</div>
      <p style="font-size:12px;color:#555;margin-bottom:1rem;line-height:1.6;">To change John's admin password, go to Supabase → Authentication → Users → click John's email → Send password reset email.</p>
    </div>`;
}

// ── UTILS ──
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function svgEdit() { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>'; }
function svgTrash() { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'; }
function svgBox() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>'; }
function svgPerson() { return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'; }
