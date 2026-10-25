# Báo cáo chốt kiểm tra — 25/10/2026

## Kết quả đợt rà soát cuối

- Build thành công; lint không có lỗi chặn nhưng còn cảnh báo cần dọn (biến/import chưa dùng và một số mẫu React effect/ref).
- Kiểm thử dịch vụ dữ liệu Firebase mô phỏng: chia/ghép dữ liệu lớn, bản công khai không lộ bản nháp, chống ghi đè khi sửa đồng thời, sao lưu/khôi phục, lỗi mạng không báo thành công sai.
- Kiểm thử form bài gửi: dữ liệu hợp lệ, quyền đọc/sửa/xóa, ngày gửi giữ nguyên, xuất đủ 1.201 dòng qua nhiều trang.
- Kiểm thử API: xác thực token, phân quyền, tạo/đổi tài khoản, xử lý lỗi và lấy ảnh.
- Kiểm thử trình duyệt form gửi bài: lỗi giữ nội dung, nhận mã sau xác nhận, tìm SĐT, phân trang, sửa/xóa có xác nhận, Excel .xlsx đủ dòng và giữ số 0 đầu, hiển thị điện thoại.
- Kiểm thử trình duyệt Admin: đăng nhập/giữ phiên/đăng xuất, chặn truy cập không quyền, tab Admin riêng; FAQ/giải thưởng/cá nhân/video chuyển sang màn hình sửa rồi quay lại đúng vị trí trên desktop và điện thoại. Lỗi lưu giữ biểu mẫu.
- Một kiểm thử cũ ban đầu dừng vì dữ liệu giả lập trả về không có ảnh, trái điều kiện lưu mới. Đã cập nhật ảnh mô phỏng và chạy lại thành công; không bỏ điều kiện kiểm tra sản phẩm.
- Kiểm thử ảnh/tài khoản trên trình duyệt đã qua ở lượt sửa ảnh ngay trước đợt này. Link TikTok @bthuylinh/video/7621593210179112213 được kiểm tra chỉ đọc thực tế và lấy được JPEG; không bảo đảm mọi link Facebook/TikTok luôn truy cập được.

## Các tệp chuẩn bị thêm trong đợt này

- .gitignore và .vercelignore: loại trừ môi trường, khóa service-account/firebase-adminsdk, dữ liệu và hồ sơ kiểm thử, cấu hình Vercel local.
- README.md: bỏ hướng dẫn tài khoản demo cũ, nêu cơ chế Firebase hiện hành.
- DEPLOY_VERCEL.md: cập nhật API ảnh chạy local, luồng ảnh bìa và danh sách kiểm tra trước khi chia sẻ link.
- scripts/firebase-browser-check.mjs: cập nhật ảnh mô phỏng tương ứng hành vi hiện hành.
- Báo cáo và log chỉ lưu trong artifacts/ bên trong project.

## Trạng thái thật, chưa được triển khai

- VITE_FIREBASE_CLOUD_ENABLED=false: dữ liệu nội dung vẫn lấy từ trình duyệt. Chưa mở nhận bài thật.
- Chưa khởi tạo Git, chưa có repository/remote GitHub trong project, chưa push.
- Chưa deploy lên Vercel; chưa có URL production được kiểm chứng.
- Không bật thanh toán, không tạo tài khoản cloud, không chuyển/xóa/ghi dữ liệu Firebase thật.
- Rules mới đang nằm ở firestore.rules; chưa Publish hoặc kiểm thử bằng emulator/live trong đợt này.
- Chưa kiểm thử tải thực tế, chưa có chống spam server/App Check cho form công khai. Dữ liệu ảnh/PDF Base64 có thể tăng lượt đọc/dung lượng; không cam kết miễn phí không giới hạn.

## Việc cần chủ tài khoản thao tác, theo thứ tự

1. Xuất bản sao nội dung trong đúng trình duyệt đang chứa dữ liệu đã nhập. Danh sách bài gửi được xuất riêng khi đã mở cloud.
2. Mở Firebase Console, Publish toàn bộ firestore.rules mới. Giữ các index exemptions trong firestore.indexes.json.
3. Đăng nhập Admin trên máy hiện tại, chuyển dữ liệu lần đầu lên cloud (không ghi đè cloud đã có dữ liệu). Kiểm tra dữ liệu rồi mới bật nguồn cloud; tôi có thể sửa cấu hình khi bạn xác nhận.
4. Đăng nhập GitHub và tạo kho Private. Tôi có thể chuẩn bị Git/commit sau khi có đích kho và cấu hình tác giả; không cần gửi mật khẩu/token vào chat.
5. Đăng nhập Vercel, Import kho GitHub, chọn Vite / Node 22 / npm run build / dist, thêm biến môi trường theo DEPLOY_VERCEL.md.
6. Tạo và nhập GOOGLE_SERVICE_ACCOUNT_JSON trực tiếp vào Vercel Environment Variables, chỉ phía máy chủ. Không gửi khóa qua chat hoặc đặt trong biến VITE_.
7. Thêm domain Vercel vào Firebase Authentication Authorized domains. Deploy rồi kiểm tra các vai trò, dữ liệu công khai, ảnh và một bài gửi mẫu được duyệt trước khi mở nhận bài rộng rãi.
8. Khi sẵn sàng, Admin chọn Mở nhận bài. Theo dõi Usage Firebase và Vercel sau chạy thử.

## Cập nhật vận hành sau này

- Sửa nội dung trong Admin: không cần deploy lại sau khi cloud đã bật.
- Sửa source: kiểm thử/build, commit/push; Vercel tự triển khai theo nhánh đã cấu hình.
- Sửa Rules hoặc biến môi trường: cập nhật riêng trên Firebase/Vercel.

Tài liệu thao tác chính: DEPLOY_VERCEL.md. Các kết quả mô phỏng không thay cho kiểm thử Firebase/Vercel production.
