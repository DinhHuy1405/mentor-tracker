# Bộ prompt phân tích: từ sản phẩm đến ngách, đến giá nhập và giá bán

Dùng cho buổi hướng dẫn FastMoss. Phần "Quy trình tự động" ngay bên dưới là cách nhanh nhất; các prompt chi tiết từng bước nằm phía sau. Cách dùng: copy prompt, thay phần trong ngoặc vuông [ ], dán vào ChatGPT (hoặc Claude). Lưu file này lại để dùng cho mọi ngách sau.

## Quy trình tự động (khuyên dùng)

Chỉ cần 2 prompt. AI tự làm hết phần tìm ngách, chọn sản phẩm, lấy số FastMoss. Bước duy nhất cần thông tin của bạn là thông tin nhập hàng. Công thức tính giá nằm sẵn trong file tính giá (bản TinhGia_TuDong), không cần AI tính.

Cần: Claude hoặc ChatGPT đã kết nối FastMoss MCP, và file tính giá.

1. Chạy **Prompt Tự động** đúng thị trường của bạn (US hoặc VN, bên dưới). Copy khối 2 dán vào sheet DỮ LIỆU FASTMOSS, ô A5.
2. Làm việc với nhà cung cấp, rồi chạy **Prompt Nhập hàng** đúng thị trường của bạn. Copy khối 1 dán vào sheet NHẬP HÀNG, ô C5.
3. Mở sheet KẾT QUẢ: lợi nhuận, giá bán đề xuất, giá nhập tối đa, kết luận Làm, Cân nhắc, Bỏ cho từng sản phẩm.

### Prompt Tự động cho thị trường US

```
VAI TRÒ: Bạn là chuyên gia chọn ngách và phân tích thị trường TikTok Shop cho người bán nhập hàng từ Việt Nam để bán sang Mỹ trên TikTok Shop US. Mọi con số lấy từ FastMoss MCP, không ước đoán.

ĐẦU VÀO:
- Thị trường: US (bán sang Mỹ, tính bằng USD)
- Ý tưởng sản phẩm hoặc nhóm khách: [...]
- Thế mạnh của tôi: [...]

LÀM TUẦN TỰ, KHÔNG HỎI LẠI TÔI:
BƯỚC 1. Viết 3 phương án ngách theo công thức [đối tượng cụ thể + độ tuổi + sở thích + nhóm sản phẩm]. Loại ngách tác động trực tiếp tới sức khỏe, thực phẩm, mỹ phẩm, đồ em bé. Chấm 5 câu lọc (đối tượng, branding, logistics, thế mạnh, kiểm chứng được bằng dữ liệu), chọn 1 ngách và viết thành một câu ngắn, bỏ tính từ thừa.
BƯỚC 2. Gọi search_category_by_words rồi product_search (region US, listing đang bán, sắp xếp theo số bán 28 ngày) để tìm sản phẩm trong ngách. Chọn 5 sản phẩm win (bán chính) và 5 sản phẩm vệ tinh (bán kèm, cùng nhóm khách). Ưu tiên nhẹ, nhỏ, dễ bảo quản, ít giấy tờ (tránh sản phẩm cần FDA), giá thấp ở Việt Nam và bán giá cao ở Mỹ. Mỗi sản phẩm đặt một từ khóa tiếng Anh gọn để tra đối thủ.
BƯỚC 3. Với MỖI sản phẩm: gọi product_search theo từ khóa, lấy tối đa 10 listing cùng loại (loại combo, phụ kiện, sản phẩm khác loại). Giá thực tế mỗi listing = GMV 28 ngày chia số bán 28 ngày (số bán bằng 0 thì dùng giá thấp nhất). Tính: giá thấp nhất, trung vị, cao nhất, giá của listing bán chạy nhất, tổng số bán 28 ngày, số đối thủ, trung vị tỷ lệ hoa hồng (commission_rate_percent). Gọi product_overview (28 ngày) CHỈ cho listing bán chạy nhất và chỉ đọc tỷ lệ GMV từ affiliate (channel_distribution) và từ quảng cáo (ads_distribution, ad_traffic), bỏ qua daily_trend.
BƯỚC 4. Nhận định thị trường cho từng sản phẩm bằng một từ: Làm, Cân nhắc hoặc Bỏ, dựa trên số bán 28 ngày, số creator liên kết và mức cạnh tranh.

ĐẦU RA, CHỈ 3 KHỐI:
KHỐI 1. Ngách đã chọn (một câu) và một dòng lý do.
KHỐI 2. Bảng 10 dòng, không tiêu đề, các cột ngăn cách bằng dấu Tab, đặt trong khối code để copy. Đúng 14 cột theo thứ tự: Mã SP (SP1 đến SP10) | Loại (Win hoặc Vệ tinh) | Tên sản phẩm | Giá thấp nhất | Giá trung vị | Giá cao nhất | Giá listing bán chạy nhất | Tổng số bán 28 ngày | Hoa hồng affiliate (số %, ví dụ 10) | % GMV từ affiliate (số) | % GMV từ quảng cáo (số) | Số đối thủ | Nhận định | Link FastMoss của listing bán chạy nhất. Các cột số chỉ ghi số, dùng dấu chấm thập phân, không ký hiệu tiền.
KHỐI 3. Giới hạn dữ liệu: tìm theo từ khóa có thể sót listing, số listing đã loại và lý do, đơn vị tiền (USD), sản phẩm nào thiếu dữ liệu.

RÀNG BUỘC: Chỉ dùng số FastMoss trả về. Thiếu số nào thì để ô trống và ghi vào khối 3.
```

### Prompt Tự động cho thị trường VN

```
VAI TRÒ: Bạn là chuyên gia chọn ngách và phân tích thị trường TikTok Shop cho người bán nhập hàng từ Trung Quốc (1688, Taobao) hoặc nhà cung cấp Việt Nam để bán trong nước trên TikTok Shop Việt Nam. Mọi con số lấy từ FastMoss MCP, không ước đoán.

ĐẦU VÀO:
- Thị trường: VN (bán tại Việt Nam, tính bằng VND)
- Ý tưởng sản phẩm hoặc nhóm khách: [...]
- Thế mạnh của tôi: [...]

LÀM TUẦN TỰ, KHÔNG HỎI LẠI TÔI:
BƯỚC 1. Viết 3 phương án ngách theo công thức [đối tượng cụ thể + độ tuổi + sở thích + nhóm sản phẩm]. Loại ngách tác động trực tiếp tới sức khỏe, thực phẩm, mỹ phẩm, đồ em bé. Chấm 5 câu lọc (đối tượng, branding, logistics, thế mạnh, kiểm chứng được bằng dữ liệu), chọn 1 ngách và viết thành một câu ngắn, bỏ tính từ thừa.
BƯỚC 2. Gọi search_category_by_words rồi product_search (region VN, listing đang bán, sắp xếp theo số bán 28 ngày) để tìm sản phẩm trong ngách. Chọn 5 sản phẩm win (bán chính) và 5 sản phẩm vệ tinh (bán kèm, cùng nhóm khách). Ưu tiên nhẹ, nhỏ, ít vỡ, dễ tìm nguồn trên 1688 hoặc nhà cung cấp Việt Nam, giá nhập thấp so với giá bán trên TikTok Shop Việt Nam. Mỗi sản phẩm đặt một từ khóa tiếng Việt gọn để tra đối thủ.
BƯỚC 3. Với MỖI sản phẩm: gọi product_search theo từ khóa, lấy tối đa 10 listing cùng loại (loại combo, phụ kiện, sản phẩm khác loại). Giá thực tế mỗi listing = GMV 28 ngày chia số bán 28 ngày (số bán bằng 0 thì dùng giá thấp nhất). Lưu ý FastMoss VN: floor_price và ceiling_price tính bằng nghìn đồng (19.47 nghĩa là 19.470 VND), luôn đổi ra VND đầy đủ; giá thực tế tính từ GMV và số bán thì đã là VND đầy đủ. Tính: giá thấp nhất, trung vị, cao nhất, giá của listing bán chạy nhất, tổng số bán 28 ngày, số đối thủ, trung vị tỷ lệ hoa hồng (commission_rate_percent). Gọi product_overview (28 ngày) CHỈ cho listing bán chạy nhất và chỉ đọc tỷ lệ GMV từ affiliate (channel_distribution) và từ quảng cáo (ads_distribution, ad_traffic), bỏ qua daily_trend.
BƯỚC 4. Nhận định thị trường cho từng sản phẩm bằng một từ: Làm, Cân nhắc hoặc Bỏ, dựa trên số bán 28 ngày, số creator liên kết và mức cạnh tranh.

ĐẦU RA, CHỈ 3 KHỐI:
KHỐI 1. Ngách đã chọn (một câu) và một dòng lý do.
KHỐI 2. Bảng 10 dòng, không tiêu đề, các cột ngăn cách bằng dấu Tab, đặt trong khối code để copy. Đúng 14 cột theo thứ tự: Mã SP (SP1 đến SP10) | Loại (Win hoặc Vệ tinh) | Tên sản phẩm | Giá thấp nhất | Giá trung vị | Giá cao nhất | Giá listing bán chạy nhất | Tổng số bán 28 ngày | Hoa hồng affiliate (số %, ví dụ 10) | % GMV từ affiliate (số) | % GMV từ quảng cáo (số) | Số đối thủ | Nhận định | Link FastMoss của listing bán chạy nhất. Các cột số chỉ ghi số, dùng dấu chấm thập phân, không ký hiệu tiền.
KHỐI 3. Giới hạn dữ liệu: tìm theo từ khóa có thể sót listing, số listing đã loại và lý do, đơn vị tiền (VND), sản phẩm nào thiếu dữ liệu.

RÀNG BUỘC: Chỉ dùng số FastMoss trả về. Thiếu số nào thì để ô trống và ghi vào khối 3.
```

### Prompt Ngách và sản phẩm có sẵn cho thị trường US

Dùng khi bạn đã chốt ngách theo cấu trúc keywords của mentor và đã tìm được danh sách sản phẩm. Dán toàn bộ link các sản phẩm vào chỗ `[...]` ở cuối câu lệnh. AI kết hợp keywords với sản phẩm của bạn rồi ra bảng để dán vào file tính giá.

```
VAI TRÒ: Bạn là chuyên gia phân tích thị trường TikTok Shop US cho người bán nhập hàng từ Việt Nam để bán sang Mỹ. Mọi con số lấy từ FastMoss MCP, không ước đoán. Chỉ làm việc với sản phẩm trong DANH SÁCH SẢN PHẨM nằm ở cuối câu lệnh này, không thêm sản phẩm khác.

THỊ TRƯỜNG: US (tính bằng USD)

NGÁCH CỦA TÔI (theo cấu trúc keywords của mentor):
- Đối tượng khách cụ thể: [...]
- Độ tuổi: [...]
- Sở thích, đặc tính của họ: [...]
- Nhóm sản phẩm: [...]
- Cụm ngách đầy đủ (một câu): [...]
- Các keywords tôi đã thu thập (Instagram Reels, TikTok Shop, Shopee), mỗi dòng một keyword: [...]

LÀM TUẦN TỰ, KHÔNG HỎI LẠI TÔI:
BƯỚC 1. Đọc cụm ngách và các keywords. Với mỗi sản phẩm trong danh sách, kiểm tra có hợp ngách không (đúng đối tượng, đúng sở thích, đúng nhóm sản phẩm), ghi Hợp hoặc Chưa hợp kèm một câu lý do. Đặt cho mỗi sản phẩm một từ khóa tiếng Anh gọn, lấy từ keywords của tôi, để tra đối thủ.
BƯỚC 2. Với các sản phẩm Hợp: gọi product_search (region US, listing đang bán, sắp xếp theo số bán 28 ngày) theo từ khóa, lấy tối đa 10 listing cùng loại (loại combo, phụ kiện, sản phẩm khác loại). Giá thực tế mỗi listing = GMV 28 ngày chia số bán 28 ngày (số bán bằng 0 thì dùng giá thấp nhất). Tính: giá thấp nhất, trung vị, cao nhất, giá của listing bán chạy nhất, tổng số bán 28 ngày, số đối thủ, trung vị tỷ lệ hoa hồng (commission_rate_percent). Gọi product_overview (28 ngày) CHỈ cho listing bán chạy nhất, đọc tỷ lệ GMV từ affiliate (channel_distribution) và từ quảng cáo (ads_distribution, ad_traffic), bỏ qua daily_trend.
BƯỚC 3. Chọn tối đa 5 sản phẩm Win (bán chính) và tối đa 5 sản phẩm Vệ tinh (bán kèm, cùng nhóm khách) trong số sản phẩm Hợp. Sản phẩm cầu quá thấp, cạnh tranh quá cao hoặc không bán kèm được thì loại và ghi lý do. Nhận định mỗi sản phẩm giữ lại bằng một từ: Làm, Cân nhắc hoặc Bỏ.

ĐẦU RA, CHỈ 3 KHỐI:
KHỐI 1. Nhắc lại cụm ngách của tôi, rồi nhận xét ngắn (tối đa 3 dòng) danh sách sản phẩm có hợp ngách và có đủ 5 Win + 5 Vệ tinh không.
KHỐI 2. Bảng các sản phẩm được giữ lại (tối đa 10 dòng), không tiêu đề, các cột ngăn cách bằng dấu Tab, đặt trong khối code để copy. Đúng 14 cột theo thứ tự: Mã SP (SP1 đến SP10) | Loại (Win hoặc Vệ tinh) | Tên sản phẩm | Giá thấp nhất | Giá trung vị | Giá cao nhất | Giá listing bán chạy nhất | Tổng số bán 28 ngày | Hoa hồng affiliate (số %, ví dụ 10) | % GMV từ affiliate (số) | % GMV từ quảng cáo (số) | Số đối thủ | Nhận định | Link FastMoss của listing bán chạy nhất. Các cột số chỉ ghi số, dùng dấu chấm thập phân, không ký hiệu tiền.
KHỐI 3. Sản phẩm bị loại kèm lý do, và Giới hạn dữ liệu: tìm theo từ khóa có thể sót listing, số listing đã loại, đơn vị tiền (USD), sản phẩm nào thiếu dữ liệu.

RÀNG BUỘC: Chỉ dùng số FastMoss trả về. Thiếu số nào thì để ô trống và ghi vào khối 3. Không thêm sản phẩm ngoài danh sách của tôi.

======== DANH SÁCH SẢN PHẨM TÔI ĐÃ TÌM ĐƯỢC ========
Dán TOÀN BỘ LINK các sản phẩm bạn tìm được vào ngay dưới đây, mỗi dòng một sản phẩm (kèm tên hoặc giá nếu có). Xóa dòng [...] rồi dán vào chỗ đó:
[...]
```

### Prompt Ngách và sản phẩm có sẵn cho thị trường VN

```
VAI TRÒ: Bạn là chuyên gia phân tích thị trường TikTok Shop Việt Nam cho người bán nhập hàng từ Trung Quốc (1688, Taobao) hoặc nhà cung cấp Việt Nam để bán trong nước. Mọi con số lấy từ FastMoss MCP, không ước đoán. Chỉ làm việc với sản phẩm trong DANH SÁCH SẢN PHẨM nằm ở cuối câu lệnh này, không thêm sản phẩm khác.

THỊ TRƯỜNG: VN (tính bằng VND)

NGÁCH CỦA TÔI (theo cấu trúc keywords của mentor):
- Đối tượng khách cụ thể: [...]
- Độ tuổi: [...]
- Sở thích, đặc tính của họ: [...]
- Nhóm sản phẩm: [...]
- Cụm ngách đầy đủ (một câu): [...]
- Các keywords tôi đã thu thập (Instagram Reels, TikTok Shop, Shopee), mỗi dòng một keyword: [...]

LÀM TUẦN TỰ, KHÔNG HỎI LẠI TÔI:
BƯỚC 1. Đọc cụm ngách và các keywords. Với mỗi sản phẩm trong danh sách, kiểm tra có hợp ngách không (đúng đối tượng, đúng sở thích, đúng nhóm sản phẩm), ghi Hợp hoặc Chưa hợp kèm một câu lý do. Đặt cho mỗi sản phẩm một từ khóa tiếng Việt gọn, lấy từ keywords của tôi, để tra đối thủ.
BƯỚC 2. Với các sản phẩm Hợp: gọi product_search (region VN, listing đang bán, sắp xếp theo số bán 28 ngày) theo từ khóa, lấy tối đa 10 listing cùng loại (loại combo, phụ kiện, sản phẩm khác loại). Giá thực tế mỗi listing = GMV 28 ngày chia số bán 28 ngày (số bán bằng 0 thì dùng giá thấp nhất). Lưu ý FastMoss VN: floor_price và ceiling_price tính bằng nghìn đồng (19.47 nghĩa là 19.470 VND), luôn đổi ra VND đầy đủ. Tính: giá thấp nhất, trung vị, cao nhất, giá của listing bán chạy nhất, tổng số bán 28 ngày, số đối thủ, trung vị tỷ lệ hoa hồng (commission_rate_percent). Gọi product_overview (28 ngày) CHỈ cho listing bán chạy nhất, đọc tỷ lệ GMV từ affiliate (channel_distribution) và từ quảng cáo (ads_distribution, ad_traffic), bỏ qua daily_trend.
BƯỚC 3. Chọn tối đa 5 sản phẩm Win (bán chính) và tối đa 5 sản phẩm Vệ tinh (bán kèm, cùng nhóm khách) trong số sản phẩm Hợp. Sản phẩm cầu quá thấp, cạnh tranh quá cao hoặc không bán kèm được thì loại và ghi lý do. Nhận định mỗi sản phẩm giữ lại bằng một từ: Làm, Cân nhắc hoặc Bỏ.

ĐẦU RA, CHỈ 3 KHỐI:
KHỐI 1. Nhắc lại cụm ngách của tôi, rồi nhận xét ngắn (tối đa 3 dòng) danh sách sản phẩm có hợp ngách và có đủ 5 Win + 5 Vệ tinh không.
KHỐI 2. Bảng các sản phẩm được giữ lại (tối đa 10 dòng), không tiêu đề, các cột ngăn cách bằng dấu Tab, đặt trong khối code để copy. Đúng 14 cột theo thứ tự: Mã SP (SP1 đến SP10) | Loại (Win hoặc Vệ tinh) | Tên sản phẩm | Giá thấp nhất | Giá trung vị | Giá cao nhất | Giá listing bán chạy nhất | Tổng số bán 28 ngày | Hoa hồng affiliate (số %, ví dụ 10) | % GMV từ affiliate (số) | % GMV từ quảng cáo (số) | Số đối thủ | Nhận định | Link FastMoss của listing bán chạy nhất. Các cột số chỉ ghi số, dùng dấu chấm thập phân, không ký hiệu tiền.
KHỐI 3. Sản phẩm bị loại kèm lý do, và Giới hạn dữ liệu: tìm theo từ khóa có thể sót listing, số listing đã loại, đơn vị tiền (VND), sản phẩm nào thiếu dữ liệu.

RÀNG BUỘC: Chỉ dùng số FastMoss trả về. Thiếu số nào thì để ô trống và ghi vào khối 3. Không thêm sản phẩm ngoài danh sách của tôi.

======== DANH SÁCH SẢN PHẨM TÔI ĐÃ TÌM ĐƯỢC ========
Dán TOÀN BỘ LINK các sản phẩm bạn tìm được vào ngay dưới đây, mỗi dòng một sản phẩm (kèm tên hoặc giá nếu có). Xóa dòng [...] rồi dán vào chỗ đó:
[...]
```

Nếu FastMoss giới hạn lượt gọi: chạy lần 1 cho 5 sản phẩm win, lần 2 cho 5 sản phẩm vệ tinh, rồi dán nối tiếp vào sheet.

### Prompt Nhập hàng cho thị trường US

Đây là bước duy nhất cần thông tin của bạn.

```
VAI TRÒ: Bạn là trợ lý nhập hàng. Bạn chuyển thông tin nhà cung cấp và chi phí của tôi thành dòng dữ liệu để dán vào bảng tính. Thị trường bán: US, bảng tính tính bằng USD.

DỮ LIỆU:
- Danh sách sản phẩm (dán cột Mã SP và Tên sản phẩm từ sheet NHẬP HÀNG): [...]
- Số lượng nhập thử mỗi sản phẩm: [...]
- Tỷ giá VND sang USD (nhà cung cấp Việt Nam báo bằng VND, phải đổi ra USD): [...]
- Thông tin nhà cung cấp cho từng sản phẩm (dán tin nhắn, báo giá; ghi mã SP trước mỗi đoạn): [...]
- Kích thước đóng gói (dài x rộng x cao, cm) và cân nặng mỗi cái, nếu nhà cung cấp chưa ghi: [...]
- Chi phí dịch vụ bằng USD (bỏ trống nếu chưa có): fulfillment mỗi đơn [...], logistics đầu US mỗi đơn [...], logistics Việt Nam mỗi đơn [...], packing mỗi đơn [...]

LƯU Ý: Không cần điền cước vận chuyển quốc tế đi US. File tính giá tự tra bảng cước VPS và AM từ cân nặng, kích thước và số lượng.

NHIỆM VỤ: Với mỗi mã SP, trích giá nhập mỗi cái theo mức giá bậc thang phù hợp số lượng nhập thử (đổi ra USD), cân nặng mỗi cái (kg), kích thước đóng gói, MOQ, tên nhà cung cấp. Nếu thiếu cân nặng, kích thước hoặc số lượng của sản phẩm nào thì hỏi tôi MỘT LẦN, liệt kê hết những gì còn thiếu, rồi mới in kết quả.

ĐẦU RA:
KHỐI 1. Bảng 10 dòng, không tiêu đề, ngăn cách bằng dấu Tab, đặt trong khối code, theo đúng thứ tự mã SP1 đến SP10. Đúng 14 cột: Giá nhập | Cân nặng (kg) | Dài (cm) | Rộng (cm) | Cao (cm) | Số lượng nhập thử | (để trống: giá ship mỗi kg) | Fulfillment | Logistics đầu US | Logistics Việt Nam | Packing | MOQ | Nhà cung cấp | (để trống: giá bán dự kiến). Sản phẩm không có thông tin thì để dòng trống. Chỉ ghi số cho các cột số, dùng dấu chấm thập phân.
KHỐI 2. Thông tin còn thiếu cho từng nhà cung cấp, kèm một tin nhắn ngắn, lịch sự để hỏi (giá theo mức số lượng, MOQ, hàng mẫu, cân nặng, kích thước thùng, quy cách đóng gói, khả năng không in tên thương hiệu).

RÀNG BUỘC: Chỉ lấy số có trong dữ liệu, thiếu thì để ô trống, không đoán. Nếu có nhiều mức giá, ghi mức đang dùng ở khối 2.
```

### Prompt Nhập hàng cho thị trường VN

```
VAI TRÒ: Bạn là trợ lý nhập hàng. Bạn chuyển thông tin nhà cung cấp và chi phí của tôi thành dòng dữ liệu để dán vào bảng tính. Thị trường bán: VN, bảng tính tính bằng VND.

DỮ LIỆU:
- Danh sách sản phẩm (dán cột Mã SP và Tên sản phẩm từ sheet NHẬP HÀNG): [...]
- Số lượng nhập thử mỗi sản phẩm: [...]
- Tỷ giá tệ (CNY) sang VND nếu nhập từ 1688, Taobao: [...]
- Thông tin nhà cung cấp cho từng sản phẩm (dán tin nhắn, listing 1688, báo giá; ghi mã SP trước mỗi đoạn): [...]
- Cân nặng mỗi cái (kg), nếu nhà cung cấp chưa ghi: [...]
- Chi phí bằng VND (bỏ trống nếu chưa có): phí vận chuyển Trung Quốc về Việt Nam mỗi kg [...], logistics Việt Nam mỗi đơn (ship về kho, ship nội địa) [...], packing mỗi đơn [...]. Hàng bán tại Việt Nam không có fulfillment và logistics đầu đích, để trống hai cột này.

NHIỆM VỤ: Với mỗi mã SP, trích giá nhập mỗi cái theo mức giá bậc thang phù hợp số lượng nhập thử (đổi ra VND), cân nặng mỗi cái (kg), MOQ, tên nhà cung cấp. Nếu thiếu cân nặng hoặc số lượng của sản phẩm nào thì hỏi tôi MỘT LẦN, liệt kê hết những gì còn thiếu, rồi mới in kết quả.

ĐẦU RA:
KHỐI 1. Bảng 10 dòng, không tiêu đề, ngăn cách bằng dấu Tab, đặt trong khối code, theo đúng thứ tự mã SP1 đến SP10. Đúng 14 cột: Giá nhập | Cân nặng (kg) | (để trống: dài) | (để trống: rộng) | (để trống: cao) | Số lượng nhập thử | Phí vận chuyển Trung Quốc về Việt Nam mỗi kg | (để trống: fulfillment) | (để trống: logistics đầu đích) | Logistics Việt Nam | Packing | MOQ | Nhà cung cấp | (để trống: giá bán dự kiến). Sản phẩm không có thông tin thì để dòng trống. Chỉ ghi số cho các cột số, dùng dấu chấm thập phân.
KHỐI 2. Thông tin còn thiếu cho từng nhà cung cấp, kèm một tin nhắn ngắn, lịch sự để hỏi (giá theo mức số lượng, MOQ, hàng mẫu, cân nặng, quy cách đóng gói, khả năng không in tên thương hiệu).

RÀNG BUỘC: Chỉ lấy số có trong dữ liệu, thiếu thì để ô trống, không đoán. Nếu có nhiều mức giá, ghi mức đang dùng ở khối 2.
```

---

## Quy tắc chung (áp dụng cho mọi prompt)

- Luôn có 6 khối: VAI TRÒ, BỐI CẢNH, DỮ LIỆU, NHIỆM VỤ, ĐỊNH DẠNG, RÀNG BUỘC.
- Dán số liệu thật vào phần DỮ LIỆU. AI không có dữ liệu thì sẽ đoán, nên luôn giữ dòng ràng buộc này:
  `Chỉ dùng số trong phần DỮ LIỆU. Thiếu dữ liệu thì ghi "chưa có dữ liệu", không ước đoán. Cuối bài ghi mục Giới hạn dữ liệu.`
- Mỗi bước ra một kết quả để dán sang bước sau. Lưu từng kết quả vào Google Sheet.
- FastMoss tìm theo từ khóa có thể sót listing. Luôn đối chiếu thêm bằng lọc giá và xem từng shop.
- Quyết định cuối là của bạn, dựa trên dữ liệu thật.

Thứ tự: **Bước 1** xác định ngách, **Bước 2** tìm sản phẩm vào ngách, **Bước 3** phân tích giá đối thủ, **Bước 4** tính giá nhập tối đa và giá bán để có lời.

---

## Bước 1. Xác định ngách từ sản phẩm bạn đã chọn

### Prompt 1.1. Từ sản phẩm ra 3 phương án ngách

```
VAI TRÒ: Bạn là chuyên gia chọn ngách bán hàng thương mại điện tử sang [US / VN].
BỐI CẢNH: Tôi bán từ Việt Nam. Thế mạnh của tôi: [kiến thức, người quen, nguồn hàng]. Sản phẩm tôi đang quan tâm: [danh sách 3 đến 10 sản phẩm hoặc dán link].
NHIỆM VỤ: Tìm điểm chung của các sản phẩm này, rồi viết 3 phương án ngách theo công thức:
[đối tượng cụ thể] + [độ tuổi] + [sở thích, đặc tính] + [nhóm sản phẩm]
Với mỗi phương án nêu: lý do, rủi ro sức khỏe hoặc pháp lý (FDA, kiểm định), khả năng branding hoặc rebranding, khó khăn logistics (giá, kích thước, cân nặng, giấy tờ).
ĐỊNH DẠNG: Bảng 3 dòng; cột: cụm ngách, lý do, rủi ro, branding, logistics.
RÀNG BUỘC: Loại ngách tác động trực tiếp tới sức khỏe. Ưu tiên tự nhiên, dùng hằng ngày, dễ bảo quản, nhẹ. Mỗi cụm ngách chỉ 1 câu, bỏ hết tính từ thừa.
```

### Prompt 1.2. Chấm 5 câu hỏi lọc ngách

```
VAI TRÒ: Bạn là cố vấn kiểm tra ngách trước khi nhập hàng.
DỮ LIỆU: Ngách ứng viên: "[cụm ngách]".
NHIỆM VỤ: Chấm từ 1 đến 5 và giải thích một câu cho từng câu hỏi:
1) Đối tượng: khách là ai, tuổi, cộng đồng, sở thích rõ chưa?
2) Branding: gắn được câu chuyện, đổi bao bì, đặt tên riêng không?
3) Logistics: giá, kích thước, cân nặng, giấy tờ có dễ không?
4) Thế mạnh của tôi: [thế mạnh] có hỗ trợ ngách này không?
5) Dữ liệu: có kiểm chứng được bằng FastMoss, Kalodata, Facebook, Instagram không?
ĐỊNH DẠNG: bảng điểm + 1 câu kết luận Làm, Cân nhắc hoặc Bỏ.
RÀNG BUỘC: Nếu ngách có sản phẩm bôi lên da, ăn uống, thực phẩm chức năng hoặc đồ em bé thì ghi rõ là ngách rủi ro.
```

### Prompt 1.3. Rút gọn thành một cụm ngách

```
Rút gọn ngách sau thành một câu duy nhất, bỏ hết tính từ không cần thiết, giữ đủ 4 phần: đối tượng, độ tuổi, sở thích, nhóm sản phẩm.
Ngách: "[dán ngách dài]"
```

### Prompt 1.4. Bộ keyword để kiểm chứng ngách

```
Từ ngách "[cụm ngách]", tạo 20 keywords:
- 10 tiếng Anh để tìm trên Instagram Reels, TikTok Shop, Amazon.
- 10 tiếng Trung giản thể để tìm trên 1688.
Xếp theo mức độ cụ thể từ rộng đến hẹp. Chỉ trả bảng: keyword, ngôn ngữ, nơi dùng.
```

---

## Bước 2. Tìm các sản phẩm có thể vào ngách

### Prompt 2.1. Danh sách sản phẩm ứng viên

```
VAI TRÒ: Bạn là chuyên gia chọn sản phẩm cho ngách "[cụm ngách]".
BỐI CẢNH: Tôi nhập hàng từ Việt Nam sang [US / VN], giai đoạn test vốn ít.
NHIỆM VỤ: Đề xuất 20 loại sản phẩm phù hợp ngách. Ưu tiên: giá rẻ ở Việt Nam nhưng bán giá cao ở thị trường đích; hàng dư thừa, sản xuất nhiều tại Việt Nam; nhẹ, mỏng, dễ bảo quản; ít giấy tờ.
ĐỊNH DẠNG: Bảng; cột: sản phẩm, vì sao hợp ngách, nơi tìm nhà cung cấp, rủi ro giấy tờ, ước lượng nhẹ hay nặng.
RÀNG BUỘC: Không đề xuất thực phẩm, mỹ phẩm, đồ em bé. Điều gì không chắc thì ghi rõ "cần xác nhận lại".
```

### Prompt 2.2. Chấm điểm và chọn 5 win, 5 vệ tinh

```
DỮ LIỆU: [dán bảng 10 đến 20 sản phẩm: tên, giá bán, link, cân nặng nếu biết, doanh số nếu có]
NHIỆM VỤ: Chấm mỗi sản phẩm từ 1 đến 5 theo: nhẹ, mỏng, giá thành tốt, dễ bảo quản, ít giấy tờ, hợp ngách. Chọn 5 sản phẩm win (bán chính) và 5 sản phẩm vệ tinh (bán kèm, cùng nhóm khách).
ĐỊNH DẠNG: bảng điểm + 1 câu lý do cho mỗi sản phẩm.
RÀNG BUỘC: Không thêm sản phẩm ngoài danh sách. Sản phẩm vệ tinh phải bán kèm được với sản phẩm win.
```

### Prompt 2.3. Hỏi FastMoss MCP để tìm sản phẩm theo ngách (dùng sau khi đã kết nối FastMoss MCP)

```
Dùng dữ liệu FastMoss, thị trường [US], 28 ngày gần nhất.
1) Tìm danh mục phù hợp với "[ngách / sản phẩm]".
2) Liệt kê các sản phẩm bán chạy và sản phẩm mới lên sàn trong danh mục đó: tên, giá bán, số bán 28 ngày, GMV 28 ngày, số creator liên kết, link FastMoss.
3) Đánh dấu sản phẩm có số creator mới tăng gần đây.
Chỉ trả bảng và 3 dòng kết luận. Cuối bài ghi Giới hạn dữ liệu (từ khóa có thể sót listing).
```

---

## Bước 3. Phân tích giá đối thủ đang bán

Lấy số liệu từ FastMoss, Kalodata cho từng sản phẩm đã chọn, ghi vào bảng theo 8 chỉ số: GMV 28 ngày, số bán 28 ngày, giá bán, số creator liên kết, số creator mới, tỷ lệ doanh thu từ quảng cáo, đánh giá sao, ngày lên sàn.

### Prompt 3.0. FastMoss MCP in sẵn số để điền vào file tính giá

Dùng sau khi đã kết nối FastMoss MCP. Kết quả có thể copy dán thẳng vào sheet NHẬP của file tính giá.

```
Dùng FastMoss MCP, thị trường [US / VN], chỉ lấy listing đang bán.
Sản phẩm cần tra: "[từ khóa tiếng Anh hoặc tiếng Việt của sản phẩm]".

Làm theo thứ tự:
1) Gọi product_search với từ khóa trên, sắp xếp theo số bán 28 ngày giảm dần, lấy 10 listing cùng loại sản phẩm (gọi thêm trang nếu cần). Loại listing là combo, phụ kiện hoặc sản phẩm khác loại.
2) Với mỗi listing, lấy: tên shop, giá bán thực tế bình quân = GMV 28 ngày chia số bán 28 ngày (nếu số bán bằng 0 thì dùng giá thấp nhất và ghi chú), số bán 28 ngày, tỷ lệ hoa hồng, số creator liên kết, link FastMoss.
3) Gọi product_overview (28 ngày) cho 3 listing bán chạy nhất. Chỉ đọc tỷ lệ GMV từ quảng cáo (ad_traffic) và từ affiliate (channel_distribution), bỏ qua daily_trend.

In ra đúng 4 khối, không giải thích dài:

KHỐI A. Bảng 10 dòng để dán vào phần 6 của sheet NHẬP. 3 cột ngăn cách bằng dấu Tab, không có dòng tiêu đề, theo thứ tự: tên shop | giá bán thực tế bình quân | số bán 28 ngày.

KHỐI B. Số tham khảo cho phần 4 của sheet NHẬP:
- Hoa hồng affiliate (% giá bán): trung vị tỷ lệ hoa hồng của 10 listing.
- Tỷ lệ GMV từ affiliate và từ quảng cáo của 3 listing bán chạy nhất (cho từng listing và trung bình).

KHỐI C. Giá bán tham khảo: thấp nhất, trung vị, cao nhất, giá của listing bán chạy nhất (theo giá thực tế bình quân).

KHỐI D. Giới hạn dữ liệu: tìm theo từ khóa có thể sót listing; ghi số listing đã loại và lý do; ghi đơn vị tiền.

RÀNG BUỘC: Chỉ dùng số FastMoss trả về, không ước đoán. Giá nhập, ship, fulfillment, logistics, packing và chi phí cố định không có trong FastMoss: ghi "tự nhập".
```

### Prompt 3.1. Phân tích vùng giá đối thủ

```
VAI TRÒ: Bạn là chuyên gia phân tích giá thị trường thương mại điện tử.
DỮ LIỆU: [dán bảng các listing đối thủ cùng loại sản phẩm "[tên sản phẩm]": shop, giá bán, số bán 28 ngày, GMV 28 ngày, đánh giá sao, ngày lên sàn]
NHIỆM VỤ:
(1) Tính giá thấp nhất, giá trung vị, giá cao nhất.
(2) Chia thành 3 vùng giá: rẻ, trung bình, cao; cho biết vùng nào bán được nhiều nhất theo số bán 28 ngày.
(3) Nêu mức giá bán đề xuất để vào thị trường (một con số hoặc khoảng hẹp) và lý do.
(4) Một câu kết luận: sản phẩm này có nên vào hay không.
ĐỊNH DẠNG: bảng vùng giá + 4 gạch đầu dòng.
RÀNG BUỘC: Chỉ dùng số trong DỮ LIỆU. Cuối bài ghi Giới hạn dữ liệu.
```

### Prompt 3.2. Đánh giá cầu và cạnh tranh

```
DỮ LIỆU: [dán số liệu FastMoss, Kalodata của từng sản phẩm đã chọn]
NHIỆM VỤ: Với mỗi sản phẩm: (1) cầu đang tăng hay giảm (dựa vào creator mới và GMV), (2) mức phụ thuộc quảng cáo, (3) mức cạnh tranh (ít, vừa, cao), (4) một câu kết luận Làm, Cân nhắc hoặc Bỏ.
ĐỊNH DẠNG: bảng + 3 gạch đầu dòng "Vấn đề cần chú ý".
RÀNG BUỘC: Chỉ dùng số đã dán. Cuối bài ghi Giới hạn dữ liệu.
```

---

## Bước 4. Giá nhập tối đa và giá bán để có lời

Điền trước các khoản chi phí thật vào Google Sheet bảng tính giá (lấy từ nhà cung cấp, đơn vị fulfillment, logistics). Đơn vị USD cho thị trường US.

Công thức tính ngược:
`Giá nhập tối đa = Giá bán - Phí sàn - Hoa hồng - Phí fulfillment - Logistics US - Shipping VN sang US - Logistics VN - Packing - Chi phí marketing - Lãi mục tiêu`

### Prompt 4.1. Tính giá nhập tối đa từ giá đối thủ

```
VAI TRÒ: Bạn là chuyên gia tính giá thành cho hàng nhập từ Việt Nam bán sang [US / VN].
DỮ LIỆU:
- Giá bán đề xuất (từ bước 3): [số]
- Phí sàn và hoa hồng: [%]
- Fulfillment mỗi đơn: [số]
- Logistics đầu thị trường đích: [số]
- Shipping Việt Nam sang đích: [số / kg] và cân nặng mỗi cái [kg]
- Logistics Việt Nam và packing: [số]
- Chi phí marketing dự kiến mỗi đơn: [số]
- Lãi mục tiêu: [số hoặc %]
NHIỆM VỤ:
(1) Tính giá nhập tối đa mỗi cái để vẫn đạt lãi mục tiêu.
(2) Tính giá bán tối thiểu để biên đạt [x]% nếu giá nhập là [giá nhà cung cấp báo].
(3) Chỉ ra khoản chi phí lớn nhất.
ĐỊNH DẠNG: bảng từng bước tính (ghi rõ số, phép tính, kết quả) + 3 gạch đầu dòng kết luận.
RÀNG BUỘC: Chỉ dùng số trong DỮ LIỆU. Thiếu số nào thì ghi "chưa có dữ liệu" và hỏi tôi, không ước đoán.
```

### Prompt 4.2. So giá nhà cung cấp với giá nhập tối đa

```
DỮ LIỆU: [dán bảng: sản phẩm, giá nhà cung cấp 1688 / VN báo, MOQ, giá nhập tối đa đã tính ở prompt 4.1]
NHIỆM VỤ: Đánh dấu từng sản phẩm: Vào (giá nhà cung cấp thấp hơn giá nhập tối đa), Đàm phán (cao hơn không quá 15%), Bỏ (cao hơn nhiều). Với sản phẩm Đàm phán, nêu mức giá cần đạt.
ĐỊNH DẠNG: bảng + 1 câu kết luận cho mỗi sản phẩm.
```

### Prompt 4.3. Diễn giải lợi nhuận toàn bộ bảng giá

```
DỮ LIỆU: [dán bảng giá: giá nhập, ship, fulfillment, logistics, packing, phí sàn, hoa hồng, giá bán, lãi mỗi cái, biên %]
NHIỆM VỤ: Chỉ ra khoản chi phí lớn nhất, giá bán tối thiểu để biên đạt [x]%, và sản phẩm nên bỏ.
ĐỊNH DẠNG: 5 gạch đầu dòng, mỗi dòng một con số và một kết luận.
```

### Prompt 4.4. Hỏi nhà cung cấp

```
Soạn tin nhắn hỏi nhà cung cấp [tiếng Việt / tiếng Trung] về sản phẩm [tên]: giá theo mức số lượng, MOQ, thời gian sản xuất, hàng mẫu, quy cách đóng gói, cân nặng mỗi cái, khả năng không in tên thương hiệu bên trong sản phẩm. Ngắn, lịch sự, dưới 8 dòng.
```
