Cập nhật kết nối Firebase ngày 21/10/2026: xem [FIREBASE_HANDOVER.md](./FIREBASE_HANDOVER.md). Xác thực demo đã được thay bằng Firebase; dữ liệu cloud đang chờ kích hoạt theo xác nhận.

Thông tin cập nhật vận hành ngày 20/10/2026: xem [HANDOVER_UPDATES.md](./HANDOVER_UPDATES.md). Các mục mô tả demo bên dưới là tài liệu ban đầu.

# VRB CREATOR - Sáng tạo mỗi ngày, Lan tỏa cùng VRB

> **Cổng thông tin & Hệ thống quản lý Chiến dịch truyền thông nội bộ Khối Bán lẻ VRB**  
> **Ngân hàng Liên doanh Việt - Nga (Vietnam - Russia Joint Venture Bank)**

---

## 1. Giới thiệu tổng quan

**VRB CREATOR** là dự án website tương tác hai phân hệ (Portal người xem dành cho CBNV và Portal quản trị dành cho Admin) được xây dựng nhằm phục vụ chiến dịch truyền thông nội bộ từ ngày **01/11/2026 đến 31/12/2026** của Ngân hàng Liên doanh Việt - Nga (VRB).

Đây là **bản demo hoạt động thực tế đầy đủ tính năng (Interactive Working Demo)**, áp dụng kiến trúc SPA nhiều trang (React Router), sử dụng cơ sở dữ liệu trình duyệt **IndexedDB** độc lập, tích hợp bộ nhận diện chuẩn thương hiệu VRB (Đỏ `#E31E24` và Xanh `#005BAC`) cùng layout tối giản, sang trọng theo đúng template tham khảo.

---

## 2. Đăng nhập quản trị hiện hành

Đăng nhập tại /admin/login bằng tài khoản Firebase Authentication đã được cấp quyền. Không có tài khoản demo dùng chung. Super admin quản lý tài khoản Admin và tài khoản chỉ xem/xuất danh sách (reviewer).

Hướng triển khai hiện hành: Vercel Hobby + Firebase Spark. Xem DEPLOY_VERCEL.md. Không cần Firebase Functions hay nâng Blaze. Dữ liệu cloud chỉ được bật sau khi chuyển và kiểm tra dữ liệu. Các phần mô tả IndexedDB bên dưới phản ánh nền tảng ban đầu.

---

## 3. Cấu trúc các trang & Đường dẫn (Routing)

### 3.1. Phân hệ Người xem (CBNV VRB)

| Tên trang | Đường dẫn (URL) | Mô tả tính năng |
|---|---|---|
| **Trang chủ** | `/` | Hero banner thông điệp, thử thách ghim tiêu điểm, lưới 3 cột khám phá thử thách, thư viện 3 video mẫu, Top 5 cá nhân và tóm tắt giải thưởng |
| **Giới thiệu chương trình** | `/chuong-trinh` | Mục tiêu, thời gian, đối tượng (Sales & Sales Leader), sản phẩm áp dụng, kênh truyền thông, quy chế duyệt đăng lại trên kênh VRB |
| **Danh sách thử thách** | `/thu-thach` | 8 thử thách Thứ Hai với bộ lọc theo Tháng (Tháng 11, Tháng 12) và trạng thái thời gian (Đang diễn ra, Sắp diễn ra, Đã kết thúc) |
| **Chi tiết thử thách** | `/thu-thach/:slug` | Chi tiết đề bài, sản phẩm, định dạng, nút sao chép Hashtag nhanh, điều kiện ghi nhận, cơ cấu giải, vinh danh người đạt giải và nút nộp bài |
| **Thể lệ chương trình** | `/the-le` | Quy chế ban hành chính thức, bảng phân bổ tiêu chí chấm điểm, hỗ trợ tải file PDF đính kèm |
| **Điều khoản & Điều kiện** | `/dieu-khoan` | Nguyên tắc bảo mật thông tin khách hàng, an toàn ngân hàng, bản quyền hình ảnh, chế tài nghiêm cấm buff view ảo |
| **Hướng dẫn tham gia & FAQ** | `/huong-dan` | Quy trình 4 bước tham gia dự thi và danh mục câu hỏi thường gặp (Accordion FAQ) có thanh tìm kiếm trực tiếp |
| **Cơ cấu giải thưởng** | `/giai-thuong` | 3 nhóm giải thưởng (Thử thách thứ Hai, Giải nửa tháng, Giải tổng kết), bảng chi tiết mức thưởng và minh bạch ngân sách dự thảo |
| **Nội dung nổi bật** | `/noi-dung-noi-bat` | Lưới thư viện video và bài viết nổi bật, bộ lọc nền tảng (Facebook, TikTok) và định dạng |
| **Chi tiết bài thi / video** | `/noi-dung-noi-bat/:id` | Trang chi tiết riêng cho từng video có thông tin tác giả, đơn vị, nút mở xem bài gốc trên tab mới, nhãn cảnh báo URL |
| **Bảng xếp hạng cá nhân** | `/xep-hang/ca-nhan` | Bảng xếp hạng cán bộ bán lẻ theo kỳ, nhãn "Tạm tính" / "Chính thức", thời gian cập nhật và ghi chú cách xét |
| **Bảng xếp hạng tập thể** | `/xep-hang/tap-the` | Bảng xếp hạng điểm phong trào các Chi nhánh VRB theo kỳ |
| **Cộng đồng & Hỗ trợ** | `/cong-dong` | Nút tham gia nhóm Zalo nội bộ, biểu mẫu tiếp nhận bài dự thi, hotline và email hỗ trợ trực tiếp |
| **Trang báo lỗi 404** | `*` | Hiển thị giao diện thân thiện khi đường dẫn không tồn tại và nút dẫn về Trang chủ |

---

### 3.2. Phân hệ Quản trị (Admin)

| Khu vực quản trị | Đường dẫn (URL) | Chức năng nghiệp vụ |
|---|---|---|
| **Tổng quan Dashboard** | `/admin` | Thống kê số lượng thử thách, video, cá nhân vinh danh, tổng ngân sách và các lối tắt nhanh |
| **Thông tin chương trình** | `/admin/info` | Sửa tiêu đề, slogan, thời gian chiến dịch, hotline, email, link biểu mẫu và link nhóm Zalo |
| **Quản lý Thử thách** | `/admin/challenges` | Danh sách 8 thử thách: Thêm mới, Sửa, Xóa (có modal xác nhận tên), Ghim Trang chủ, Chuyển trạng thái Ẩn/Hiện, Nháp/Công bố |
| **Thêm/Sửa thử thách** | `/admin/challenges/:id` | Soạn thảo rich text, upload ảnh banner, nhập yêu cầu, sản phẩm, định dạng, hashtag, vinh danh người đạt giải |
| **Thể lệ & Điều khoản** | `/admin/pages` | Trình soạn thảo định dạng WYSIWYG cho Thể lệ, Điều khoản, Hướng dẫn, Giới thiệu; hỗ trợ quy trình **Lưu nháp** và **Công bố** độc lập |
| **Hướng dẫn & FAQ** | `/admin/faqs` | Thêm, sửa, xóa câu hỏi thường gặp, phân loại chủ đề, sắp xếp thứ tự hiển thị |
| **Cơ cấu Giải thưởng** | `/admin/awards` | Quản lý 3 nhóm giải, điều chỉnh từng mức thưởng, tự động tính tổng tiền ước tính so với dự thảo 102 triệu đồng |
| **Top 5 Cá nhân** | `/admin/top-individuals` | Lựa chọn và vinh danh tối đa 5 nhân sự truyền cảm hứng, tải ảnh chân dung, trích dẫn thành tích |
| **Quản lý Video / Nội dung** | `/admin/content` | Quản trị 3 video mẫu (Facebook Reel, TikTok 1, TikTok 2), kiểm tra tính hợp lệ của URL, cảnh báo link thiếu username |
| **Quản lý Bảng xếp hạng** | `/admin/leaderboards` | Tạo kỳ mới, chọn trạng thái Tạm tính/Chính thức, nhập danh sách điểm số theo từng dòng |
| **Dữ liệu & Sao lưu** | `/admin/backup` | Xuất toàn bộ cơ sở dữ liệu ra file JSON (gồm cả ảnh Base64), Nạp lại từ file JSON, Khôi phục dữ liệu mẫu ban đầu |

---

## 4. Báo cáo kiểm tra 3 Video mẫu

Bản demo được gắn sẵn 3 video mẫu theo yêu cầu:

1. **Video 1 (Facebook Reel):**  
   - URL: `https://www.facebook.com/reel/1448880283937555`  
   - Tiêu đề: *VRB Mobile Banking - Chuyển tiền siêu tốc, tiện ích trong tầm tay*  
   - Tác giả: Nguyễn Thu Hà (VRB Chi nhánh Hà Nội).  
   - Kiểm tra: Nút "Xem video gốc" mở trực tiếp Facebook Reel trong tab mới.

2. **Video 2 (TikTok 1 - Cần bổ sung URL chính xác):**  
   - URL: `https://www.tiktok.com/@/video/7620113351552601351`  
   - Tiêu đề: *Gói vay tiêu dùng lãi suất ưu đãi cùng Sales VRB*  
   - Tác giả: Trần Minh Đức (VRB Chi nhánh TP. Hồ Chí Minh).  
   - **Ghi chú nghiệm thu:** Đường dẫn này **thiếu tên tài khoản cụ thể ở phần `@/`**. Website đã gắn huy hiệu cảnh báo vàng và ghi chú rõ để Admin cập nhật lại URL chính xác trong trang Quản trị khi có link gốc hoàn chỉnh, không tự đoán mò username. Nút mở liên kết vẫn hoạt động để kiểm tra.

3. **Video 3 (TikTok 2):**  
   - URL: `https://www.tiktok.com/@bthuylinh/video/7621593210179112213`  
   - Tiêu đề: *Bật mí bí kíp mở thẻ tín dụng VRB Visa trong 5 phút*  
   - Tác giả: Bùi Thùy Linh (VRB Chi nhánh Đà Nẵng).  
   - Kiểm tra: Nút "Xem video gốc" mở trực tiếp bài đăng TikTok của tài khoản `@bthuylinh` trong tab mới.

*Tất cả video và số liệu tương tác đều được đóng dấu huy hiệu **"Dữ liệu demo"** minh bạch.*

---

## 5. Hướng dẫn Cài đặt & Khởi chạy

### Yêu cầu môi trường:
- Node.js version 18 trở lên (đã kiểm thử tương thích tốt với Node 24).
- Trình duyệt hiện đại (Chrome, Edge, Firefox, Safari).

### Các bước chạy:
```bash
# 1. Di chuyển vào thư mục dự án
cd D:\landingpage_CTV

# 2. Cài đặt các thư viện phụ thuộc (nếu chưa cài)
npm install

# 3. Khởi chạy máy chủ phát triển (Development Server)
npm run dev

# 4. Truy cập địa chỉ hiển thị trên terminal (mặc định: http://localhost:5173)
```

### Các bước Build & Kiểm tra Production:
```bash
# Biên dịch mã nguồn tối ưu cho môi trường Production
npm run build

# Chạy thử bản build production cục bộ
npm run preview
```

---

## 6. Hướng dẫn Triển khai Hosting Tĩnh (Deploy)

Dự án đã được cấu hình sẵn các file xử lý định tuyến dự phòng (SPA Fallback Rewrite) để khi người dùng mở trực tiếp bất kỳ đường dẫn nào (ví dụ: `/thu-thach/len-song-la-co-co-hoi` hay `/admin/challenges`) và nhấn F5 tải lại trang đều **không bị lỗi 404**:

- **Netlify / Cloudflare Pages:** Đã có file `public/_redirects` (`/* /index.html 200`).
- **Vercel:** Đã có file `vercel.json` (`rewrites: [ { source: "/(.*)", destination: "/index.html" } ]`).
- **IIS / Windows Server:** Đã có file `public/web.config` với khối URL Rewrite chuẩn.
- **GitHub Pages / Hosting thông thường:** Đã có file `public/404.html` đóng vai trò fallback.

---

## 7. Cơ chế Lưu trữ & Khuyến nghị khi Triển khai Thật

### 7.1. Cơ chế trong bản Demo:
- Dữ liệu được lưu trong **IndexedDB** (`vrb_creator_db`) của trình duyệt.
- Tải lại trang (F5) hoặc đóng tab mở lại dữ liệu vẫn giữ nguyên 100%.
- Có thể dùng chức năng **"Xuất sao lưu JSON"** tại `/admin/backup` để lưu file về máy tính, hoặc mang sang máy khác nạp vào bằng chức năng **"Nhập dữ liệu JSON"**.
- Có nút **"Khôi phục dữ liệu mẫu ban đầu"** để xóa toàn bộ chỉnh sửa và trả về 8 thử thách chuẩn.

### 7.2. Danh sách việc cần bổ sung khi triển khai hệ thống thật:
1. **Backend Database dùng chung:** Kết nối API với PostgreSQL / MySQL / MongoDB hoặc Firebase / Supabase để dữ liệu đồng bộ tức thời giữa các quản trị viên và thiết bị khác nhau.
2. **Xác thực & Phân quyền nâng cao:** Tích hợp SSO nội bộ VRB (LDAP / Active Directory) hoặc xác thực 2 lớp (2FA) thay thế cho tài khoản demo `test1`/`1`.
3. **Lưu trữ tệp đám mây (Cloud Storage):** Lưu ảnh tải lên vào dịch vụ lưu trữ chuyên dụng (AWS S3 / Azure Blob Storage / Cloudinary) thay vì mã hóa chuỗi Base64 trong trình duyệt.
4. **Quy chế tính điểm tự động:** Khi có công thức chấm điểm chính thức thống nhất giữa Ban Truyền thông và Khối Bán lẻ, tích hợp module tính điểm tự động từ lượt view/like/share hợp lệ.
5. **Cấu hình tên miền & Chứng chỉ SSL:** Trỏ tên miền chính thức của ngân hàng (ví dụ: `creator.vrb.com.vn`) và cài đặt SSL HTTPS.
