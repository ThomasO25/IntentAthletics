// ─────────────────────────────────────────────
//  Intent Athletics — Shared Data Store
//  All site content editable from admin.html
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

  getMerch()           { return this.load('merch') || []; },
  saveMerch(d)         { return this.save('merch', d); },

  getTestimonials()    { return this.load('testimonials') || []; },
  saveTestimonials(d)  { return this.save('testimonials', d); },

  getMerchSettings()   { return this.load('merch_settings') || { mode: 'coming_soon', releaseDate: '' }; },
  saveMerchSettings(d) { return this.save('merch_settings', d); },

  // Bio — everything on the About page John can edit
  getBio() {
    return this.load('bio') || {
      intro1: "John has been training clients on Long Island for over 15 years — from 7-year-old youth athletes to adults in their 80s. Every program is built from scratch for the person in front of him.",
      intro2: "All of his clients are unique and have different goals, so training programs and nutritional counseling are catered to each person's individual needs.",
      experience: "15+ years training clients on Long Island",
      clientRange: "Ages 7–85 · Beginner to professional athlete",
      specialties: "Strength training · Youth athletics · Athletic performance · Older adults · Nutritional counseling",
      location: "Long Island, NY",
      storyP1: "John started his career with a different plan. After college and moving toward a teaching job — the expected, safe route — he had a moment of clarity. He walked away from it and went all-in on fitness. Not because it was easy, but because it was right.",
      storyP2: "The name Intent Athletics comes from that shift. Training with intent means knowing what you're doing, why you're doing it, and having a plan that makes sense for you specifically — not something recycled from someone else.",
      pullquote: "My goal is to help people understand how to train and take better care of their bodies — and to cut through an industry full of things that don't make sense.",
      storyP3: "You do not have to be, or have ever been, an athlete to take care of your body and train like one. All you need is a good plan, a positive attitude, and the willingness to work hard.",
      storyP4: "If you're a person with a goal of making yourself move, look, and feel better — you're most likely the right fit.",
    };
  },
  saveBio(d) { return this.save('bio', d); },
};

window.IA_STORE = IA_STORE;
