// ─────────────────────────────────────────────
//  Intent Athletics — Public Data Fetcher
//  Reads from Supabase for all public pages
// ─────────────────────────────────────────────
const SUPABASE_URL  = 'https://xbngqjgequangifsiori.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibmdxamdlcXVhbmdpZnNpb3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzODg3OTksImV4cCI6MjA5NDk2NDc5OX0.OAZsQqzsILHP6iS5DatxiIQbLFW-b69OyL02v1Ww5c8';

const IA_STORE = {
  _h: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` },

  async getTestimonials() {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/clients?order=sort_order.asc,created_at.asc`, { headers: this._h });
      return r.ok ? r.json() : [];
    } catch { return []; }
  },

  async getMerch() {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/merch?order=sort_order.asc,created_at.asc`, { headers: this._h });
      return r.ok ? r.json() : [];
    } catch { return []; }
  },

  async getMerchSettings() {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/settings?key=eq.merch_settings&limit=1`, { headers: this._h });
      if (!r.ok) return { mode: 'coming_soon', releaseDate: '' };
      const rows = await r.json();
      return rows[0]?.value || { mode: 'coming_soon', releaseDate: '' };
    } catch { return { mode: 'coming_soon', releaseDate: '' }; }
  },

  async getBio() {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/settings?key=eq.bio&limit=1`, { headers: this._h });
      if (!r.ok) return null;
      const rows = await r.json();
      return rows[0]?.value || null;
    } catch { return null; }
  },

  async submitContact(data) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/contacts`, {
        method: 'POST',
        headers: { ...this._h, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify(data)
      });
      return r.ok;
    } catch { return false; }
  }
};

window.IA_STORE = IA_STORE;
