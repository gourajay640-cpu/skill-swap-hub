-- ============ ENUMS ============
create type public.skill_kind as enum ('knows', 'wants');
create type public.swap_status as enum ('pending', 'accepted', 'rejected', 'cancelled');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  bio text,
  headline text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- ============ SKILLS (catalog) ============
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  color text,
  created_at timestamptz not null default now()
);

alter table public.skills enable row level security;

create policy "Skills are viewable by everyone"
  on public.skills for select using (true);

-- ============ USER SKILLS (junction) ============
create table public.user_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  kind public.skill_kind not null,
  created_at timestamptz not null default now(),
  unique (user_id, skill_id, kind)
);

create index user_skills_skill_kind_idx on public.user_skills (skill_id, kind);
create index user_skills_user_idx on public.user_skills (user_id);

alter table public.user_skills enable row level security;

create policy "User skills are viewable by everyone"
  on public.user_skills for select using (true);

create policy "Users can add their own skills"
  on public.user_skills for insert with check (auth.uid() = user_id);

create policy "Users can update their own skills"
  on public.user_skills for update using (auth.uid() = user_id);

create policy "Users can delete their own skills"
  on public.user_skills for delete using (auth.uid() = user_id);

-- ============ SWAP REQUESTS ============
create table public.swap_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id  uuid not null references public.profiles(id) on delete cascade,
  status public.swap_status not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> receiver_id)
);

create unique index swap_requests_unique_pending
  on public.swap_requests (requester_id, receiver_id)
  where status = 'pending';

create index swap_requests_receiver_idx on public.swap_requests (receiver_id);
create index swap_requests_requester_idx on public.swap_requests (requester_id);

alter table public.swap_requests enable row level security;

create policy "Participants can view their swap requests"
  on public.swap_requests for select
  using (auth.uid() = requester_id or auth.uid() = receiver_id);

create policy "Users can create swap requests as requester"
  on public.swap_requests for insert
  with check (auth.uid() = requester_id);

-- requester can cancel; receiver can accept/reject — both go through update
create policy "Participants can update their swap requests"
  on public.swap_requests for update
  using (auth.uid() = requester_id or auth.uid() = receiver_id);

-- ============ TIMESTAMP TRIGGERS ============
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger swap_requests_set_updated_at
  before update on public.swap_requests
  for each row execute function public.set_updated_at();

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ SEED SKILL CATALOG ============
insert into public.skills (name, slug, color) values
  ('React', 'react', '#38bdf8'),
  ('Next.js', 'nextjs', '#e2e8f0'),
  ('TypeScript', 'typescript', '#3b82f6'),
  ('JavaScript', 'javascript', '#facc15'),
  ('Node.js', 'nodejs', '#84cc16'),
  ('Python', 'python', '#facc15'),
  ('Go', 'go', '#22d3ee'),
  ('Rust', 'rust', '#f97316'),
  ('Java', 'java', '#ef4444'),
  ('Kotlin', 'kotlin', '#a855f7'),
  ('Swift', 'swift', '#f43f5e'),
  ('C++', 'cpp', '#60a5fa'),
  ('Ruby', 'ruby', '#dc2626'),
  ('PHP', 'php', '#818cf8'),
  ('Elixir', 'elixir', '#a855f7'),
  ('GraphQL', 'graphql', '#ec4899'),
  ('PostgreSQL', 'postgresql', '#0ea5e9'),
  ('MongoDB', 'mongodb', '#22c55e'),
  ('Redis', 'redis', '#ef4444'),
  ('Docker', 'docker', '#0ea5e9'),
  ('Kubernetes', 'kubernetes', '#6366f1'),
  ('AWS', 'aws', '#fb923c'),
  ('Terraform', 'terraform', '#a78bfa'),
  ('Vue', 'vue', '#10b981'),
  ('Svelte', 'svelte', '#f97316'),
  ('Solidity', 'solidity', '#94a3b8'),
  ('Machine Learning', 'ml', '#d946ef'),
  ('TensorFlow', 'tensorflow', '#f59e0b'),
  ('Tailwind CSS', 'tailwindcss', '#22d3ee'),
  ('Figma', 'figma', '#f472b6');
