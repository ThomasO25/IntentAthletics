// ─────────────────────────────────────────────
//  Intent Athletics — Shared Nav + Footer
// ─────────────────────────────────────────────
const LOGO_URL   = 'images/logo.png';
const PORTAL_URL = 'https://trainwith.intentathletics.com';
const INSTA_URL  = 'https://www.instagram.com/intentathletics.li/';
const SB_URL     = 'https://xbngqjgequangifsiori.supabase.co';
const SB_KEY     = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibmdxamdlcXVhbmdpZnNpb3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzODg3OTksImV4cCI6MjA5NDk2NDc5OX0.OAZsQqzsILHP6iS5DatxiIQbLFW-b69OyL02v1Ww5c8';

// Work out correct relative path prefix based on current page location
function pathPrefix() {
  const depth = window.location.pathname.split('/').filter(Boolean).length;
  // GitHub Pages: /IntentAthletics/about.html = depth 2, needs no prefix
  // If ever in a subfolder, we'd need '../'
  return '';
}

function slugify(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Build nav HTML — accepts optional array of training programs for dropdown
function buildNavHTML(programs) {
  const prefix = pathPrefix();
  const dropItems = (programs && programs.length)
    ? programs.map(p =>
        `<a href="${prefix}training.html#${slugify(p.title)}">${p.title}</a>`
      ).join('')
    : `<a href="${prefix}training.html#adult">Adult Training</a>
       <a href="${prefix}training.html#athlete">Athlete Training</a>
       <a href="${prefix}training.html#youth">Youth Training</a>
       <a href="${prefix}training.html#semi-private">Semi-Private Training</a>`;

  return `
<nav class="nav" id="main-nav">
  <a class="nav-logo" href="${prefix}index.html">
    <img src="${prefix}${LOGO_URL}" alt="Intent Athletics"
      onerror="this.parentElement.innerHTML='<span class=nav-logo-text>Intent Athletics</span>'">
  </a>
  <button class="nav-hamburger" aria-label="Open menu" id="nav-hamburger-btn">
    <span></span><span></span><span></span>
  </button>
  <ul class="nav-links" id="nav-links-list">
    <li><a href="${prefix}index.html">Home</a></li>
    <li><a href="${prefix}about.html">About</a></li>
    <li class="nav-dropdown" id="nav-training-dropdown">
      <a href="${prefix}training.html" class="nav-dropdown-toggle">Training</a>
      <div class="nav-dropdown-menu" id="nav-dropdown-menu">
        ${dropItems}
      </div>
    </li>
    <li><a href="${prefix}merch.html">Merch</a></li>
    <li><a href="${prefix}clients.html">Clients</a></li>
    <li><a href="${prefix}contact.html">Contact</a></li>
    <li><a href="${PORTAL_URL}" target="_blank" class="nav-cta">Log In</a></li>
  </ul>
</nav>`;
}

function buildFooterHTML(programs) {
  const prefix = pathPrefix();
  const trainingLinks = (programs && programs.length)
    ? programs.map(p =>
        `<a href="${prefix}training.html#${slugify(p.title)}">${p.title}</a>`
      ).join('')
    : `<a href="${prefix}training.html#adult">Adult Training</a>
       <a href="${prefix}training.html#athlete">Athlete Training</a>
       <a href="${prefix}training.html#youth">Youth Training</a>
       <a href="${prefix}training.html#semi-private">Semi-Private</a>`;

  return `
<footer class="footer">
  <div class="footer-top">
    <div class="footer-logo">
      <img src="${prefix}${LOGO_URL}" alt="Intent Athletics"
        onerror="this.outerHTML='<span style=\\'font-family:var(--font-display);font-size:18px;color:#fff;\\'>Intent Athletics</span>'">
      <p class="footer-desc">Personal training on Long Island, NY. Programs built around you — your goals, your body, your schedule.</p>
    </div>
    <div class="footer-cols">
      <div>
        <div class="footer-col-label">Pages</div>
        <div class="footer-col-links">
          <a href="${prefix}index.html">Home</a>
          <a href="${prefix}about.html">About</a>
          <a href="${prefix}training.html">Training</a>
          <a href="${prefix}clients.html">Clients</a>
          <a href="${prefix}contact.html">Contact</a>
        </div>
      </div>
      <div>
        <div class="footer-col-label">Training</div>
        <div class="footer-col-links">${trainingLinks}</div>
      </div>
      <div>
        <div class="footer-col-label">Connect</div>
        <div class="footer-col-links">
          <a href="${INSTA_URL}" target="_blank">Instagram</a>
          <a href="${prefix}merch.html">Merch</a>
          <a href="${PORTAL_URL}" target="_blank">Client Login</a>
        </div>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 Intent Athletics · Long Island, NY</span>
    <a href="${INSTA_URL}" target="_blank">@intentathletics.li</a>
  </div>
</footer>`;
}

function initNavBehavior() {
  // Hamburger toggle
  const hamburger = document.getElementById('nav-hamburger-btn');
  const navList   = document.getElementById('nav-links-list');
  if (hamburger && navList) {
    hamburger.addEventListener('click', e => {
      e.stopPropagation();
      navList.classList.toggle('open');
    });
  }

  // Training dropdown — hover on desktop, click on mobile
  const dropdown   = document.getElementById('nav-training-dropdown');
  const dropMenu   = document.getElementById('nav-dropdown-menu');
  const dropToggle = dropdown ? dropdown.querySelector('.nav-dropdown-toggle') : null;

  if (dropdown && dropMenu && dropToggle) {
    dropdown.addEventListener('mouseenter', () => dropMenu.classList.add('open'));
    dropdown.addEventListener('mouseleave', () => dropMenu.classList.remove('open'));
    dropToggle.addEventListener('click', e => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        dropMenu.classList.toggle('open');
      }
    });
  }

  // Close on outside click
  document.addEventListener('click', e => {
    if (navList && hamburger &&
        !navList.contains(e.target) &&
        !hamburger.contains(e.target)) {
      navList.classList.remove('open');
    }
    if (dropMenu && dropdown && !dropdown.contains(e.target)) {
      dropMenu.classList.remove('open');
    }
  });

  // Active page highlight
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(a => {
    const href = (a.getAttribute('href') || '').split('#')[0];
    if (href === page) a.classList.add('active');
  });
}

// Update just the dropdown links once we have real training data
function updateDropdownLinks(programs) {
  const menu = document.getElementById('nav-dropdown-menu');
  const footerTraining = document.querySelector('.footer-cols .footer-col-links:nth-child(2)');
  if (!menu || !programs || !programs.length) return;

  const prefix = pathPrefix();

  menu.innerHTML = programs.map(p =>
    `<a href="${prefix}training.html#${slugify(p.title)}">${p.title}</a>`
  ).join('');

  if (footerTraining) {
    footerTraining.innerHTML = programs.map(p =>
      `<a href="${prefix}training.html#${slugify(p.title)}">${p.title}</a>`
    ).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const navEl    = document.getElementById('nav-placeholder');
  const footerEl = document.getElementById('footer-placeholder');

  // ── Step 1: Inject nav + footer immediately with static fallback links ──
  // This happens synchronously — no waiting, no delay, nav is always there
  if (navEl)    navEl.outerHTML    = buildNavHTML(null);
  if (footerEl) footerEl.outerHTML = buildFooterHTML(null);

  // ── Step 2: Wire up nav behavior immediately ──
  initNavBehavior();

  // ── Step 3: Fetch real training programs and silently update dropdown ──
  // Does this in the background — if it fails, static fallback links still work
  fetch(`${SB_URL}/rest/v1/training?active=eq.true&order=sort_order.asc&select=title`, {
    headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` }
  })
  .then(r => r.ok ? r.json() : null)
  .then(programs => { if (programs && programs.length) updateDropdownLinks(programs); })
  .catch(() => { /* silently fail — static links work fine */ });
});
