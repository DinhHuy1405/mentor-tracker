-- Bài giảng video gắn vào trang từng học viên (mentor.huytim.com, tab "Bài giảng").
-- Migration: academy_lessons. Chỉ THÊM schema academy, bảng, view, kho file và policy mới; không đổi public.docs.
-- Không chứa dữ liệu học viên.

create schema if not exists academy;
grant usage on schema academy to authenticated;

-- Bước hiện tại của học viên: bước đầu tiên chưa đánh dấu trong data.steps (giống hàm analyze() ở index.html).
-- Số bước mỗi chương trình phải khớp PBV (VN, 6 bước) và PBU (US, 8 bước) trong index.html.
create or replace function academy.current_step(p_steps jsonb, p_market text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select coalesce(min(n), case when p_market = 'US' then 8 else 6 end + 1)
    from generate_series(1, case when p_market = 'US' then 8 else 6 end) as n
   where coalesce(nullif(p_steps->>n::text, ''), '') = ''
$$;

-- Học viên đang đăng nhập: mã, chương trình (VN hoặc US), bước hiện tại. Không trả dòng nào nếu không phải học viên.
create or replace function academy.me()
returns table (student_id text, program text, cur_step integer)
language sql
stable
security definer
set search_path = ''
as $$
  select d.id,
         case when d.data->>'market' = 'US' then 'US' else 'VN' end,
         academy.current_step(case when jsonb_typeof(d.data->'steps') = 'object' then d.data->'steps' else '{}'::jsonb end,
                              case when d.data->>'market' = 'US' then 'US' else 'VN' end)
    from public.docs d
   where d.collection = 'students'
     and core.my_email() <> ''
     and lower(coalesce(d.data->>'email', '')) = core.my_email()
   order by d.id
   limit 1
$$;

-- Người quản lý bài giảng: academy admin trở lên (owner toàn hệ thống cũng qua).
create or replace function academy.can_edit()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select core.has_role('academy', 'admin')
$$;

revoke all on function academy.me() from public, anon;
revoke all on function academy.can_edit() from public, anon;
grant execute on function academy.me() to authenticated;
grant execute on function academy.can_edit() to authenticated;
grant execute on function academy.current_step(jsonb, text) to authenticated;

-- Học viên gọi được qua supabase.rpc("academy_me") để biết chương trình và bước của mình.
create or replace function public.academy_me()
returns table (student_id text, program text, cur_step integer)
language sql
stable
security invoker
set search_path = ''
as $$ select * from academy.me() $$;
revoke all on function public.academy_me() from public, anon;
grant execute on function public.academy_me() to authenticated;

-- ---------- Các tập ----------
create table if not exists academy.lessons (
  id            text primary key check (id ~ '^[a-z0-9-]{3,80}$'),
  program       text not null check (program in ('VN', 'US', 'ALL')),  -- ALL: dùng chung cả hai chương trình
  step_vn       integer check (step_vn between 1 and 6),  -- bước trong lộ trình VN (khớp khoá data.steps), trống nếu không dùng cho VN
  step_us       integer check (step_us between 1 and 8),  -- bước trong lộ trình US
  episode       text not null,                 -- mã tập do Đào Tạo đặt, ví dụ '1.A', '3.1'
  sort          integer not null default 0,    -- thứ tự trong cùng một bước
  title         text not null,
  duration_sec  integer,
  video_path    text not null,                 -- đường dẫn trong kho academy-lessons
  vtt_path      text,
  pdf_path      text,
  pdf_name      text,
  cover_path    text,
  chapters      jsonb not null default '[]'::jsonb,  -- [{"t":38,"title":"Chương 1. Ngách là gì"}]
  exercise      text,                          -- đề bài tập đi kèm
  exercise_type text not null default 'text' check (exercise_type in ('text', 'link', 'image')),
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (program, episode),
  check (step_vn is not null or step_us is not null)
);

alter table academy.lessons enable row level security;

-- Học viên thấy mọi tập đã công bố của chương trình mình (và tập dùng chung ALL), kể cả bước chưa tới (Huy chốt 08/11: không khoá, không ẩn).
create policy lessons_read on academy.lessons for select to authenticated
  using ((select academy.can_edit())
         or (published and exists (select 1 from academy.me() m where lessons.program in (m.program, 'ALL'))));
create policy lessons_insert on academy.lessons for insert to authenticated with check ((select academy.can_edit()));
create policy lessons_update on academy.lessons for update to authenticated
  using ((select academy.can_edit())) with check ((select academy.can_edit()));
create policy lessons_delete on academy.lessons for delete to authenticated using ((select academy.can_edit()));

grant select, insert, update, delete on academy.lessons to authenticated;
revoke all on academy.lessons from anon;

drop trigger if exists lessons_touch on academy.lessons;
create trigger lessons_touch before update on academy.lessons
  for each row execute function core.touch_updated_at();

create or replace view public.academy_lessons with (security_invoker = true) as select * from academy.lessons;
grant select, insert, update, delete on public.academy_lessons to authenticated;
revoke all on public.academy_lessons from anon;

-- ---------- Tiến độ và bài nộp ----------
create table if not exists academy.progress (
  student_id    text not null,                 -- id hồ sơ học viên trong public.docs (collection students)
  lesson_id     text not null references academy.lessons(id) on delete cascade,
  watched_pct   integer not null default 0 check (watched_pct between 0 and 100),
  watched_at    timestamptz,                   -- lúc xem tới 90%
  submission    jsonb,                         -- {"text":"...","link":"https://...","image_path":"<student>/<lesson>/<file>"}
  submitted_at  timestamptz,
  status        text not null default 'chua_nop'
                check (status in ('chua_nop', 'da_nop', 'da_xem', 'lam_lai')),
  score         integer check (score between 0 and 10),   -- chỉ dùng nếu Huy chọn chấm điểm
  mentor_note   text,
  reviewed_at   timestamptz,
  updated_at    timestamptz not null default now(),
  primary key (student_id, lesson_id)
);

alter table academy.progress enable row level security;

create policy progress_read on academy.progress for select to authenticated
  using ((select academy.can_edit()) or student_id = (select m.student_id from academy.me() m));
create policy progress_insert on academy.progress for insert to authenticated
  with check ((select academy.can_edit()) or student_id = (select m.student_id from academy.me() m));
create policy progress_update on academy.progress for update to authenticated
  using ((select academy.can_edit()) or student_id = (select m.student_id from academy.me() m))
  with check ((select academy.can_edit()) or student_id = (select m.student_id from academy.me() m));
create policy progress_delete on academy.progress for delete to authenticated using ((select academy.can_edit()));

grant select, insert, update, delete on academy.progress to authenticated;
revoke all on academy.progress from anon;

-- Học viên chỉ đổi được phần của mình (xem, nộp bài); phần chấm của mentor giữ nguyên.
create or replace function academy.progress_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  editor boolean := academy.can_edit();
  has_sub boolean := coalesce(nullif(btrim(new.submission->>'text'), ''), nullif(btrim(new.submission->>'link'), ''),
                              nullif(btrim(new.submission->>'image_path'), '')) is not null;
begin
  new.updated_at := now();
  if tg_op = 'UPDATE' then
    new.watched_pct := greatest(coalesce(old.watched_pct, 0), coalesce(new.watched_pct, 0));
    new.watched_at := coalesce(old.watched_at, new.watched_at);
  end if;
  if new.watched_pct >= 90 and new.watched_at is null then new.watched_at := now(); end if;
  if editor then
    if new.status in ('da_xem', 'lam_lai') and new.reviewed_at is null then new.reviewed_at := now(); end if;
    return new;
  end if;
  if tg_op = 'UPDATE' then
    new.mentor_note := old.mentor_note;
    new.score := old.score;
    new.reviewed_at := old.reviewed_at;
    if new.submission is distinct from old.submission then
      if has_sub then new.status := 'da_nop'; new.submitted_at := now();
      else new.status := 'chua_nop'; new.submitted_at := null; end if;
    else
      new.status := old.status;
      new.submitted_at := old.submitted_at;
    end if;
  else
    new.mentor_note := null; new.score := null; new.reviewed_at := null;
    if has_sub then new.status := 'da_nop'; new.submitted_at := now();
    else new.status := 'chua_nop'; new.submitted_at := null; end if;
  end if;
  return new;
end;
$$;
revoke all on function academy.progress_guard() from public, anon, authenticated;

drop trigger if exists progress_guard on academy.progress;
create trigger progress_guard before insert or update on academy.progress
  for each row execute function academy.progress_guard();

create or replace view public.academy_progress with (security_invoker = true) as select * from academy.progress;
grant select, insert, update, delete on public.academy_progress to authenticated;
revoke all on public.academy_progress from anon;

-- ---------- Kho file ----------
-- academy-lessons: video, phụ đề, PDF, ảnh bìa. 50 MB mỗi file.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('academy-lessons', 'academy-lessons', false, 52428800,
        array['video/mp4', 'text/vtt', 'application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- academy-submissions: ảnh bài nộp của học viên, thư mục <student_id>/<lesson_id>/. 10 MB mỗi file.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('academy-submissions', 'academy-submissions', false, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

-- Học viên mở file của tập đã công bố thuộc chương trình mình hoặc dùng chung; người quản lý mở mọi file.
create policy academy_lessons_read on storage.objects for select to authenticated
  using (
    bucket_id = 'academy-lessons'
    and (
      (select academy.can_edit())
      or exists (
        select 1 from academy.lessons l, academy.me() m
         where l.published
           and l.program in (m.program, 'ALL')
           and storage.objects.name in (l.video_path, l.vtt_path, l.pdf_path, l.cover_path)
      )
    )
  );
create policy academy_lessons_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'academy-lessons' and (select academy.can_edit()));
create policy academy_lessons_update on storage.objects for update to authenticated
  using (bucket_id = 'academy-lessons' and (select academy.can_edit()))
  with check (bucket_id = 'academy-lessons' and (select academy.can_edit()));
create policy academy_lessons_delete on storage.objects for delete to authenticated
  using (bucket_id = 'academy-lessons' and (select academy.can_edit()));

create policy academy_sub_read on storage.objects for select to authenticated
  using (bucket_id = 'academy-submissions'
         and ((select academy.can_edit())
              or (storage.foldername(name))[1] = (select m.student_id from academy.me() m)));
create policy academy_sub_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'academy-submissions'
              and (storage.foldername(name))[1] = (select m.student_id from academy.me() m));
create policy academy_sub_update on storage.objects for update to authenticated
  using (bucket_id = 'academy-submissions'
         and (storage.foldername(name))[1] = (select m.student_id from academy.me() m))
  with check (bucket_id = 'academy-submissions'
              and (storage.foldername(name))[1] = (select m.student_id from academy.me() m));
create policy academy_sub_delete on storage.objects for delete to authenticated
  using (bucket_id = 'academy-submissions' and (select academy.can_edit()));
