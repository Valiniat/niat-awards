-- ============================================================
--  NIAT Awards 2026 — Supabase Database Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. NOMINATIONS table
create table if not exists public.nominations (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  type             text not null check (type in ('student', 'teacher')),

  -- Student fields
  student_name     text,
  student_class    text,
  class_group      text,
  school_name      text,
  phone            text not null,
  teacher_name     text,
  award_category   text not null,
  special_thing    text,
  subject          text,
  impact_story     text,
  board            text,
  care_rating      int check (care_rating between 1 and 5),
  clarity_rating   int check (clarity_rating between 1 and 5),
  motivation_rating int check (motivation_rating between 1 and 5),
  support_rating   int check (support_rating between 1 and 5),

  -- Teacher self-nomination fields
  full_name        text,
  experience       text,

  -- Admin
  status           text not null default 'pending'
                   check (status in ('pending', 'shortlisted', 'winner', 'rejected'))
);

-- 2. VOTES table
create table if not exists public.votes (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  nomination_id  uuid not null references public.nominations(id) on delete cascade,
  voter_phone    text not null,
  unique (nomination_id, voter_phone)   -- one vote per phone per nomination
);

-- ============================================================
--  ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.nominations enable row level security;
alter table public.votes enable row level security;

-- Anyone can INSERT a nomination (anonymous users)
create policy "Anyone can submit nominations"
  on public.nominations for insert
  with check (true);

-- Anyone can read shortlisted/winner nominations (for voting page)
create policy "Public can view shortlisted nominations"
  on public.nominations for select
  using (status in ('shortlisted', 'winner'));

-- Anyone can vote
create policy "Anyone can vote"
  on public.votes for insert
  with check (true);

-- Anyone can read votes (for vote counts)
create policy "Anyone can read votes"
  on public.votes for select
  using (true);

-- ============================================================
--  INDEXES
-- ============================================================
create index if not exists idx_nominations_status on public.nominations(status);
create index if not exists idx_nominations_award_category on public.nominations(award_category);
create index if not exists idx_votes_nomination_id on public.votes(nomination_id);

-- ============================================================
--  VOTE COUNT VIEW  (handy for the vote page)
-- ============================================================
create or replace view public.nomination_vote_counts as
  select
    n.id,
    n.teacher_name,
    n.full_name,
    n.award_category,
    n.status,
    count(v.id) as vote_count
  from public.nominations n
  left join public.votes v on v.nomination_id = n.id
  where n.status in ('shortlisted', 'winner')
  group by n.id, n.teacher_name, n.full_name, n.award_category, n.status;

-- ============================================================
--  DONE — your database is ready!
-- ============================================================

-- ============================================================
--  ONE-VOTE-PER-USER MIGRATION
--  Run this to enforce global one-vote-per-phone at the DB level
-- ============================================================
-- DROP the old per-nomination unique constraint first:
-- ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_nomination_id_voter_phone_key;

-- Add a UNIQUE index on voter_phone alone (one vote ever, any teacher):
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_voter_phone_unique ON public.votes(voter_phone);

-- Add DB-level index on voter_phone for fast lookups:
CREATE INDEX IF NOT EXISTS idx_votes_voter_phone ON public.votes(voter_phone);
