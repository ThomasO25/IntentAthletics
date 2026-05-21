// ─────────────────────────────────────────────
//  Intent Athletics — Supabase Client
// ─────────────────────────────────────────────
const SUPABASE_URL = 'https://xbngqjgequangifsiori.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibmdxamdlcXVhbmdpZnNpb3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzODg3OTksImV4cCI6MjA5NDk2NDc5OX0.OAZsQqzsILHP6iS5DatxiIQbLFW-b69OyL02v1Ww5c8';

const DB = {
  headers: {
    'apikey': SUPABASE_ANON,
    'Authorization': `Bearer ${SUPABASE_ANON}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },

  async get(table) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?order=sort_order.asc,created_at.asc`, { headers: this.headers });
    if (!res.ok) return [];
    return res.json();
  },

  async getSingle(table, key) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?key=eq.${key}&limit=1`, { headers: this.headers });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] || null;
  },

  async upsertSetting(table, key, value) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...this.headers, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({ key, value })
    });
    return res.ok;
  },

  async insert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0];
  },

  async update(table, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    return res.ok;
  },

  async delete(table, id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE',
      headers: this.headers
    });
    return res.ok;
  },

  async reorder(table, ids) {
    // Update sort_order for each item
    await Promise.all(ids.map((id, i) =>
      fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ sort_order: i })
      })
    ));
  },

  // Auth
  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.access_token) {
      sessionStorage.setItem('ia_token', data.access_token);
      sessionStorage.setItem('ia_user', JSON.stringify({ email: data.user?.email }));
    }
    return data;
  },

  async signOut() {
    const token = sessionStorage.getItem('ia_token');
    if (token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${token}` }
      });
    }
    sessionStorage.removeItem('ia_token');
    sessionStorage.removeItem('ia_user');
  },

  getSession() {
    return sessionStorage.getItem('ia_token');
  },

  // Authed headers for write operations
  authedHeaders() {
    const token = sessionStorage.getItem('ia_token');
    return {
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${token || SUPABASE_ANON}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  },

  async authedInsert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.authedHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) { console.error(await res.text()); return null; }
    const rows = await res.json();
    return rows[0];
  },

  async authedUpdate(table, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: this.authedHeaders(),
      body: JSON.stringify(data)
    });
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
    return res.ok;
  },

  async authedReorder(table, ids) {
    await Promise.all(ids.map((id, i) =>
      fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.authedHeaders(),
        body: JSON.stringify({ sort_order: i })
      })
    ));
  },

  // Upload image to Supabase Storage
  async uploadImage(bucket, file) {
    const token = sessionStorage.getItem('ia_token');
    const ext = file.name.split('.').pop();
    const name = `${Date.now()}.${ext}`;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${name}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${token || SUPABASE_ANON}`,
        'Content-Type': file.type
      },
      body: file
    });
    if (!res.ok) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${name}`;
  }
};

window.DB = DB;
