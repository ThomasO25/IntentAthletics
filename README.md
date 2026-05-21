# Intent Athletics — Site Setup Guide

Everything below needs to be done once before the site is fully operational.

---

## 1. Add images to the repo (REQUIRED — site will have missing images without these)

Download these 3 files from your WordPress admin (Media Library) and add them to the `/images/` folder in your repo with these exact filenames:

| File to save as | What it is |
|---|---|
| `images/logo.png` | Intent Athletics white logo (Intent_Athletics_Logo_FINAL_WHITE.png) |
| `images/gym.jpg` | Gym interior photo (intentimage2) |
| `images/john.jpg` | John's headshot/training photo (intentimage3) |

**How to get them from WordPress:**
1. Log into WordPress admin at intentathletics.com/wp-admin
2. Go to Media → Library
3. Click each image → "Download" or right-click the full-size URL and Save As
4. Rename and add to the `/images/` folder in your GitHub repo

---

## 2. Wire up the contact form (REQUIRED — form does nothing without this)

1. Go to **formspree.io** and create a free account using John's email
2. Click "New Form" — name it "Intent Athletics Contact"
3. Copy the form endpoint — it looks like: `https://formspree.io/f/xyzabc12`
4. Open `contact.html` in your repo
5. Find this line:
   ```
   action="https://formspree.io/f/REPLACE_WITH_YOUR_ID"
   ```
6. Replace `REPLACE_WITH_YOUR_ID` with your actual ID (just the last part, e.g. `xyzabc12`)
7. Commit and push

Every contact form submission will now email John directly. Free tier = 50 submissions/month.

---

## 3. Add training photos (when John has them)

Each training section on `training.html` has a photo placeholder. To add a photo:

1. Add the photo to your repo's `/images/` folder
2. Open `training.html` and find the section (look for the comment that says "TO ADD PHOTO")
3. Replace the placeholder `<div class="prog-photo-placeholder">...</div>` with:
   ```html
   <img src="images/adult-training.jpg" alt="John Dunlop training an adult client">
   ```
   Use the correct filename for each section:
   - Adult: `images/adult-training.jpg`
   - Athlete: `images/athlete-training.jpg`
   - Youth: `images/youth-training.jpg`
   - Semi-private: `images/semi-private.jpg`

---

## 4. Add client testimonials

Go to `intentathletics.com/admin.html` and log in with password `IntentAdmin2026`.

Under the **Clients** tab, add at least 1–2 real clients before launch so the Clients page isn't empty. For each client you'll need:
- Their name
- A short subtitle (e.g. "Adult Training · 2 years")
- A quote from them
- A photo (optional but recommended)
- Which program they do
- Whether to feature them at the top

**Change the admin password** under the Settings tab after first login.

---

## 5. Admin panel note — data persistence

The admin panel currently saves data to the browser's localStorage. This means:
- If John uses a different browser or device, the data won't be there
- Clearing browser cache will wipe it

**Workaround until a database is set up:** Use the Export button in admin → Settings to save a backup JSON file. Import it on any new device to restore.

---

## 6. Merch page

The merch page is set to "Coming Soon" by default. When John is ready to launch merch:
1. Go to admin.html → Merch tab
2. Change the mode to "Live" or "Countdown to release date"
3. Add items with photos and prices

---

## 7. Change default admin password

Default password is `IntentAdmin2026`. 

Go to `intentathletics.com/admin.html` → Settings → Change password. Use something strong that only John knows.

---

## Files in this repo

```
/
├── index.html          — Homepage
├── about.html          — About John
├── training.html       — All training programs (single page, anchor links)
├── clients.html        — Client testimonials
├── merch.html          — Merch store
├── contact.html        — Contact form
├── admin.html          — Admin portal (not linked publicly)
├── 404.html            — Custom error page
├── CNAME               — GitHub Pages domain config
├── robots.txt          — Blocks admin page from search engines
├── css/
│   ├── style.css       — Main site styles
│   └── admin.css       — Admin portal styles
├── js/
│   ├── components.js   — Shared nav + footer + dropdown logic
│   ├── store.js        — Data layer (localStorage)
│   └── admin.js        — Admin portal logic
└── images/
    ├── logo.png         — ⚠️ ADD THIS (download from WordPress)
    ├── gym.jpg          — ⚠️ ADD THIS (download from WordPress)
    ├── john.jpg         — ⚠️ ADD THIS (download from WordPress)
    └── og-image.svg     — Social share preview image
```

---

## What's fully working right now

- All pages load and link correctly
- Navigation with dropdown (hover desktop, click mobile)
- Training page with anchor jump links and sticky sub-nav
- Merch page with Coming Soon / Countdown / Live modes
- Admin portal at /admin.html — add clients, merch, change password
- Client page pulls from admin data automatically
- Contact form (needs Formspree ID — see Step 2)
- Client Login button links to trainwith.intentathletics.com
- Instagram links to @intentathletics.li
- 404 page
- robots.txt blocking admin from search engines
- CNAME for intentathletics.com on GitHub Pages
