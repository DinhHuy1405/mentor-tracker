-- Chạy file này trong Supabase: SQL Editor, New query, dán, Run.
-- BƯỚC BẮT BUỘC: thay THAY_EMAIL_CUA_BAN@gmail.com (2 chỗ) bằng email bạn dùng để đăng nhập.

create table if not exists public.docs (
  collection text not null,
  id         text not null,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);

alter table public.docs enable row level security;
alter table public.docs replica identity full;

drop policy if exists owner_only on public.docs;
create policy owner_only on public.docs
  for all
  using      (lower(auth.jwt() ->> 'email') = lower('THAY_EMAIL_CUA_BAN@gmail.com'))
  with check (lower(auth.jwt() ->> 'email') = lower('THAY_EMAIL_CUA_BAN@gmail.com'));

-- Realtime: đồng bộ giữa điện thoại và máy tính
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'docs') then
    alter publication supabase_realtime add table public.docs;
  end if;
end $$;
