-- ============================================================
-- Wikiwaitetarot — Step 2 資料庫結構 + RLS
-- 在 Supabase SQL Editor 貼上整段執行即可（可重複執行）。
--
-- 此檔為 repo 版本紀錄用途。實際建立資料庫請在 Supabase 後台
-- SQL Editor 執行。每次調整 schema 時，同步更新此檔。
-- ============================================================

-- ---------- 共用：自動更新 updated_at ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ============================================================
-- 1. profiles（使用者資料 + 偏好）
-- ============================================================
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  display_name     text,
  active_theme     text not null default 'midnight',
  active_card_back text not null default 'classic',
  active_spirit    text default 'fox',
  active_costumes  jsonb not null default '{}'::jsonb,   -- { spiritId: costumeId }
  story_unlocks    jsonb not null default '{}'::jsonb,   -- { "spiritId_idx": ISO時間 }
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 註冊時自動建立 profile
create or replace function public.handle_new_user()
returns trigger language plpgsql
security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. purchases（已購買項目）
-- ============================================================
create table if not exists public.purchases (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  item_id    text not null,            -- th_imperial / hibiscusCard / 造型id / basic ...
  item_type  text,                     -- theme / card_back / costume / subscription
  expires_at timestamptz,              -- 訂閱才有，買斷留 null
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);
create index if not exists idx_purchases_user on public.purchases(user_id);

-- ============================================================
-- 3. daily_records（每日占卜）
-- ============================================================
create table if not exists public.daily_records (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,            -- 當地時區 YYYY-MM-DD
  cards      jsonb not null default '[]'::jsonb,
  deck       jsonb,                    -- 當日洗牌順序（同日不重洗）
  created_at timestamptz not null default now(),
  unique (user_id, date)
);
create index if not exists idx_daily_user_date on public.daily_records(user_id, date desc);

-- ============================================================
-- 4. spread_records（牌陣占卜）
-- ============================================================
create table if not exists public.spread_records (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  spread_id   text,
  spread_name text,
  question    text,
  cards       jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_spread_user on public.spread_records(user_id, created_at desc);

-- ============================================================
-- RLS：每個人只能存取自己的資料
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.purchases      enable row level security;
alter table public.daily_records  enable row level security;
alter table public.spread_records enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists purchases_all_own on public.purchases;
create policy purchases_all_own on public.purchases
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists daily_all_own on public.daily_records;
create policy daily_all_own on public.daily_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists spread_all_own on public.spread_records;
create policy spread_all_own on public.spread_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
