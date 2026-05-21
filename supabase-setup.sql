-- ═══════════════════════════════════════════════
--  Intent Athletics — Supabase Database Setup
--  Paste this entire file into:
--  Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════

-- ── CLIENTS / TESTIMONIALS ──
create table if not exists public.clients (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  subtitle    text,
  program     text,
  quote       text,
  photo       text,
  featured    boolean default false,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

-- ── MERCH ITEMS ──
create table if not exists public.merch (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  price       text,
  description text,
  link        text,
  image       text,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

-- ── SETTINGS (bio, merch mode, etc.) ──
create table if not exists public.settings (
  key         text primary key,
  value       jsonb,
  updated_at  timestamptz default now()
);

-- ── CONTACT SUBMISSIONS ──
create table if not exists public.contacts (
  id          uuid default gen_random_uuid() primary key,
  first_name  text,
  last_name   text,
  email       text,
  phone       text,
  interest    text,
  message     text,
  created_at  timestamptz default now()
);

-- ── ROW LEVEL SECURITY ──
-- Public can READ clients, merch, settings (so the website can show them)
-- Only authenticated users (John) can WRITE

alter table public.clients  enable row level security;
alter table public.merch    enable row level security;
alter table public.settings enable row level security;
alter table public.contacts enable row level security;

-- Anyone can read clients
create policy "Public read clients" on public.clients
  for select using (true);

-- Only authenticated users can write clients
create policy "Auth write clients" on public.clients
  for all using (auth.role() = 'authenticated');

-- Anyone can read merch
create policy "Public read merch" on public.merch
  for select using (true);

-- Only authenticated users can write merch
create policy "Auth write merch" on public.merch
  for all using (auth.role() = 'authenticated');

-- Anyone can read settings
create policy "Public read settings" on public.settings
  for select using (true);

-- Only authenticated users can write settings
create policy "Auth write settings" on public.settings
  for all using (auth.role() = 'authenticated');

-- Anyone can INSERT a contact (contact form submissions)
create policy "Public insert contacts" on public.contacts
  for insert with check (true);

-- Only authenticated users can read contacts
create policy "Auth read contacts" on public.contacts
  for select using (auth.role() = 'authenticated');

-- ── STORAGE BUCKETS ──
-- Run these separately if the above works fine

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict do nothing;

create policy "Public read images" on storage.objects
  for select using (bucket_id = 'images');

create policy "Auth upload images" on storage.objects
  for insert with check (bucket_id = 'images' and auth.role() = 'authenticated');

create policy "Auth delete images" on storage.objects
  for delete using (bucket_id = 'images' and auth.role() = 'authenticated');

-- ── DEFAULT SETTINGS ──
insert into public.settings (key, value) values
  ('merch_settings', '{"mode": "coming_soon", "releaseDate": ""}'),
  ('bio', '{
    "intro1": "John has been training clients on Long Island for over 15 years — from 7-year-old youth athletes to adults in their 80s. Every program is built from scratch for the person in front of him.",
    "intro2": "All of his clients are unique and have different goals, so training programs and nutritional counseling are catered to each person''s individual needs.",
    "experience": "15+ years training clients on Long Island",
    "clientRange": "Ages 7–85 · Beginner to professional athlete",
    "specialties": "Strength training · Youth athletics · Athletic performance · Older adults · Nutritional counseling",
    "location": "Long Island, NY",
    "storyP1": "John started his career with a different plan. After college and moving toward a teaching job — the expected, safe route — he had a moment of clarity. He walked away from it and went all-in on fitness. Not because it was easy, but because it was right.",
    "storyP2": "The name Intent Athletics comes from that shift. Training with intent means knowing what you''re doing, why you''re doing it, and having a plan that makes sense for you specifically — not something recycled from someone else.",
    "pullquote": "My goal is to help people understand how to train and take better care of their bodies — and to cut through an industry full of things that don''t make sense.",
    "storyP3": "You do not have to be, or have ever been, an athlete to take care of your body and train like one. All you need is a good plan, a positive attitude, and the willingness to work hard.",
    "storyP4": "If you''re a person with a goal of making yourself move, look, and feel better — you''re most likely the right fit."
  }')
on conflict (key) do nothing;

-- ── DONE ──
-- After running this, go to:
-- Authentication → Users → Invite user
-- Enter John's email to create his admin login
