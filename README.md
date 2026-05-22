# Intent Athletics — Website

**Live site:** intentathletics.com  
**GitHub Pages:** thomaso25.github.io/IntentAthletics  
**Admin panel:** intentathletics.com/admin.html  
**Client portal:** trainwith.intentathletics.com

---

## Tech stack

| Layer | Tool |
|---|---|
| Hosting | GitHub Pages |
| Database | Supabase (Postgres) |
| Images | Supabase Storage |
| Contact email | Formspree |
| DNS | GoDaddy |

---

## Pages

| File | URL |
|---|---|
| `index.html` | Homepage |
| `about.html` | About John |
| `training.html` | All training programs (anchor links) |
| `clients.html` | Client testimonials |
| `merch.html` | Merch store |
| `contact.html` | Contact form |
| `admin.html` | Admin portal (not public) |
| `404.html` | Custom error page |

---

## Admin panel

Go to `intentathletics.com/admin.html` and log in with John's Supabase credentials.

John can manage from the admin:
- **Training** — add, edit, hide, delete, reorder programs. Nav dropdown updates live.
- **Clients** — add testimonials with photos, quotes, program type. Drag to reorder. Toggle featured.
- **Bio** — edit every paragraph on the About page. Live preview before saving.
- **Merch** — switch between Coming Soon, Countdown, or Live mode. Add items with photos and prices.

All changes go live on the website instantly — no code edits needed.

---

## Supabase tables

| Table | What it holds |
|---|---|
| `training` | Training program content — title, description, body, photo, detail rows, sort order, active flag |
| `clients` | Client testimonials — name, subtitle, program, quote, photo, featured flag |
| `merch` | Merch items — name, price, description, link, image |
| `settings` | Key/value store for bio content and merch mode settings |
| `contacts` | Contact form submissions — name, email, phone, interest, message |

To view contact form submissions: Supabase → Table Editor → contacts

---

## Contact form

Submissions are saved to Supabase (`contacts` table) AND emailed to John via Formspree.

To activate Formspree email:
1. Go to formspree.io → create form → copy the ID
2. Open `contact.html` → find `const FORMSPREE_ID = 'YOUR_FORM_ID'`
3. Replace with your actual ID → commit

---

## SEO

- `sitemap.xml` — submit to Google Search Console
- LocalBusiness schema on every page
- Optimized titles and meta descriptions with keywords:
  - "personal trainer in Farmingdale NY"
  - "strength training Long Island"
  - "youth athlete training Farmingdale"
  - "semi-private personal training Long Island"

To activate Google Analytics:
- Go to analytics.google.com → create property → get Measurement ID (G-XXXXXXXXXX)
- Replace `G-XXXXXXXXXX` in every HTML file with your real ID

To activate Google Search Console:
- Go to search.google.com/search-console → Add property → intentathletics.com
- Choose HTML tag verification method → copy the verification code
- Uncomment the `<meta name="google-site-verification">` tag in each HTML file and paste your code
- Submit sitemap: https://intentathletics.com/sitemap.xml

---

## Images

All images are in `/images/`:

| File | Used for |
|---|---|
| `logo.png` | Nav and footer |
| `wordmark.png` | Source for favicon |
| `favicon.ico` | Browser tab icon |
| `apple-touch-icon.png` | Phone home screen icon |
| `gym.jpg` | Homepage hero background |
| `john.jpg` | About page and homepage |
| `og-image.jpg` | Social share preview |

Training section photos go in `/images/` when John provides them.

---

## JS files

| File | Purpose |
|---|---|
| `js/components.js` | Nav + footer injection, dropdown behavior |
| `js/store.js` | Public data fetching from Supabase |
| `js/supabase.js` | Supabase client — auth + CRUD for admin |
| `js/admin.js` | Full admin panel logic |
