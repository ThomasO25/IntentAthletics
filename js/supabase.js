// ─────────────────────────────────────────────
//  Intent Athletics — Supabase Client
// ─────────────────────────────────────────────
const SUPABASE_URL  = 'https://xbngqjgequangifsiori.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibmdxamdlcXVhbmdpZnNpb3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzODg3OTksImV4cCI6MjA5NDk2NDc5OX0.OAZsQqzsILHP6iS5DatxiIQbLFW-b69OyL02v1Ww5c8';

const DB = {

  // ── READ (public) ──
  async get(table) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?order=sort_order.asc,created_at.asc`,
      { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` } }
    );
    if (!res.ok) return [];
    return res.json();
  },

  async getTraining() {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/training?active=eq.true&order=sort_order.asc,created_at.asc`,
      { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` } }
    );
    if (!res.ok) return [];
    return res.json();
  },

  async getSingle(table, key) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?key=eq.${key}&limit=1`,
      { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] || null;
  },

  // ── AUTH ──
  async signIn(email, password) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      let data;
      try { data = await res.json(); } catch { data = {}; }

      if (!res.ok) {
        return {
          error: {
            message: data.error_description
              || data.msg
              || data.message
              || `Login failed (${res.status}) — check your email and password.`
          }
        };
      }

      if (data.access_token) {
        sessionStorage.setItem('ia_token', data.access_token);
        sessionStorage.setItem('ia_user', JSON.stringify({ email: data.user?.email }));
      }

      return data;

    } catch (e) {
      if (e.name === 'AbortError') {
        return { error: { message: 'Request timed out — check your internet connection.' } };
      }
      return { error: { message: `Connection error: ${e.message}` } };
    }
  },

  async signOut() {
    const token = sessionStorage.getItem('ia_token');
    if (token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    }
    sessionStorage.removeItem('ia_token');
    sessionStorage.removeItem('ia_user');
  },

  getSession() {
    return sessionStorage.getItem('ia_token');
  },

  // ── AUTHED WRITE HEADERS ──
  authedHeaders() {
    const token = sessionStorage.getItem('ia_token');
    return {
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${token || SUPABASE_ANON}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  },

  // ── WRITE (authenticated) ──
  async authedInsert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.authedHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) { console.error('Insert failed:', await res.text()); return null; }
    const rows = await res.json();
    return rows[0];
  },

  async authedUpdate(table, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: this.authedHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) console.error('Update failed:', await res.text());
    return res.ok;
  },

  async authedDelete(table, id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE',
      headers: this.authedHeaders()
    });
    return res.ok;
  },

  async authedUpsertSetting(key, value) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/settings`, {
      method: 'POST',
      headers: { ...this.authedHeaders(), 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({ key, value })
    });
    if (!res.ok) console.error('Upsert failed:', await res.text());
    return res.ok;
  },

  async authedReorder(table, ids) {
    await Promise.all(
      ids.map((id, i) =>
        fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
          method: 'PATCH',
          headers: this.authedHeaders(),
          body: JSON.stringify({ sort_order: i })
        })
      )
    );
  },

  // ── IMAGE UPLOAD ──
  async uploadImage(bucket, file) {
    const token = sessionStorage.getItem('ia_token');
    const ext  = file.name.split('.').pop();
    const name = `${Date.now()}.${ext}`;
    const res  = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${name}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${token || SUPABASE_ANON}`,
        'Content-Type': file.type
      },
      body: file
    });
    if (!res.ok) { console.error('Upload failed:', await res.text()); return null; }
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${name}`;
  }

};

window.DB = DB;
