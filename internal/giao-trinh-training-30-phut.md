# Giáo trình training 30 phút: từ ngách đến phân tích lợi nhuận

Bản nháp để mentor Huy duyệt. Căn cứ: dữ liệu 11 học viên, 28 buổi họp, 22 bài tập, 11 báo cáo FastMoss trong hệ thống tính đến 18/10/2026.

## 1. Hiện trạng từ dữ liệu

| Phát hiện | Số liệu | Hệ quả |
|---|---|---|
| Hầu hết học viên đang kẹt ở bước chọn ngách và sản phẩm | Chỉ 2 trên 11 bạn đã hoàn thành bước 1 (Đạt, Phong); chưa ai hoàn thành bước 2 | Phải chuẩn hóa thật kỹ 3 buổi đầu |
| Cùng một bài tập nhưng mỗi bạn một tên, một yêu cầu | Có ít nhất 7 tên khác nhau cho bài "xác định ngách" | Học viên không biết thế nào là đạt |
| Chưa có định nghĩa "đầu ra đạt" cho từng buổi | Bài nộp là file sheet tự do, nhận xét viết tay | Mentor chấm mất thời gian, khó so sánh |
| Mỗi buổi họp phân tích ad hoc | 11 báo cáo FastMoss, mỗi báo cáo khác cách trình bày | Không tái sử dụng, học viên không học được cách tự phân tích |
| US và VN có đường đi khác nhau | VN: nguồn hàng 1688 (Trung Quốc). US: nhà sản xuất Việt Nam, LLC, fulfillment | Cần hai nhánh sau buổi 3 |
| Công cụ dữ liệu có giới hạn | FastMoss tìm theo từ khóa dễ sót listing; không có dữ liệu Canada | Prompt phải ép AI nói rõ giới hạn dữ liệu |
| Một số học viên chưa cập nhật tiến độ | Giang (hv07) và Khôi Nguyên (hv08) hiện 0 buổi "Đã họp" dù đã có lịch | Cần đối chiếu lại trạng thái buổi họp |

Kết luận: vấn đề không nằm ở nội dung mà ở **thiếu khung chung**. Một khung 30 phút cố định, một bộ đầu ra cố định và một thư viện prompt sẽ giúp mọi học viên học cùng một cách.

## 2. Khung một buổi 30 phút (dùng cho mọi buổi)

| Phút | Khối | Việc làm | Tài liệu |
|---|---|---|---|
| 0 đến 5 | 1. Đối chiếu bài | Mentor chấm bài tuần trước theo bảng tiêu chí đạt (mục 4) | Phiếu chấm |
| 5 đến 12 | 2. Kiến thức | 1 slide deck 5 đến 7 slide, một ý chính duy nhất | Slide trên tab Kiến thức |
| 12 đến 24 | 3. Làm trực tiếp | Mentor làm mẫu 5 phút, học viên làm lại 7 phút trên dữ liệu của mình | Prompt mẫu, sheet mẫu |
| 24 đến 28 | 4. Chốt đầu ra | Học viên nói lại kết luận bằng một câu | Câu kết luận |
| 28 đến 30 | 5. Giao bài | Giao đúng bài của buổi sau, đặt hạn | Bài tập chuẩn |

Quy tắc: một buổi chỉ dạy **một** kỹ năng. Nếu bài tuần trước chưa đạt thì dành khối 3 để sửa bài, không học thêm kiến thức mới.

## 3. Lộ trình giai đoạn 1: 7 buổi (khoảng 7 tuần)

| Buổi | Tên | Học viên làm ra (đầu ra) | Công cụ |
|---|---|---|---|
| 0 | Onboarding | Hiểu lộ trình, tài khoản trang theo dõi, nhận bài buổi 1 | Trang theo dõi |
| 1 | Chốt 1 ngách | 1 cụm từ ngách theo công thức + 5 keywords | Instagram Reels, ChatGPT |
| 2 | Chọn 5 sản phẩm win và 5 sản phẩm vệ tinh | Bảng 10 sản phẩm theo file sheet chuẩn | Shopee, TikTok, Reels |
| 3 | Tìm nhà cung cấp | Mỗi sản phẩm có ít nhất 3 nhà cung cấp kèm giá, MOQ, thời gian, hàng mẫu | VN: 1688 (keyword tiếng Trung từ ChatGPT). US: nhà sản xuất Việt Nam (Facebook, nhà sản xuất có sẵn) |
| 4 | Dùng AI phân tích: cách viết prompt | Bộ prompt riêng của học viên cho ngách của mình | ChatGPT hoặc Claude |
| 5 | FastMoss và Kalodata | Phiếu dữ liệu thị trường cho 10 sản phẩm | FastMoss (US, VN), Kalodata (US) |
| 6 | Bảng giá bán và lợi nhuận | Mỗi sản phẩm có giá bán đề xuất, lãi mỗi cái, biên lợi nhuận, kết luận làm hay bỏ | File Excel tính giá |

Sau buổi 6 học viên chuyển sang **giai đoạn 2** (đặt hàng, giấy tờ, fulfillment, lên sàn, đơn đầu tiên). Giai đoạn 2 dùng 6 bước đã có trong playbook, sẽ chuẩn hóa tiếp ở bản sau.

### Chi tiết từng buổi

**Buổi 1. Chốt 1 ngách**
- Học viên chuẩn bị: viết mô tả khách hàng mong muốn (ai, tuổi, sở thích) và sản phẩm nghĩ tới.
- Kiến thức: công thức ngách: đối tượng cụ thể + đặc tính + nhóm sản phẩm; 5 câu hỏi lọc (đối tượng, branding và rebranding, logistics, thế mạnh, dữ liệu); ngách rủi ro và ngách có thể win.
- Làm trực tiếp: chạy prompt P1 (mục 5) để ra 3 phương án ngách, học viên chọn 1.
- Đầu ra đạt: một cụm từ ngách duy nhất; đủ 5 trường; không thuộc ngách rủi ro (tác động trực tiếp tới sức khỏe).
- Bài buổi 2: tìm sản phẩm trên Reels và Shopee, TikTok theo file sheet chuẩn.

**Buổi 2. 5 sản phẩm win và 5 sản phẩm vệ tinh**
- Kiến thức: sản phẩm win là sản phẩm bán chính, vệ tinh là sản phẩm bán kèm cùng nhóm khách; bảng chấm điểm: nhẹ, mỏng, giá thành tốt, dễ bảo quản, không cần giấy tờ phức tạp.
- Làm trực tiếp: chạy prompt P3 để chấm điểm 10 sản phẩm.
- Đầu ra đạt: bảng 10 sản phẩm, mỗi dòng có link, giá, nguồn thấy sản phẩm, điểm; không có tên thương hiệu trong sản phẩm (chỉ ở tag).
- Bài buổi 3: tìm nhà cung cấp cho 10 sản phẩm.

**Buổi 3. Tìm nhà cung cấp**
- VN: keyword tiếng Trung do ChatGPT tạo (prompt P2), tìm trên 1688, nhập vào sheet.
- US: tìm nhà sản xuất Việt Nam có sẵn, hỏi MOQ, giá, thời gian sản xuất, hàng mẫu (prompt P6).
- Đầu ra đạt: mỗi sản phẩm có ít nhất 3 nhà cung cấp, có số lượng lớn và hàng mẫu được hỏi.
- Bài buổi 4: học viên viết lại prompt cho ngách của mình theo khung mục 5.

**Buổi 4. Dùng AI phân tích**
- Kiến thức: khung 6 khối của prompt (mục 5); AI chỉ được dùng số do học viên dán vào, không tự bịa số.
- Làm trực tiếp: học viên viết prompt, mentor sửa 2 lỗi phổ biến (thiếu bối cảnh, thiếu định dạng đầu ra).
- Đầu ra đạt: prompt chạy ra bảng đúng định dạng, có dòng "giới hạn dữ liệu".
- Bài buổi 5: xuất dữ liệu FastMoss và Kalodata cho 10 sản phẩm.

**Buổi 5. FastMoss và Kalodata**
- Kiến thức: đọc 8 chỉ số trong phiếu dữ liệu (mục 6); số creator tăng là tín hiệu dẫn dắt doanh số; tìm theo từ khóa có thể sót nên phải đối chiếu bằng lọc giá và xem từng shop.
- Làm trực tiếp: xuất 1 sản phẩm mẫu, dán vào prompt P4.
- Đầu ra đạt: phiếu dữ liệu 10 sản phẩm, mỗi sản phẩm có một câu kết luận.
- Bài buổi 6: điền giá nhập và chi phí vào file Excel tính giá.

**Buổi 6. Bảng giá bán và lợi nhuận**
- Kiến thức: bảng tính nối dữ liệu thị trường (giá bán thực tế) với chi phí (mục 7).
- Làm trực tiếp: điền 1 sản phẩm, chạy prompt P5 để diễn giải kết quả.
- Đầu ra đạt: mỗi sản phẩm có lãi trên mỗi cái, biên %, giá hòa vốn; kết luận Làm, Cân nhắc hoặc Bỏ.

## 4. Tiêu chí đạt (dùng để chấm bài, mỗi buổi 3 dòng)

| Buổi | Đạt khi |
|---|---|
| 1 | Có đủ 5 trường; viết được thành một cụm; không thuộc ngách rủi ro |
| 2 | Đủ 10 sản phẩm; có link và giá; mỗi sản phẩm có điểm theo 5 tiêu chí |
| 3 | 3 nhà cung cấp mỗi sản phẩm; có giá, MOQ, thời gian; đã hỏi mẫu |
| 4 | Prompt đủ 6 khối; đầu ra đúng bảng; có ghi giới hạn dữ liệu |
| 5 | Đủ phiếu 8 chỉ số cho 10 sản phẩm; mỗi sản phẩm có một câu kết luận |
| 6 | Đủ lãi, biên, hòa vốn cho 10 sản phẩm; giả định ghi rõ nguồn |

Trạng thái bài chỉ dùng 4 giá trị cố định: Đang làm, Đã nộp, Cần sửa, Đạt.

## 5. Thư viện prompt chuẩn

**Khung 6 khối cho mọi prompt:** VAI TRÒ, BỐI CẢNH, DỮ LIỆU, NHIỆM VỤ, ĐỊNH DẠNG ĐẦU RA, RÀNG BUỘC.
Ràng buộc bắt buộc luôn có: "Chỉ dùng số trong phần DỮ LIỆU. Nếu thiếu dữ liệu thì ghi 'chưa có dữ liệu', không ước đoán. Cuối bài ghi mục Giới hạn dữ liệu."

**P1. Từ thông tin đến ngách**
```
VAI TRÒ: Bạn là chuyên gia chọn ngách bán hàng thương mại điện tử sang [US/VN].
BỐI CẢNH: Tôi am hiểu [thế mạnh]. Khách tôi nghĩ tới: [ai, tuổi, sở thích]. Sản phẩm nghĩ tới: [nhóm sản phẩm].
NHIỆM VỤ: Viết 3 phương án ngách theo công thức [đối tượng cụ thể + đặc tính + nhóm sản phẩm]. Với mỗi phương án nêu: lý do, rủi ro sức khỏe hoặc pháp lý, khả năng branding, khó khăn logistics.
ĐỊNH DẠNG: Bảng 3 dòng; cột: cụm ngách, lý do, rủi ro, branding, logistics.
RÀNG BUỘC: Loại ngách tác động trực tiếp tới sức khỏe. Ưu tiên tự nhiên, dùng hằng ngày, dễ bảo quản, nhẹ.
```

**P2. Keywords**
```
Từ ngách "[cụm ngách]", tạo 20 keywords: 10 tiếng Anh để tìm trên Instagram Reels, TikTok Shop; 10 tiếng Trung giản thể để tìm trên 1688. Xếp theo mức độ cụ thể. Chỉ trả bảng: keyword, ngôn ngữ, nơi dùng.
```

**P3. Chấm điểm 10 sản phẩm**
```
DỮ LIỆU: [dán bảng 10 sản phẩm: tên, giá bán, link, cân nặng nếu biết]
NHIỆM VỤ: Chấm mỗi sản phẩm 1 đến 5 theo: nhẹ, mỏng, giá thành tốt, dễ bảo quản, ít giấy tờ. Chọn 5 sản phẩm win và 5 sản phẩm vệ tinh.
ĐỊNH DẠNG: bảng điểm + 1 câu lý do cho mỗi sản phẩm.
RÀNG BUỘC: Không thêm sản phẩm ngoài danh sách.
```

**P4. Phân tích dữ liệu FastMoss, Kalodata**
```
DỮ LIỆU: [dán số liệu xuất từ FastMoss, Kalodata: GMV 28 ngày, số cái bán, giá, số creator, số creator mới, tỷ lệ doanh thu từ quảng cáo, từ affiliate, đánh giá sao, ngày lên sàn]
NHIỆM VỤ: Với mỗi sản phẩm: (1) cầu đang tăng hay giảm, (2) mức phụ thuộc quảng cáo, (3) mức cạnh tranh, (4) một câu kết luận Làm, Cân nhắc hoặc Bỏ.
ĐỊNH DẠNG: bảng + 3 gạch đầu dòng "Vấn đề cần chú ý".
RÀNG BUỘC: Chỉ dùng số đã dán. Cuối bài ghi Giới hạn dữ liệu (tìm theo từ khóa có thể sót listing, thiếu thị trường nào).
```

**P5. Diễn giải lợi nhuận**
```
DỮ LIỆU: [dán các cột từ bảng giá: giá nhập, ship, phí fulfillment, logistics, packing, phí sàn, hoa hồng, giá bán, lãi mỗi cái, biên %]
NHIỆM VỤ: Chỉ ra khoản chi phí lớn nhất, giá bán tối thiểu để biên đạt [x]%, và sản phẩm nên bỏ.
ĐỊNH DẠNG: 5 gạch đầu dòng, mỗi dòng một số và một kết luận.
```

**P6. Hỏi nhà cung cấp**
```
Soạn tin nhắn hỏi nhà cung cấp [tiếng Việt/tiếng Trung] về sản phẩm [tên]: giá theo mức số lượng, MOQ, thời gian sản xuất, hàng mẫu, quy cách đóng gói, cân nặng mỗi cái, khả năng không in tên thương hiệu bên trong sản phẩm. Ngắn, lịch sự, dưới 8 dòng.
```

## 6. Phiếu dữ liệu thị trường (8 chỉ số, dùng cho cả FastMoss và Kalodata)

| Chỉ số | Cách đọc |
|---|---|
| GMV 28 ngày | Quy mô cầu của sản phẩm dẫn đầu |
| Số cái bán 28 ngày | Cầu theo số lượng, so với giá |
| Giá bán | Vùng giá khách chấp nhận |
| Số creator liên kết và số creator mới | Tín hiệu dẫn dắt: tăng thì cầu còn tăng, đứng thì có thể đã đỉnh |
| Tỷ lệ doanh thu từ quảng cáo | Cao nghĩa là phải có ngân sách quảng cáo |
| Tỷ lệ doanh thu từ affiliate | Cao nghĩa là phải có mạng creator |
| Đánh giá sao | Dưới khoảng 4 sao là chỗ có thể vượt bằng chất lượng |
| Ngày lên sàn và số shop cạnh tranh | Thị trường mới hay đã đông |

Ngưỡng để quyết định (gợi ý, anh chỉnh): quảng cáo trên 70% = phụ thuộc quảng cáo; chỉ 1 đến 2 shop chiếm trên 50% GMV = thị trường tập trung.

Lưu ý bắt buộc trong mọi báo cáo: FastMoss tìm theo từ khóa không đầy đủ; không có dữ liệu Canada; số liệu chỉ để so sánh tương đối.

## 7. Bảng giá bán và lợi nhuận (nối với dữ liệu thị trường)

Nối từ file Excel đã làm cho Phong (có sẵn công thức giá nhập tối đa). Các cột chuẩn:

| Nhóm | Cột |
|---|---|
| Dữ liệu thị trường (từ phiếu buổi 5) | giá bán thị trường, số cái bán 28 ngày, % doanh thu từ quảng cáo |
| Chi phí hàng | giá nhập, cân nặng mỗi cái |
| Chi phí vận chuyển (mentor đưa cho Emily) | shipping 25 USD/kg, logistics Việt Nam theo packing, logistics US 4,5 USD, fulfillment 1,5 đến 2 USD mỗi đơn, packing |
| Chi phí sàn | phí sàn, hoa hồng affiliate (FastMoss cho từng listing), hoàn trả (% giả định) |
| Kết quả | giá vốn đưa tới khách, lãi mỗi cái, biên %, giá hòa vốn quảng cáo (ROAS hòa vốn), kết luận |

Công thức: `lãi = giá bán - (giá nhập + ship + fulfillment + logistics US + packing + phí sàn + hoa hồng + hoàn trả + quảng cáo)`. Mọi giả định ghi rõ nguồn và ngày.

## 8. Đồng bộ trên trang theo dõi

1. Slide của từng buổi là slide kiến thức chung (có sẵn cơ chế); thêm 6 bộ slide, mỗi bộ 5 đến 7 slide.
2. Bài tập mỗi buổi dùng đúng một mẫu (tên chuẩn, các mục chuẩn, tiêu chí đạt). Em sẽ chuẩn hóa tên các bài hiện có.
3. Báo cáo phân tích cho học viên luôn theo cùng cấu trúc: 1 câu kết luận, biểu đồ tròn hoặc cột, 1 nhận định mỗi biểu đồ.
4. Phiếu chấm 3 dòng cho mỗi buổi (mục 4).

## 9. Việc cần mentor quyết định

1. Có chốt lộ trình 7 buổi giai đoạn 1 và khung 30 phút ở mục 2 không?
2. Học viên cũ đã qua buổi 1 hoặc 2 sẽ xếp vào buổi nào? (đề xuất ở bảng bên dưới)
3. Ngưỡng ở mục 6 (quảng cáo 70%, tập trung 50%) anh muốn chỉnh thế nào?
4. Các chi phí ở mục 7: anh cho em các số còn thiếu (phí packing, phí sàn, tỷ lệ hoàn trả giả định) để đưa vào bảng mẫu.
5. Em có làm tiếp 6 bộ slide và file Excel tính giá chuẩn (US và VN) không?

### Xếp học viên hiện tại vào lộ trình (đề xuất)

| Học viên | Thị trường | Đang ở | Buổi tiếp theo |
|---|---|---|---|
| Emily Vuong | US (Canada) | Đã có ngách, đang chọn 5+5 và nhà bán sỉ | Buổi 2 (hoàn thiện), rồi buổi 3 |
| Nguyễn Thành Đạt | US | Có hướng ngách Tre, đang chọn sản phẩm | Buổi 2 |
| Bùi Đức Phong | VN | Đã có ngách, đang chọn 5+5 và 1688 | Buổi 3 |
| Khánh Huyền | VN | Đang tìm hiểu 1688 | Buổi 2 |
| Phediabui | VN | Ngách "Lão", đang phân tích | Buổi 2 |
| Quỳnh Vũ | US | Đang viết lại ngách và chọn 5+5 | Buổi 1 hoàn thiện, rồi 2 |
| Giang Nguyễn | US | Mới nộp bảng sản phẩm | Buổi 1 |
| Khôi Nguyên | VN | Đang bắt keywords | Buổi 1 |
| Minh Pham | US | Chưa chốt ngách, LLC xong | Buổi 1 |
| Quang Vũ Lê | VN | Chưa có ngách | Buổi 1 |
| Nguyễn Tuấn Khang | US | Mới vào, có bài ngách | Buổi 1 (sau buổi 0 ngày 24/10) |
