create extension if not exists pgcrypto;

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text unique, full_name text, avatar_url text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.trading_accounts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 name text not null, broker text, account_type text not null default 'Personal',
 initial_balance numeric(18,2) not null default 0 check(initial_balance>=0),
 current_balance numeric(18,2) not null default 0, currency text not null default 'USD',
 is_default boolean not null default false, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), unique(user_id,name)
);
create unique index if not exists trading_accounts_one_default_per_user on public.trading_accounts(user_id) where is_default;
create table if not exists public.strategies (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 name text not null, description text, color text not null default '#4F7CFF', is_active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,name)
);
create table if not exists public.trades (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 trading_account_id uuid not null references public.trading_accounts(id) on delete restrict,
 strategy_id uuid references public.strategies(id) on delete set null,
 symbol text not null, direction text not null check(direction in('buy','sell')),
 status text not null default 'open' check(status in('win','loss','breakeven','open')),
 entry_price numeric(22,8) not null check(entry_price>0), exit_price numeric(22,8),
 stop_loss numeric(22,8), take_profit numeric(22,8), lot_size numeric(18,8) not null default 1 check(lot_size>0),
 risk_percent numeric(8,4) check(risk_percent is null or risk_percent between 0 and 100),
 risk_amount numeric(18,2), pnl numeric(18,2) not null default 0, pnl_percent numeric(12,6),
 commission numeric(18,2) not null default 0, swap numeric(18,2) not null default 0,
 rr numeric(12,4), points numeric(18,6), trade_date date not null default current_date,
 entry_time time, exit_time time, timeframe text,
 session text check(session is null or session in('asia','london','new_york','overlap','other')),
 setup text, emotion text check(emotion is null or emotion in('confident','calm','fear','fomo','greed','angry','revenge','unsure')),
 confidence smallint check(confidence is null or confidence between 1 and 10),
 rating smallint check(rating is null or rating between 1 and 5),
 notes text, tags text[] not null default '{}', is_manual_pnl boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.trade_screenshots (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 trade_id uuid not null references public.trades(id) on delete cascade, storage_path text not null,
 screenshot_type text not null check(screenshot_type in('before','after')), created_at timestamptz not null default now(),
 unique(trade_id,screenshot_type)
);
create table if not exists public.ai_conversations (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 title text not null default 'New analysis', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.ai_messages (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
 role text not null check(role in('user','assistant','system')), content text not null, created_at timestamptz not null default now()
);
create table if not exists public.ai_analysis (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 trade_id uuid references public.trades(id) on delete cascade,
 analysis_type text not null check(analysis_type in('chat','weekly_review','monthly_review','trade_review','pattern_detection','risk_coach')),
 input_summary jsonb not null default '{}', content text not null, model text, created_at timestamptz not null default now()
);
create table if not exists public.weekly_reviews (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 period_start date not null, period_end date not null, metrics jsonb not null default '{}', content text not null,
 created_at timestamptz not null default now(), unique(user_id,period_start,period_end)
);
create table if not exists public.monthly_reviews (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 month date not null, metrics jsonb not null default '{}', content text not null,
 created_at timestamptz not null default now(), unique(user_id,month)
);
create table if not exists public.user_settings (
 user_id uuid primary key references auth.users(id) on delete cascade, currency text not null default 'USD',
 timezone text not null default 'Asia/Jakarta', week_starts_on smallint not null default 1 check(week_starts_on in(0,1)),
 notifications jsonb not null default '{"weekly_review":true,"risk_alerts":true,"monthly_summary":true}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index if not exists trades_user_date_idx on public.trades(user_id,trade_date desc);
create index if not exists trades_account_date_idx on public.trades(trading_account_id,trade_date desc);
create index if not exists trades_user_symbol_idx on public.trades(user_id,symbol);
create index if not exists screenshots_trade_idx on public.trade_screenshots(trade_id);
create index if not exists ai_messages_conversation_idx on public.ai_messages(conversation_id,created_at);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=now(); return new; end; $$;
create or replace function public.validate_trade_ownership() returns trigger language plpgsql set search_path='' as $$
begin
 if not exists(select 1 from public.trading_accounts a where a.id=new.trading_account_id and a.user_id=new.user_id) then raise exception 'Invalid trading account ownership'; end if;
 if new.strategy_id is not null and not exists(select 1 from public.strategies s where s.id=new.strategy_id and s.user_id=new.user_id) then raise exception 'Invalid strategy ownership'; end if;
 return new;
end; $$;
create or replace function public.refresh_account_balance() returns trigger language plpgsql security definer set search_path='' as $$
declare target uuid;
begin
 if tg_op='DELETE' then target=old.trading_account_id; else target=new.trading_account_id; end if;
 update public.trading_accounts a set current_balance=a.initial_balance+coalesce((select sum(t.pnl) from public.trades t where t.trading_account_id=target and t.status<>'open'),0),updated_at=now() where a.id=target;
 return null;
end; $$;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,username,full_name) values(new.id,nullif(new.raw_user_meta_data->>'username',''),nullif(new.raw_user_meta_data->>'full_name','')) on conflict do nothing;
 insert into public.user_settings(user_id) values(new.id) on conflict do nothing;
 insert into public.trading_accounts(user_id,name,account_type,initial_balance,current_balance,is_default) values(new.id,'Personal Account','Personal',10000,10000,true) on conflict do nothing;
 insert into public.strategies(user_id,name,description,color) values
 (new.id,'Breakout','Range breakout with confirmation','#4F7CFF'),
 (new.id,'Smart Money','Liquidity and structure setup','#A876FF'),
 (new.id,'Supply & Demand','Fresh zone continuation','#16C784'),
 (new.id,'Support Resistance','Key level rejection','#F6B94A') on conflict do nothing;
 return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
drop trigger if exists validate_trade_owner on public.trades;
create trigger validate_trade_owner before insert or update on public.trades for each row execute function public.validate_trade_ownership();
drop trigger if exists update_account_balance on public.trades;
create trigger update_account_balance after insert or update or delete on public.trades for each row execute function public.refresh_account_balance();

alter table public.profiles enable row level security;
alter table public.trading_accounts enable row level security;
alter table public.strategies enable row level security;
alter table public.trades enable row level security;
alter table public.trade_screenshots enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_analysis enable row level security;
alter table public.weekly_reviews enable row level security;
alter table public.monthly_reviews enable row level security;
alter table public.user_settings enable row level security;

create policy profiles_own_all on public.profiles for all to authenticated using((select auth.uid())=id) with check((select auth.uid())=id);
create policy accounts_own_all on public.trading_accounts for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy strategies_own_all on public.strategies for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy trades_own_all on public.trades for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy screenshots_own_all on public.trade_screenshots for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy conversations_own_all on public.ai_conversations for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy messages_own_all on public.ai_messages for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy analysis_own_all on public.ai_analysis for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy weekly_reviews_own_all on public.weekly_reviews for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy monthly_reviews_own_all on public.monthly_reviews for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy settings_own_all on public.user_settings for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('trade-screenshots','trade-screenshots',false,10485760,array['image/png','image/jpeg','image/webp']) on conflict(id) do update set public=false;
create policy trade_screenshots_select on storage.objects for select to authenticated using(bucket_id='trade-screenshots' and (storage.foldername(name))[1]=(select auth.uid()::text));
create policy trade_screenshots_insert on storage.objects for insert to authenticated with check(bucket_id='trade-screenshots' and (storage.foldername(name))[1]=(select auth.uid()::text));
create policy trade_screenshots_delete on storage.objects for delete to authenticated using(bucket_id='trade-screenshots' and (storage.foldername(name))[1]=(select auth.uid()::text));
