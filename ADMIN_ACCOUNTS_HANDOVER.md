# Tài khoản và ảnh xem trước — 24/10/2026

## Đã hoàn thiện trong mã nguồn

- `/admin/accounts`: chỉ Super admin `sondvt@vrbank.com.vn` (UID `FBeRHAsHrNPeuhmfUF6yeF8QmMs2`) tạo tài khoản, đổi quyền, khóa/mở đăng nhập. Không cấp thêm Super admin.
- Form email, mật khẩu, xác nhận mật khẩu và quyền. Không gửi OTP/email xác minh; không đánh dấu emailVerified=true giả. Admin SDK tạo user ở máy chủ, không đăng nhập thay Super admin.
- Admin quản lý nội dung và bài dự thi, không quản lý tài khoản. Reviewer chỉ xem/tìm/xuất bài gửi. Hồ sơ quyền `admin_users/{uid}` chỉ máy chủ được ghi; tự đăng ký Firebase Auth bên ngoài không tự có quyền quản trị.
- Mật khẩu không lưu trong Firestore, danh sách, localStorage, file xuất hoặc log ứng dụng. Không thêm service-account key vào frontend/project.
- Tạo user disabled trước, tạo hồ sơ rồi kích hoạt. Lỗi giữa chừng cố khóa/xóa user mới, giữ quyền đóng. Nếu cleanup lỗi, kiểm tra Auth/Firestore thủ công trước khi thử tiếp; không ghi đè mật khẩu tài khoản có email trùng.
- ID yêu cầu chống tạo thêm khi thử lại cùng yêu cầu. Thay email/mật khẩu/quyền sẽ tạo ID yêu cầu mới.
- Khi khóa/đổi quyền: hồ sơ disabled trước, cập nhật Auth, thu hồi refresh token rồi áp quyền mới. Rules kiểm tra hồ sơ hiện tại mỗi yêu cầu; UI làm mới khi đăng nhập/khôi phục/chuyển focus. Nội dung đã tải về trước khi thu hồi không thể bị xóa từ thiết bị từ xa.
- Thao tác máy chủ verify ID token, kiểm tra revoked/disabled. Mọi thao tác tài khoản đều kiểm tra cố định Super UID, không chỉ dựa vào giao diện.

## Ảnh tự động khi Lưu

- Dán link và Lưu thông tin video: tự gọi `previewImage`, lưu ảnh trả về cùng bài. Không có nút lấy ảnh riêng. Ảnh lỗi: vẫn lưu bài, giữ ảnh cũ và báo rõ; lưu bài lỗi không báo thành công.
- HTTPS Facebook/TikTok/YouTube trong allowlist. Không đoán username TikTok thiếu. YouTube dùng ảnh video; TikTok thử oEmbed, metadata, JSON công khai; Facebook dùng metadata công khai. Không chạy/chèn HTML của nền tảng.
- Kiểm tra host, DNS không phải IP nội bộ, redirect có giới hạn, timeout, dung lượng và magic bytes JPEG/PNG/WebP. Không nhận SVG hoặc dùng proxy ảnh bên thứ ba.
- Lưu bytes ảnh thành Base64, tối đa 2 MiB, qua cơ chế chia nội dung hiện hữu để không phụ thuộc link CDN hết hạn. Làm tăng dung lượng/lượt đọc Firestore; không gọi nền tảng cho mỗi lượt người xem. Bài cũ chỉ cập nhật ảnh khi mở và Lưu, không chạy hàng loạt.
- Không cam kết mọi link: nền tảng có thể thay đổi HTML, hạn chế truy cập, xóa/ẩn bài. Ảnh thủ công vẫn là dự phòng.

## Triển khai còn chờ người dùng xác nhận

- `functions/` có package.json, lockfile và bốn callable: createAdminAccount, listAdminAccounts, changeAdminAccount, previewImage. Region asia-southeast1, runtime Node 22, maxInstances=2 mỗi function. Dependencies và npm cache đều trong project. Node local 24 có thể báo engine warning.
- Firebase Cloud Functions yêu cầu Blaze. Chưa nâng gói, gắn billing, deploy, Publish Rules, tạo tài khoản hay ghi Cloud thật trong đợt làm code này.
- Sau khi người dùng duyệt hạ tầng/billing: deploy riêng Functions (`firebase deploy --only functions --project vrb-creator`), Publish firestore.rules mới và kiểm chứng bằng tài khoản thử được duyệt. Không deploy tất cả để vô tình công bố Hosting.
- Rules cũ chỉ nhận UID Super admin; tài khoản phụ cần Rules mới. Các thao tác chưa kết nối Functions sẽ báo lỗi rõ, không giả báo tạo thành công.
- Hoàn tất chuyển nguồn dữ liệu website sang Cloud để tài khoản phụ ở các máy dùng chung nội dung. Không dựa vào IndexedDB từng máy cho vận hành chung.
- Cần kiểm chứng Rules thực tế: Admin không gọi được API tài khoản, Reviewer không ghi nội dung, người ngoài không đọc bài gửi, khóa/đổi quyền chặn phiên cũ. Chưa có kiểm thử tải nhiều người hoặc Rules emulator (workspace không có Java/firebase-tools sẵn).

## Kiểm tra

- Build và lint; còn cảnh báo kế thừa/chunk SDK lớn.
- `npm run test:firebase`: quyền Admin/Reviewer/disabled, phiên và dữ liệu hiện hữu bằng SDK doubles.
- `npm run test:submissions`: xuất toàn bộ bài gửi qua phân trang.
- `npm run test:admin-backend`: root-only, không nâng quyền Super, trùng email, rollback, profile/list không chứa mật khẩu, chống URL/IP/redirect nguy hiểm và giới hạn ảnh.
- `npm run test:admin-browser`: Auth endpoint intercepted và callable giả lập; xác nhận mật khẩu, tạo/đổi quyền, giữ phiên Super admin, xóa password sau thành công, Reviewer bị chặn, ảnh tự lấy khi Lưu, ảnh lỗi giữ bản cũ, bố cục mobile.
- Lấy ảnh thật từ YouTube công khai, TikTok @bthuylinh/video/7621593210179112213 và Facebook Reel 1448880283937555: đều trả JPEG lúc kiểm tra. Không cập nhật bài thật hay Firebase.

Nguồn: https://firebase.google.com/docs/auth/admin/manage-users và https://firebase.google.com/docs/functions/faq-and-troubleshooting
