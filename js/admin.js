// ── AUTH ──
const DEFAULT_PASS = 'IntentAdmin2026';
const getPass = () => localStorage.getItem('ia_admin_pass') || DEFAULT_PASS;

document.getElementById('login-btn').addEventListener('click', tryLogin);
document.getElementById('admin-pass').addEventListener('keydown', e => { if(e.key==='Enter') tryLogin(); });

function tryLogin() {
  if (document.getElementById('admin-pass').value === getPass()) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-wrap').style.display = 'flex';
    setSection('merch');
  } else {
    document.getElementById('login-error').style.display = 'block';
    document.getElementById('admin-pass').value = '';
  }
}

document.getElementById('logout-btn').addEventListener('click', () => {
  document.getElementById('admin-wrap').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-pass').value = '';
});

// ── TOAST ──
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── SECTION ──
let currentSection = 'merch';

document.querySelectorAll('.sidebar-btn[data-section]').forEach(btn => {
  btn.addEventListener('click', () => setSection(btn.dataset.section));
});

function setSection(s) {
  currentSection = s;
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.toggle('active', b.dataset.section === s));
  const titles = { merch: 'Merch items', clients: 'Clients', bio: 'Bio & About page', settings: 'Settings' };
  document.getElementById('editor-title').textContent = titles[s] || s;
  const addBtn = document.getElementById('add-btn');
  addBtn.style.display = (s === 'settings' || s === 'bio') ? 'none' : 'flex';
  renderEditor();
  renderPreview();
}

document.getElementById('add-btn').addEventListener('click', () => {
  if (currentSection === 'merch') openMerchForm(null);
  if (currentSection === 'clients') openClientForm(null);
});

// ── DRAG TO REORDER ──
let dragSrc = null;

function makeDraggable(list) {
  if (!list) return;
  list.querySelectorAll('.item-row').forEach((row, i) => {
    row.draggable = true;
    row.dataset.index = i;
    row.addEventListener('dragstart', e => { dragSrc = row; row.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    row.addEventListener('dragend', () => { row.classList.remove('dragging'); list.querySelectorAll('.item-row').forEach(r => r.classList.remove('drag-over')); });
    row.addEventListener('dragover', e => { e.preventDefault(); if(dragSrc!==row) row.classList.add('drag-over'); });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', e => {
      e.preventDefault();
      if (dragSrc === row) return;
      row.classList.remove('drag-over');
      const items = currentSection === 'merch' ? window.IA_STORE.getMerch() : window.IA_STORE.getTestimonials();
      const from = parseInt(dragSrc.dataset.index);
      const to = parseInt(row.dataset.index);
      const moved = items.splice(from, 1)[0];
      items.splice(to, 0, moved);
      if (currentSection === 'merch') window.IA_STORE.saveMerch(items);
      else window.IA_STORE.saveTestimonials(items);
      renderEditor();
      renderPreview();
      toast('Order updated');
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
      if (onLoad) onLoad(e.target.result);
    };
    reader.readAsDataURL(file);
  });
}

// ── RENDER ROUTER ──
function renderEditor() {
  if (currentSection === 'merch') renderMerchEditor();
  else if (currentSection === 'clients') renderClientsEditor();
  else if (currentSection === 'bio') renderBioEditor();
  else if (currentSection === 'settings') renderSettingsEditor();
}

function renderPreview() {
  if (currentSection === 'merch') renderMerchPreview();
  else if (currentSection === 'clients') renderClientsPreview();
  else if (currentSection === 'bio') renderBioPreview();
  else document.getElementById('preview-body').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#aaa;font-size:14px;">No preview for settings.</div>';
}

// ════════════════════════════
//  MERCH
// ════════════════════════════
let editingMerchIdx = null;
let merchImg = '';

function renderMerchEditor() {
  const items    = window.IA_STORE.getMerch();
  const settings = window.IA_STORE.getMerchSettings();
  const mode     = settings.mode || 'coming_soon';

  // Mode selector at top
  let html = `
  <div class="form-section" style="margin-bottom:1rem;">
    <div class="form-section-title">Store display mode</div>
    <div class="field">
      <label>What visitors see on the Merch page</label>
      <select id="merch-mode-select" onchange="saveMerchMode()">
        <option value="coming_soon"  ${mode==='coming_soon'  ?'selected':''}>Coming Soon</option>
        <option value="release_date" ${mode==='release_date' ?'selected':''}>Countdown to release date</option>
        <option value="live"         ${mode==='live'         ?'selected':''}>Live — show merch items</option>
      </select>
    </div>
    <div id="release-date-field" style="${mode==='release_date'?'':'display:none;'}">
      <div class="field" style="margin-top:0.8rem;">
        <label>Release date</label>
        <input type="date" id="merch-release-date" value="${settings.releaseDate||''}" onchange="saveMerchMode()">
      </div>
    </div>
    <div style="margin-top:0.8rem;font-size:11px;color:#555;line-height:1.6;">
      <b style="color:#888;">Coming Soon</b> — shows a "coming soon" splash with email notify.<br>
      <b style="color:#888;">Countdown</b> — shows a live countdown timer to your release date.<br>
      <b style="color:#888;">Live</b> — shows your actual merch items below.
    </div>
  </div>
  <div class="item-list" id="merch-list">`;

  if (!items.length) html += `<div class="empty-msg">No items yet. Click + Add to add your first product.</div>`;
  items.forEach((item, i) => {
    html += `<div class="item-row" data-index="${i}">
      <span class="drag-handle">⠿</span>
      <div class="item-thumb">${item.image ? `<img src="${item.image}" alt="">` : svgBox()}</div>
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-meta">${item.price ? '$'+item.price : 'No price'}</div>
      </div>
      <div class="item-actions">
        <button class="icon-btn" onclick="openMerchForm(${i})">${svgEdit()}</button>
        <button class="icon-btn danger" onclick="deleteMerch(${i})">${svgTrash()}</button>
      </div>
    </div>`;
  });
  html += `</div><div id="merch-form-area"></div>`;
  document.getElementById('editor-body').innerHTML = html;
  makeDraggable(document.getElementById('merch-list'));
}

function saveMerchMode() {
  const mode = document.getElementById('merch-mode-select').value;
  const dateEl = document.getElementById('merch-release-date');
  const dateField = document.getElementById('release-date-field');
  dateField.style.display = mode === 'release_date' ? 'block' : 'none';
  const settings = { mode, releaseDate: dateEl ? dateEl.value : '' };
  window.IA_STORE.saveMerchSettings(settings);
  renderPreview();
}

function openMerchForm(idx) {
  editingMerchIdx = idx;
  merchImg = '';
  const items = window.IA_STORE.getMerch();
  const item = idx !== null ? items[idx] : {};
  if (item.image) merchImg = item.image;

  document.getElementById('merch-form-area').innerHTML = `
    <div class="form-section">
      <div class="form-section-title">${idx !== null ? 'Edit' : 'New'} item</div>
      <div class="field"><label>Name</label><input type="text" id="mf-name" value="${esc(item.name||'')}" placeholder="e.g. Intent Athletics Tee"></div>
      <div class="field-row">
        <div class="field"><label>Price ($)</label><input type="number" id="mf-price" value="${esc(item.price||'')}" placeholder="35"></div>
        <div class="field"><label>Buy link</label><input type="url" id="mf-link" value="${esc(item.link||'')}" placeholder="https://…"></div>
      </div>
      <div class="field"><label>Description</label><textarea id="mf-desc" placeholder="Short description…">${esc(item.desc||'')}</textarea></div>
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

  setupImg('mf-img', 'mf-preview', 'mf-thumb', src => { merchImg = src; renderPreview(); });
  ['mf-name','mf-price','mf-desc'].forEach(id => { const el=document.getElementById(id); if(el) el.addEventListener('input', renderPreview); });
  document.getElementById('merch-form-area').scrollIntoView({ behavior:'smooth' });
}

function saveMerch() {
  const name = document.getElementById('mf-name').value.trim();
  if (!name) { alert('Please enter a name.'); return; }
  const items = window.IA_STORE.getMerch();
  const item = { name, price: document.getElementById('mf-price').value.trim(), desc: document.getElementById('mf-desc').value.trim(), link: document.getElementById('mf-link').value.trim(), image: merchImg };
  if (editingMerchIdx !== null) items[editingMerchIdx] = item;
  else items.push(item);
  window.IA_STORE.saveMerch(items);
  editingMerchIdx = null; merchImg = '';
  renderMerchEditor(); renderPreview();
  toast('Item saved ✓');
}

function deleteMerch(i) {
  if (!confirm('Delete this item?')) return;
  const items = window.IA_STORE.getMerch();
  items.splice(i, 1);
  window.IA_STORE.saveMerch(items);
  renderMerchEditor(); renderPreview();
  toast('Deleted');
}

// ════════════════════════════
//  CLIENTS
// ════════════════════════════
let editingClientIdx = null;
let clientImg = '';
let clientFeatured = false;

function renderClientsEditor() {
  const items = window.IA_STORE.getTestimonials();
  let html = `<div style="font-size:11px;color:#555;margin-bottom:10px;line-height:1.6;">Drag to reorder. Star = featured client shown large at the top of the Clients page.</div>`;
  html += `<div class="item-list" id="clients-list">`;
  if (!items.length) html += `<div class="empty-msg">No clients yet. Click + Add to get started.</div>`;
  items.forEach((item, i) => {
    html += `<div class="item-row" data-index="${i}">
      <span class="drag-handle">⠿</span>
      <div class="item-thumb">${item.photo ? `<img src="${item.photo}" alt="">` : svgPerson()}</div>
      <div class="item-info">
        <div class="item-name">${item.name}${item.featured?' ★':''}</div>
        <div class="item-meta">${item.program||''}${item.subtitle?' · '+item.subtitle:''}</div>
      </div>
      <div class="item-actions">
        <button class="icon-btn" onclick="openClientForm(${i})">${svgEdit()}</button>
        <button class="icon-btn danger" onclick="deleteClient(${i})">${svgTrash()}</button>
      </div>
    </div>`;
  });
  html += `</div><div id="client-form-area"></div>`;
  document.getElementById('editor-body').innerHTML = html;
  makeDraggable(document.getElementById('clients-list'));
}

function openClientForm(idx) {
  editingClientIdx = idx;
  clientImg = '';
  const items = window.IA_STORE.getTestimonials();
  const item = idx !== null ? items[idx] : {};
  clientFeatured = item.featured || false;
  if (item.photo) clientImg = item.photo;

  const programs = ['Adult Training','Athlete Training','Youth Training','Semi-Private Training'];
  document.getElementById('client-form-area').innerHTML = `
    <div class="form-section">
      <div class="form-section-title">${idx !== null ? 'Edit' : 'New'} client</div>
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
  setupImg('cf-img', 'cf-preview', 'cf-thumb', src => { clientImg = src; renderPreview(); });
  ['cf-name','cf-sub','cf-quote'].forEach(id => { const el=document.getElementById(id); if(el) el.addEventListener('input', renderPreview); });
  document.getElementById('cf-prog').addEventListener('change', renderPreview);
  document.getElementById('client-form-area').scrollIntoView({ behavior:'smooth' });
}

function saveClient() {
  const name = document.getElementById('cf-name').value.trim();
  if (!name) { alert('Please enter a name.'); return; }
  const items = window.IA_STORE.getTestimonials();
  if (clientFeatured) items.forEach(t => t.featured = false);
  const item = {
    id: editingClientIdx !== null ? (items[editingClientIdx].id||Date.now()) : Date.now(),
    name,
    subtitle: document.getElementById('cf-sub').value.trim(),
    program: document.getElementById('cf-prog').value,
    quote: document.getElementById('cf-quote').value.trim(),
    photo: clientImg,
    featured: clientFeatured
  };
  if (editingClientIdx !== null) items[editingClientIdx] = item;
  else items.push(item);
  window.IA_STORE.saveTestimonials(items);
  editingClientIdx = null; clientImg = ''; clientFeatured = false;
  renderClientsEditor(); renderPreview();
  toast('Client saved ✓');
}

function deleteClient(i) {
  if (!confirm('Delete this client?')) return;
  const items = window.IA_STORE.getTestimonials();
  items.splice(i, 1);
  window.IA_STORE.saveTestimonials(items);
  renderClientsEditor(); renderPreview();
  toast('Deleted');
}

// ════════════════════════════
//  BIO
// ════════════════════════════
function renderBioEditor() {
  const bio = window.IA_STORE.getBio();
  document.getElementById('editor-body').innerHTML = `
    <p style="font-size:11px;color:#555;line-height:1.6;margin-bottom:1rem;">
      Edit John's bio here. Changes appear on the About page instantly. Use the preview panel to see exactly how it looks before saving.
    </p>

    <div class="form-section">
      <div class="form-section-title">Intro paragraphs</div>
      <div class="field">
        <label>First paragraph</label>
        <textarea id="bio-intro1" oninput="renderBioPreview()">${esc(bio.intro1||'')}</textarea>
      </div>
      <div class="field">
        <label>Second paragraph</label>
        <textarea id="bio-intro2" oninput="renderBioPreview()">${esc(bio.intro2||'')}</textarea>
      </div>
    </div>

    <div class="form-section" style="margin-top:1rem;">
      <div class="form-section-title">Quick facts card</div>
      <div class="field">
        <label>Experience</label>
        <input type="text" id="bio-experience" value="${esc(bio.experience||'')}" oninput="renderBioPreview()">
      </div>
      <div class="field">
        <label>Client range</label>
        <input type="text" id="bio-clientRange" value="${esc(bio.clientRange||'')}" oninput="renderBioPreview()">
      </div>
      <div class="field">
        <label>Specialties</label>
        <input type="text" id="bio-specialties" value="${esc(bio.specialties||'')}" oninput="renderBioPreview()">
      </div>
      <div class="field">
        <label>Location</label>
        <input type="text" id="bio-location" value="${esc(bio.location||'')}" oninput="renderBioPreview()">
      </div>
    </div>

    <div class="form-section" style="margin-top:1rem;">
      <div class="form-section-title">Story section</div>
      <div class="field">
        <label>Story paragraph 1</label>
        <textarea id="bio-storyP1" oninput="renderBioPreview()">${esc(bio.storyP1||'')}</textarea>
      </div>
      <div class="field">
        <label>Story paragraph 2</label>
        <textarea id="bio-storyP2" oninput="renderBioPreview()">${esc(bio.storyP2||'')}</textarea>
      </div>
      <div class="field">
        <label>Pull quote (the highlighted quote in the middle)</label>
        <textarea id="bio-pullquote" style="min-height:60px;" oninput="renderBioPreview()">${esc(bio.pullquote||'')}</textarea>
      </div>
      <div class="field">
        <label>Story paragraph 3</label>
        <textarea id="bio-storyP3" oninput="renderBioPreview()">${esc(bio.storyP3||'')}</textarea>
      </div>
      <div class="field">
        <label>Story paragraph 4</label>
        <textarea id="bio-storyP4" oninput="renderBioPreview()">${esc(bio.storyP4||'')}</textarea>
      </div>
    </div>

    <div class="btn-row" style="margin-top:1rem;">
      <button class="save-btn" onclick="saveBio()">Save bio</button>
      <button class="cancel-btn" onclick="renderBioEditor();renderBioPreview();">Reset</button>
    </div>`;
}

function saveBio() {
  const fields = ['intro1','intro2','experience','clientRange','specialties','location','storyP1','storyP2','pullquote','storyP3','storyP4'];
  const bio = {};
  fields.forEach(f => {
    const el = document.getElementById('bio-' + f);
    if (el) bio[f] = el.value.trim();
  });
  window.IA_STORE.saveBio(bio);
  toast('Bio saved ✓');
}

function renderBioPreview() {
  const fields = ['intro1','intro2','experience','clientRange','specialties','location','storyP1','storyP2','pullquote','storyP3','storyP4'];
  const bio = {};
  fields.forEach(f => {
    const saved = window.IA_STORE.getBio();
    const el = document.getElementById('bio-' + f);
    bio[f] = el ? el.value : (saved[f] || '');
  });

  document.getElementById('preview-body').innerHTML = `
    <div style="padding:2.5rem;border-bottom:1px solid var(--border);background:var(--off);">
      <div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--ink-4);margin-bottom:0.6rem;">Owner / Trainer</div>
      <div style="font-family:var(--font-display);font-size:42px;font-weight:400;color:var(--ink);line-height:1;margin-bottom:1.5rem;">John<br><em style="font-style:italic;color:var(--ink-3);">Dunlop</em></div>
      <p style="font-size:14px;color:var(--ink-3);line-height:1.85;margin-bottom:1rem;font-weight:300;">${bio.intro1}</p>
      <p style="font-size:14px;color:var(--ink-3);line-height:1.85;font-weight:300;">${bio.intro2}</p>
      <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-top:1.5rem;">
        ${[
          ['Experience', bio.experience],
          ['Client range', bio.clientRange],
          ['Specialties', bio.specialties],
          ['Location', bio.location]
        ].map(([l,v]) => `
          <div style="padding:0.9rem 1.2rem;border-bottom:1px solid var(--border);display:flex;gap:1rem;">
            <span style="font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--ink-4);min-width:90px;flex-shrink:0;padding-top:2px;">${l}</span>
            <span style="font-size:13px;color:var(--ink-3);font-weight:300;">${v}</span>
          </div>`).join('')}
      </div>
    </div>
    <div style="padding:2.5rem;border-bottom:1px solid var(--border);">
      <div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--ink-4);margin-bottom:1rem;">The story</div>
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
//  SETTINGS
// ════════════════════════════
function renderSettingsEditor() {
  document.getElementById('editor-body').innerHTML = `
    <div class="form-section">
      <div class="form-section-title">Change password</div>
      <div class="field"><label>New password</label><input type="password" id="new-pass" placeholder="Min 8 characters"></div>
      <div class="field"><label>Confirm password</label><input type="password" id="confirm-pass" placeholder="Repeat password"></div>
      <div class="btn-row"><button class="save-btn" onclick="changePass()">Update password</button></div>
    </div>
    <div class="form-section" style="margin-top:1rem;">
      <div class="form-section-title">Backup data</div>
      <p style="font-size:12px;color:#555;margin-bottom:1rem;line-height:1.6;">Export all your content as a JSON file. Import it on any device to restore everything.</p>
      <div class="btn-row">
        <button class="save-btn" onclick="exportData()">Export backup</button>
        <button class="cancel-btn" onclick="document.getElementById('import-file').click()">Import</button>
        <input type="file" id="import-file" accept=".json" style="display:none" onchange="importData(this)">
      </div>
    </div>`;
}

function changePass() {
  const np = document.getElementById('new-pass').value;
  const cp = document.getElementById('confirm-pass').value;
  if (!np || np.length < 8) { alert('Password must be at least 8 characters.'); return; }
  if (np !== cp) { alert('Passwords do not match.'); return; }
  localStorage.setItem('ia_admin_pass', np);
  document.getElementById('new-pass').value = '';
  document.getElementById('confirm-pass').value = '';
  toast('Password updated ✓');
}

function exportData() {
  const data = { merch: window.IA_STORE.getMerch(), testimonials: window.IA_STORE.getTestimonials(), exported: new Date().toISOString() };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  a.download = 'intent-athletics-data.json';
  a.click();
  toast('Exported ✓');
}

function importData(input) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const d = JSON.parse(e.target.result);
      if (d.merch) window.IA_STORE.saveMerch(d.merch);
      if (d.testimonials) window.IA_STORE.saveTestimonials(d.testimonials);
      renderEditor(); renderPreview();
      toast('Imported ✓');
    } catch { alert('Invalid file.'); }
  };
  reader.readAsText(input.files[0]);
}

// ════════════════════════════
//  LIVE PREVIEW RENDERERS
// ════════════════════════════
function getLiveMerchItem() {
  const n = document.getElementById('mf-name');
  if (!n) return null;
  return { name: n.value||'New item', price: (document.getElementById('mf-price')||{}).value||'', image: merchImg };
}

function getLiveClientItem() {
  const n = document.getElementById('cf-name');
  if (!n) return null;
  return { name: n.value||'Client Name', subtitle: (document.getElementById('cf-sub')||{}).value||'', quote: (document.getElementById('cf-quote')||{}).value||'', program: (document.getElementById('cf-prog')||{}).value||'Adult Training', photo: clientImg, featured: clientFeatured };
}

function renderMerchPreview() {
  let items = [...window.IA_STORE.getMerch()];
  const live = getLiveMerchItem();
  if (live) { if (editingMerchIdx!==null) items[editingMerchIdx]=live; else items=[...items,live]; }

  const settings = window.IA_STORE.getMerchSettings();
  const mode = settings.mode || 'coming_soon';
  const pb = document.getElementById('preview-body');

  if (mode === 'coming_soon') {
    pb.innerHTML = `
      <div class="pv-section" style="text-align:center;padding:4rem 2rem;background:var(--off);">
        <div style="display:inline-flex;align-items:center;gap:8px;background:var(--ink);color:#fff;font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;padding:7px 16px;border-radius:99px;margin-bottom:1.5rem;">
          <span style="width:6px;height:6px;border-radius:50%;background:#7aba2a;display:inline-block;"></span>
          Coming Soon
        </div>
        <div style="font-family:var(--font-display);font-size:52px;color:var(--ink);line-height:1;margin-bottom:1rem;">Intent<br><em style="font-style:italic;color:var(--ink-3);">Athletics</em></div>
        <div style="font-size:14px;color:var(--ink-3);margin-bottom:1.5rem;">Merch is on the way. Drop your email and we'll let you know when it's live.</div>
        <div style="display:flex;gap:8px;justify-content:center;max-width:340px;margin:0 auto;">
          <div style="flex:1;background:#fff;border:1.5px solid var(--border);border-radius:99px;padding:9px 16px;font-size:13px;color:var(--ink-4);">your@email.com</div>
          <div style="background:var(--ink);color:#fff;font-size:12px;font-weight:500;padding:9px 18px;border-radius:99px;white-space:nowrap;">Notify me</div>
        </div>
      </div>`;
    return;
  }

  if (mode === 'release_date') {
    const dateStr = settings.releaseDate || '';
    const dateLabel = dateStr ? new Date(dateStr+'T00:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : 'TBD';
    pb.innerHTML = `
      <div class="pv-section" style="text-align:center;padding:4rem 2rem;background:#111110;color:#fff;">
        <div style="font-size:9px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:1.2rem;">Intent Athletics · Dropping Soon</div>
        <div style="font-family:var(--font-display);font-size:52px;color:#fff;line-height:1;margin-bottom:1rem;">Merch<br><em style="font-style:italic;color:rgba(255,255,255,0.35);">is coming.</em></div>
        <div style="font-size:14px;color:rgba(255,255,255,0.35);margin-bottom:2rem;">The Intent Athletics store launches on ${dateLabel}.</div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:2rem;">
          ${['Days','Hours','Mins','Secs'].map(l=>`
            <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:1.2rem 1.4rem;min-width:80px;">
              <div style="font-family:var(--font-display);font-size:40px;color:#fff;line-height:1;">--</div>
              <div style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.25);margin-top:5px;">${l}</div>
            </div>`).join('')}
        </div>
        <div style="background:#fff;color:#111;font-size:12px;font-weight:600;padding:11px 24px;border-radius:99px;display:inline-block;">Visit current store</div>
      </div>`;
    return;
  }

  // Live mode
  if (!items.length) {
    pb.innerHTML = `<div class="pv-section" style="text-align:center;padding:3rem;"><div class="pv-empty">Add items using the + Add button above to see them here.</div></div>`;
    return;
  }
  pb.innerHTML = `<div class="pv-section">
    <span class="pv-eyebrow">Merch</span>
    <div class="pv-h2">Intent <em>Athletics</em></div>
    <div class="pv-merch-grid">
      ${items.map(item=>`<div class="pv-merch-card">
        <div class="pv-merch-img">${item.image?`<img src="${item.image}" alt="">`:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ddd" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>'}</div>
        <div class="pv-merch-body">
          <div class="pv-merch-name">${item.name}</div>
          <div class="pv-merch-price">${item.price?'$'+item.price:''}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

function renderClientsPreview() {
  let items = [...window.IA_STORE.getTestimonials()];
  const live = getLiveClientItem();
  if (live) { if (editingClientIdx!==null) { items=items.map((t,i)=>i===editingClientIdx?live:t); } else items=[...items,live]; }

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

// ── UTILS ──
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function svgEdit() { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>'; }
function svgTrash() { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'; }
function svgBox() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>'; }
function svgPerson() { return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'; }
