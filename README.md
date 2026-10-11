# Mentor Tracker

Trang theo dõi học viên mentor (US và Việt Nam): bước hiện tại, số ngày so với chuẩn, việc học viên cần làm tuần này, việc mentor cần hỗ trợ, nhật ký meeting. Trang tĩnh (HTML, CSS, JS thuần), dữ liệu lưu trên Supabase.

## Cấu trúc
- `index.html`: giao diện. Nội dung 10 bước (Playbook) nằm ở mảng `PB` đầu phần script.
- `store.js`: lớp lưu trữ. Chưa điền `config.js` thì chạy chế độ thử (localStorage); đã điền thì dùng Supabase, đăng nhập bằng link email, realtime.
- `config.js`: URL và anon key của Supabase.
- `supabase/schema.sql`: bảng `docs`, quy tắc RLS chỉ cho đúng email của bạn, realtime.

## Chạy thử trên máy
```
python3 -m http.server 8124
```
Mở http://localhost:8124 (chưa điền `config.js` là chế độ thử).

## Nối Supabase
1. Tạo project tại supabase.com.
2. SQL Editor: dán `supabase/schema.sql`, thay `THAY_EMAIL_CUA_BAN@gmail.com` (2 chỗ) bằng email của bạn, bấm Run.
3. Project Settings, API: chép Project URL và anon public key vào `config.js`. Không dùng service_role key.
4. Authentication, Sign In / Providers: tắt "Allow new users to sign up" sau khi bạn đã đăng nhập lần đầu (tùy chọn, tăng an toàn).
5. Authentication, URL Configuration: đặt Site URL và Redirect URLs là địa chỉ website sau khi deploy (và `http://localhost:8124` nếu chạy thử).

## Deploy
- Vercel: Import repo, Framework Preset "Other", không cần build, Output Directory để trống.
- Hoặc GitHub Pages: Settings, Pages, Deploy from branch, `main`, thư mục `/ (root)`.

## Bảo mật dữ liệu
- Repo này công khai nên KHÔNG chứa dữ liệu học viên. Không commit tên, email, số điện thoại học viên.
- Dữ liệu chỉ nằm trong Supabase, và quy tắc RLS chỉ cho email chủ sở hữu đọc/ghi.
