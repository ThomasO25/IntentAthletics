// ─────────────────────────────────────────────
//  Intent Athletics — Shared Data Store
// ─────────────────────────────────────────────
const IA_STORE = {
  load(key) {
    try {
      const saved = localStorage.getItem('ia_' + key);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  },

  save(key, data) {
    try { localStorage.setItem('ia_' + key, JSON.stringify(data)); return true; }
    catch { return false; }
  },

  // Returns array — empty if nothing saved yet
  getMerch()        { return this.load('merch') || []; },
  saveMerch(d)      { return this.save('merch', d); },

  getTestimonials() { return this.load('testimonials') || []; },
  saveTestimonials(d){ return this.save('testimonials', d); },

  // Merch settings: { mode: 'coming_soon' | 'live' | 'release_date', releaseDate: '2025-09-01' }
  getMerchSettings()    { return this.load('merch_settings') || { mode: 'coming_soon', releaseDate: '' }; },
  saveMerchSettings(d)  { return this.save('merch_settings', d); },
};

window.IA_STORE = IA_STORE;
