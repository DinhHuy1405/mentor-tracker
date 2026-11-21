-- Khoá thêm: học viên xem thêm bài giảng của chương trình thứ hai (ví dụ học viên US xem thêm khoá VN).
-- Hồ sơ học viên (public.docs, collection 'students') có trường data.extraPrograms, mảng chỉ nhận 'VN' hoặc 'US'.
-- Chỉ mentor (owner) ghi được public.docs, học viên không tự bật được.
-- Không đổi market, không đổi cách tính bước, không đổi academy.me().

-- 1. Các chương trình học viên đang đăng nhập được xem: chương trình chính, khoá thêm và 'ALL' (dùng chung).
--    Không phải học viên thì không trả dòng nào, nên không thấy cả bài dùng chung (giống bản cũ).
create or replace function academy.my_programs()
returns setof text
language sql stable security definer
set search_path to ''
as $$
  with s as (
    select d.data from public.docs d
     where d.collection = 'students' and core.my_email() <> ''
       and lower(coalesce(d.data->>'email', '')) = core.my_email()
     order by d.id limit 1
  )
  select case when s.data->>'market' = 'US' then 'US' else 'VN' end from s
  union
  select 'ALL' from s
  union
  select x from s, jsonb_array_elements_text(case when jsonb_typeof(s.data->'extraPrograms') = 'array' then s.data->'extraPrograms' else '[]'::jsonb end) x
   where x in ('VN', 'US')
$$;
revoke all on function academy.my_programs() from public, anon;
grant execute on function academy.my_programs() to authenticated;

-- 2. Bài giảng: xem bài đã công bố thuộc academy.my_programs().
drop policy if exists lessons_read on academy.lessons;
create policy lessons_read on academy.lessons for select to authenticated
  using ((select academy.can_edit())
         or (published and program in (select academy.my_programs())));

-- 3. File bài giảng (video, phụ đề, PDF, ảnh bìa) theo cùng quy tắc.
drop policy if exists academy_lessons_read on storage.objects;
create policy academy_lessons_read on storage.objects for select to authenticated
  using (bucket_id = 'academy-lessons'
    and ((select academy.can_edit())
      or exists (
        select 1 from academy.lessons l
         where l.published
           and l.program in (select academy.my_programs())
           and storage.objects.name in (l.video_path, l.vtt_path, l.pdf_path, l.cover_path)
      )
    )
  );

-- 4. student_view trả thêm extraPrograms để trang học viên chia nhóm khoá thêm.
do $do$
declare src text; dst text;
begin
  select pg_get_functiondef('public.student_view()'::regprocedure) into src;
  if position('extraPrograms' in src) > 0 then return; end if;
  dst := replace(src, $r$'firstOrder', st->'firstOrder')$r$,
                      $r$'firstOrder', st->'firstOrder', 'extraPrograms', coalesce(st->'extraPrograms', '[]'::jsonb))$r$);
  if dst = src then raise exception 'student_view: không tìm thấy chỗ thêm extraPrograms'; end if;
  execute dst;
end $do$;
