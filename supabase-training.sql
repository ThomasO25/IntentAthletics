-- ═══════════════════════════════════════════════
--  Intent Athletics — Training Table
--  Run this in Supabase SQL Editor → New query
-- ═══════════════════════════════════════════════

-- ── TRAINING PROGRAMS ──
create table if not exists public.training (
  id          uuid default gen_random_uuid() primary key,
  title       text not null,
  description text,
  body1       text,
  body2       text,
  image       text,
  details     jsonb default '[]',  -- array of {label, value} pairs
  sort_order  integer default 0,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- RLS
alter table public.training enable row level security;

-- Anyone can read active training programs
create policy "Public read training" on public.training
  for select using (active = true);

-- Only authenticated users can write
create policy "Auth write training" on public.training
  for all using (auth.role() = 'authenticated');

-- ── DEFAULT TRAINING PROGRAMS ──
insert into public.training (title, description, body1, body2, details, sort_order, active) values
(
  'Adult Training',
  'One-on-one sessions built entirely around you — your goals, your schedule, your body.',
  'Adult training with John is one-on-one, in-person, and completely individualized. Before the first session, John will talk through your goals, your movement history, and what you''re working with. That conversation builds the program.',
  'Whether you''re starting from scratch, coming back after time off, or working toward a specific goal, the program is designed for where you actually are — not where you think you should be. Nutritional counseling is included alongside every training program.',
  '[{"label":"Format","value":"One-on-one, in-person sessions on Long Island"},{"label":"Who it''s for","value":"Adults of all fitness levels — beginners, returning clients, and people with specific goals or limitations"},{"label":"Includes","value":"Custom program design · In-session coaching · Progress tracking · Nutritional counseling"},{"label":"Scheduling","value":"Flexible — built around your availability"}]',
  0, true
),
(
  'Athlete Training',
  'Performance programming for athletes who want to compete at a higher level.',
  'Athlete training with John is built around your sport, your position, and where you are in your season. The goal is developing the specific attributes — strength, power, speed, conditioning — that translate directly to your performance.',
  'John has trained athletes at the youth, collegiate, and professional level. The program accounts for what you''re already doing in your sport and builds on it, rather than working against it.',
  '[{"label":"Format","value":"One-on-one, in-person sessions"},{"label":"Who it''s for","value":"Competitive athletes at any level — youth, high school, collegiate, and professional"},{"label":"Includes","value":"Sport-specific programming · Strength and conditioning · Movement assessment · Nutritional guidance"},{"label":"Scheduling","value":"Built around your practice and competition schedule"}]',
  1, true
),
(
  'Youth Training',
  'Foundational training for young athletes — built around their development, not an adult template.',
  'Youth training with John focuses on building real movement foundations — the kind that make kids better athletes in whatever sport they play, and protect them from injury as they grow.',
  'John has worked with young athletes since the beginning of his career. He understands how to make training productive and engaging for kids, and how to build habits that serve them long term. Programs are designed specifically for youth — not scaled-down adult workouts.',
  '[{"label":"Format","value":"One-on-one, in-person sessions"},{"label":"Who it''s for","value":"Young athletes from age 7 and up — any sport, any current fitness level"},{"label":"Includes","value":"Movement fundamentals · Age-appropriate strength training · Coordination and agility · Nutritional basics"},{"label":"Note","value":"Programs are built specifically for youth — not modified adult workouts"}]',
  2, true
),
(
  'Semi-Private Training',
  'Train in a small group of 2–3. Everyone gets their own program — shared session, accessible price.',
  'Semi-private training at Intent Athletics is not a group class. Every person in the session has their own individualized program, designed by John around their specific goals. You train together, but the programs are separate.',
  'This is a good fit for friends or training partners who want to work with John, or for people who want an individualized program at a more accessible price than fully private sessions.',
  '[{"label":"Format","value":"Small group sessions — 2 to 3 people"},{"label":"Who it''s for","value":"Friends, training partners, or anyone who wants individualized programming in a shared setting"},{"label":"Includes","value":"Individual program for each person · In-session coaching · Progress tracking · Nutritional guidance"},{"label":"Important","value":"Each person trains their own program — not a shared group workout"}]',
  3, true
)
on conflict do nothing;

-- Done!
-- Now go to admin.html → Training tab to manage programs
