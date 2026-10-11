/* Điền 2 giá trị lấy từ Supabase: Project Settings, API.
 * anon key là khóa công khai (an toàn để nằm trong trang web); dữ liệu được bảo vệ bằng đăng nhập và quy tắc RLS trong supabase/schema.sql.
 * KHÔNG dán service_role key vào đây. */
window.MENTOR_CONFIG = {
  supabaseUrl: "https://ksjhdksmtfscatwmelva.supabase.co",
  anonKey: "sb_publishable_bqwoCN4UpG7sivr33tYn0Q_Ve6UoOYo"
};
