// Real logo from intentathletics.com WordPress uploads
const LOGO_URL = 'https://www.intentathletics.com/wp-content/uploads/2026/05/Intent_Athletics_Logo_FINAL_WHITE.png';
const PORTAL_URL = 'https://train.woke-af.com/users/sign_up.html';
const MERCH_URL = 'https://wokeathleletics-fitness.itemorder.com/shop/home/';
const INSTA_URL = 'https://www.instagram.com/intentathletics.li/';

const NAV_HTML = `
<nav class="nav">
  <a class="nav-logo" href="index.html">
    <img src="${LOGO_URL}" alt="Intent Athletics" onerror="this.parentElement.innerHTML='<span style=\\'font-family:var(--font-display);font-size:18px;color:var(--ink);\\'>Intent Athletics</span>'">
  </a>
  <button class="nav-hamburger" aria-label="Open menu">
    <span></span><span></span><span></span>
  </button>
  <ul class="nav-links">
    <li><a href="index.html">Home</a></li>
    <li><a href="about.html">About</a></li>
    <li class="nav-dropdown">
      <a href="training.html">Training</a>
      <div class="nav-dropdown-menu">
        <a href="training/adult-training.html">Adult Training</a>
        <a href="training/athlete-training.html">Athlete Training</a>
        <a href="training/youth-training.html">Youth Training</a>
        <a href="training/semi-private.html">Semi-Private Training</a>
      </div>
    </li>
    <li><a href="${MERCH_URL}" target="_blank">Merch</a></li>
    <li><a href="clients.html">Clients</a></li>
    <li><a href="contact.html">Contact</a></li>
    <li><a href="${PORTAL_URL}" target="_blank" class="nav-cta">Log In</a></li>
  </ul>
</nav>`;

const FOOTER_HTML = `
<footer class="footer">
  <div class="footer-top">
    <div class="footer-logo">
      <img src="${LOGO_URL}" alt="Intent Athletics" onerror="this.outerHTML='<span style=\\'font-family:var(--font-display);font-size:18px;color:#fff;\\'>Intent Athletics</span>'">
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
          <a href="training/adult-training.html">Adult Training</a>
          <a href="training/athlete-training.html">Athlete Training</a>
          <a href="training/youth-training.html">Youth Training</a>
          <a href="training/semi-private.html">Semi-Private</a>
        </div>
      </div>
      <div>
        <div class="footer-col-label">Connect</div>
        <div class="footer-col-links">
          <a href="${INSTA_URL}" target="_blank">Instagram</a>
          <a href="${MERCH_URL}" target="_blank">Merch Store</a>
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
  const navEl = document.getElementById('nav-placeholder');
  const footerEl = document.getElementById('footer-placeholder');
  if (navEl) navEl.outerHTML = NAV_HTML;
  if (footerEl) footerEl.outerHTML = FOOTER_HTML;

  setTimeout(() => {
    const hamburger = document.querySelector('.nav-hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
    }
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(a => {
      if (a.getAttribute('href') === page) a.classList.add('active');
    });
  }, 0);
});
