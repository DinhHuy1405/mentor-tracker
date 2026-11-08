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

## Bài giảng video (tab "Bài giảng")
- `academy.js`: tab "Bài giảng" trên trang từng học viên và mục "Bài giảng" ở menu mentor. Học viên thấy mọi tập đã công bố của chương trình mình (VN hoặc US) và tập dùng chung, xếp theo bước; xem video có phụ đề, mục lục chương, tải PDF, nộp bài tập ngay dưới video. Mentor thấy bảng tiến độ (đã xem, đã nộp) và đánh dấu "đã xem" hoặc "cần làm lại" kèm nhận xét.
- Dữ liệu: bảng `academy.lessons`, `academy.progress` (view `public.academy_lessons`, `public.academy_progress`), kho riêng tư `academy-lessons` và `academy-submissions`, link ký có hạn 3 giờ. Cài đặt: `supabase/academy_lessons.sql`. Số bước mỗi chương trình trong hàm `academy.current_step` phải khớp `PBV`, `PBU` trong `index.html`.
- Không bỏ video, phụ đề, PDF hay bài nộp vào repo này (repo công khai).

**Thêm một tập:** đăng nhập bằng tài khoản owner, mở mục "Bài giảng" ở menu trái, điền khung "Thêm một tập": chương trình (VN, VN sang Mỹ, hoặc dùng chung), mã tập, bước VN và bước US, tên, bài tập và kiểu nộp, chọn file .mp4 (tối đa 50 MB), .srt, mục lục .txt (mỗi dòng `00:38 Tên chương`), .pdf; tick "Công bố" khi sẵn sàng.

## Deploy
- Vercel: Import repo, Framework Preset "Other", không cần build, Output Directory để trống.
- Hoặc GitHub Pages: Settings, Pages, Deploy from branch, `main`, thư mục `/ (root)`.

## Bảo mật dữ liệu
- Repo này công khai nên KHÔNG chứa dữ liệu học viên. Không commit tên, email, số điện thoại học viên.
- Dữ liệu chỉ nằm trong Supabase, và quy tắc RLS chỉ cho email chủ sở hữu đọc/ghi.
