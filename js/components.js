const LOGO_URL   = 'images/logo.png';
const PORTAL_URL = 'https://trainwith.intentathletics.com';
const INSTA_URL  = 'https://www.instagram.com/intentathletics.li/';
const SUPABASE_URL  = 'https://xbngqjgequangifsiori.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibmdxamdlcXVhbmdpZnNpb3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzODg3OTksImV4cCI6MjA5NDk2NDc5OX0.OAZsQqzsILHP6iS5DatxiIQbLFW-b69OyL02v1Ww5c8';

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildNav(trainingPrograms) {
  const dropdownItems = trainingPrograms.length
    ? trainingPrograms.map(p => `<a href="training.html#${slugify(p.title)}">${p.title}</a>`).join('')
    : `<a href="training.html">View all programs</a>`;

  return `
<nav class="nav" id="main-nav">
  <a class="nav-logo" href="index.html">
    <img src="${LOGO_URL}" alt="Intent Athletics"
      onerror="this.parentElement.innerHTML='<span class=nav-logo-text>Intent Athletics</span>'">
  </a>
  <button class="nav-hamburger" aria-label="Open menu" id="nav-hamburger-btn">
    <span></span><span></span><span></span>
  </button>
  <ul class="nav-links" id="nav-links-list">
    <li><a href="index.html">Home</a></li>
    <li><a href="about.html">About</a></li>
    <li class="nav-dropdown" id="nav-training-dropdown">
      <a href="training.html" class="nav-dropdown-toggle">Training</a>
      <div class="nav-dropdown-menu" id="nav-dropdown-menu">
        ${dropdownItems}
      </div>
    </li>
    <li><a href="merch.html">Merch</a></li>
    <li><a href="clients.html">Clients</a></li>
    <li><a href="contact.html">Contact</a></li>
    <li><a href="${PORTAL_URL}" target="_blank" class="nav-cta">Log In</a></li>
  </ul>
</nav>`;
}

function buildFooter(trainingPrograms) {
  const trainingLinks = trainingPrograms.length
    ? trainingPrograms.map(p => `<a href="training.html#${slugify(p.title)}">${p.title}</a>`).join('')
    : `<a href="training.html">Training</a>`;

  return `
<footer class="footer">
  <div class="footer-top">
    <div class="footer-logo">
      <img src="${LOGO_URL}" alt="Intent Athletics"
        onerror="this.outerHTML='<span style=\\'font-family:var(--font-display);font-size:18px;color:#fff;\\'>Intent Athletics</span>'">
      <p class="footer-desc">Personal training on Long Island, NY. Programs built around you — your goals, your body, your schedule.</p>
    </div>
    <div class="footer-cols">
      <div>
        <div class="footer-col-label">Pages</div>
        <div class="footer-col-links">
          <a href="index.html">Home</a>
          <a href="about.html">About</a>
          <a href="training.html">Training</a>
          <a href="clients.html">Clients</a>
          <a href="contact.html">Contact</a>
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
          <a href="merch.html">Merch</a>
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
  const hamburger = document.getElementById('nav-hamburger-btn');
  const navList   = document.getElementById('nav-links-list');
  if (hamburger && navList) {
    hamburger.addEventListener('click', e => {
      e.stopPropagation();
      navList.classList.toggle('open');
    });
  }

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

  document.addEventListener('click', e => {
    if (navList && !navList.contains(e.target) && hamburger && !hamburger.contains(e.target)) {
      navList.classList.remove('open');
    }
    if (dropMenu && dropdown && !dropdown.contains(e.target)) {
      dropMenu.classList.remove('open');
    }
  });

  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(a => {
    if ((a.getAttribute('href') || '').split('#')[0] === page) a.classList.add('active');
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // Fetch training programs for nav dropdown
  let trainingPrograms = [];
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/training?active=eq.true&order=sort_order.asc&select=title`,
      { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` } }
    );
    if (r.ok) trainingPrograms = await r.json();
  } catch { /* use empty array */ }

  // Inject nav and footer
  const navEl    = document.getElementById('nav-placeholder');
  const footerEl = document.getElementById('footer-placeholder');
  if (navEl)    navEl.outerHTML    = buildNav(trainingPrograms);
  if (footerEl) footerEl.outerHTML = buildFooter(trainingPrograms);

  setTimeout(initNavBehavior, 0);
});

const NAV_HTML = `
<nav class="nav" id="main-nav">
  <a class="nav-logo" href="index.html">
    <img src="${LOGO_URL}" alt="Intent Athletics"
      onerror="this.parentElement.innerHTML='<span class=nav-logo-text>Intent Athletics</span>'">
  </a>
  <button class="nav-hamburger" aria-label="Open menu" id="nav-hamburger-btn">
    <span></span><span></span><span></span>
  </button>
  <ul class="nav-links" id="nav-links-list">
    <li><a href="index.html">Home</a></li>
    <li><a href="about.html">About</a></li>
    <li class="nav-dropdown" id="nav-training-dropdown">
      <a href="training.html" class="nav-dropdown-toggle">Training</a>
      <div class="nav-dropdown-menu" id="nav-dropdown-menu">
        <a href="training.html#adult">Adult Training</a>
        <a href="training.html#athlete">Athlete Training</a>
        <a href="training.html#youth">Youth Training</a>
        <a href="training.html#semi-private">Semi-Private Training</a>
      </div>
    </li>
    <li><a href="merch.html">Merch</a></li>
    <li><a href="clients.html">Clients</a></li>
    <li><a href="contact.html">Contact</a></li>
    <li><a href="${PORTAL_URL}" target="_blank" class="nav-cta">Log In</a></li>
  </ul>
</nav>`;

const FOOTER_HTML = `
<footer class="footer">
  <div class="footer-top">
    <div class="footer-logo">
      <img src="${LOGO_URL}" alt="Intent Athletics"
        onerror="this.outerHTML='<span style=\\'font-family:var(--font-display);font-size:18px;color:#fff;\\'>Intent Athletics</span>'">
      <p class="footer-desc">Personal training on Long Island, NY. Programs built around you — your goals, your body, your schedule.</p>
    </div>
    <div class="footer-cols">
      <div>
        <div class="footer-col-label">Pages</div>
        <div class="footer-col-links">
          <a href="index.html">Home</a>
          <a href="about.html">About</a>
          <a href="training.html">Training</a>
          <a href="clients.html">Clients</a>
          <a href="contact.html">Contact</a>
        </div>
      </div>
      <div>
        <div class="footer-col-label">Training</div>
        <div class="footer-col-links">
          <a href="training.html#adult">Adult Training</a>
          <a href="training.html#athlete">Athlete Training</a>
          <a href="training.html#youth">Youth Training</a>
          <a href="training.html#semi-private">Semi-Private</a>
        </div>
      </div>
      <div>
        <div class="footer-col-label">Connect</div>
        <div class="footer-col-links">
          <a href="${INSTA_URL}" target="_blank">Instagram</a>
          <a href="merch.html">Merch</a>
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

document.addEventListener('DOMContentLoaded', () => {
  // Inject nav + footer
  const navEl    = document.getElementById('nav-placeholder');
  const footerEl = document.getElementById('footer-placeholder');
  if (navEl)    navEl.outerHTML    = NAV_HTML;
  if (footerEl) footerEl.outerHTML = FOOTER_HTML;

  setTimeout(() => {
    // ── Hamburger (mobile) ──
    const hamburger = document.getElementById('nav-hamburger-btn');
    const navList   = document.getElementById('nav-links-list');
    if (hamburger && navList) {
      hamburger.addEventListener('click', e => {
        e.stopPropagation();
        navList.classList.toggle('open');
      });
    }

    // ── Training dropdown ──
    const dropdown     = document.getElementById('nav-training-dropdown');
    const dropMenu     = document.getElementById('nav-dropdown-menu');
    const dropToggle   = dropdown ? dropdown.querySelector('.nav-dropdown-toggle') : null;

    if (dropdown && dropMenu && dropToggle) {
      // Desktop hover
      dropdown.addEventListener('mouseenter', () => dropMenu.classList.add('open'));
      dropdown.addEventListener('mouseleave', () => dropMenu.classList.remove('open'));

      // Click toggle (mobile + desktop backup)
      dropToggle.addEventListener('click', e => {
        // On desktop, if menu already open via hover, let the href through
        // On mobile, always intercept and toggle
        if (window.innerWidth <= 768) {
          e.preventDefault();
          dropMenu.classList.toggle('open');
        }
        // On desktop, clicking goes to training.html — hover handles the menu
      });
    }

    // Close everything when clicking outside
    document.addEventListener('click', e => {
      if (navList && !navList.contains(e.target) && hamburger && !hamburger.contains(e.target)) {
        navList.classList.remove('open');
      }
      if (dropMenu && dropdown && !dropdown.contains(e.target)) {
        dropMenu.classList.remove('open');
      }
    });

    // ── Active page highlight ──
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(a => {
      const href = a.getAttribute('href') || '';
      // Match page, ignore hash
      if (href.split('#')[0] === page) a.classList.add('active');
    });
  }, 0);
});
