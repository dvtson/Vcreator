# Tiếp nhận bài dự thi — 25/10/2026

## Luồng và phạm vi

- `/gui-bai`: form họ tên, số điện thoại, đơn vị/chi nhánh và một đường dẫn HTTP/HTTPS. Không tải tệp, không yêu cầu tài khoản người tham gia.
- Các nút gửi/nộp bài trước đây mở form ngoài nay mở `/gui-bai`. Công tắc `isSubmissionActive` trong Thông tin chương trình điều khiển hiển thị nút; công tắc tiếp nhận trong Admin điều khiển quyền tạo bài thật.
- `/admin/submissions`: admin xem danh sách, tải 50 bài mỗi lần, tìm trong bài đã tải, sửa ở màn hình riêng rồi quay về danh sách, xóa có xác nhận, xuất toàn bộ Excel .xlsx, CSV hoặc JSON kể cả các trang chưa tải. Dấu thời gian server được hiển thị ở múi giờ Việt Nam; CSV có cả giờ UTC.
- Một dòng là một lần gửi link, không phải một người duy nhất. Một người gửi nhiều link có nhiều dòng. Chưa xác minh danh tính, chưa kiểm tra nội dung đích có xem được, chưa chấm điểm/duyệt/tự công bố.
- Dữ liệu nằm riêng tại `submissions/{id}`; không trộn vào Nội dung nổi bật và không đưa vào bản sao nội dung website theo generation. Sao lưu danh sách bằng Excel/CSV/JSON riêng. Số điện thoại được lưu và xuất Excel dưới dạng chữ để giữ số 0 đầu. Khôi phục/reset nội dung website không xóa bài dự thi.
- Tìm kiếm diễn ra trên các trang đã tải để không quét toàn bộ Firestore mỗi lần gõ. Bài mới xuất hiện khi tải lại danh sách. Xuất toàn bộ phân trang 500 dòng/lần; nếu lỗi, không tạo tệp thiếu. Sửa bài giữ nguyên submittedAt; updatedAt/updatedBy ghi nhận thay đổi. Giao dịch kiểm tra phiên bản trước khi sửa/xóa để ngăn ghi đè nội dung vừa được người khác sửa. Xuất nhiều trang không phải ảnh chụp giao dịch toàn bộ dữ liệu: thay đổi/xóa trong lúc xuất có thể ảnh hưởng kết quả; nên xuất khi ít thao tác quản trị.

## Quyền và kích hoạt (chưa làm trên Firebase thật)

1. Duyệt rồi Publish toàn bộ `firestore.rules` mới, không chỉ dùng bản Rules trước đây. Giữ các index exemptions đã cấu hình.
2. Hoàn tất chuyển dữ liệu nội dung sang Cloud, sau xác nhận mới bật `VITE_FIREBASE_CLOUD_ENABLED=true`. Khi đang dùng local, form báo chưa mở và Admin hiện hướng dẫn, không âm thầm ghi bài cục bộ.
3. Admin vào Bài dự thi đã gửi, chọn Mở nhận bài và xác nhận. Thao tác này tạo/cập nhật `submission_settings/public` với `{enabled:true}`. Chưa có tài liệu này đồng nghĩa đóng.
4. Thử bài có kiểm soát khi được duyệt; kiểm tra server timestamp, admin thấy được, cửa sổ khách không đọc/list/sửa/xóa được bài, đóng tiếp nhận chặn tạo mới, và CSV xuất đúng tiếng Việt/giờ.
5. Trước khi mở rộng công khai cần cấu hình, kiểm thử Firebase App Check và xem giới hạn/tình trạng lạm dụng. Quyền create công khai có kiểm tra cấu trúc không tự thay thế chống bot/rate limiting. Hiện chưa tích hợp App Check/CAPTCHA hay giới hạn tần suất server; người tham gia có thể tự khai tên/đơn vị. Chưa cam kết kiểm thử tải thực tế.

Rules chỉ cho khách tạo tài liệu có đúng 5 trường: fullName, phone, branch, originalUrl, submittedAt; kiểm tra kiểu, độ dài, số điện thoại 9–15 chữ số (có thể bắt đầu bằng +), HTTP/HTTPS và thời gian bằng request.time. Super admin/admin được sửa/xóa; reviewer chỉ xem/xuất. Chỉ tài khoản quản trị được đọc thông tin người gửi; khách không được đọc/sửa/xóa. Bản ghi cũ thiếu số điện thoại vẫn hiện Chưa có; cần bổ sung số điện thoại khi sửa. Tiếp nhận chỉ mở khi cờ server enabled=true. ID giữ nguyên khi thử lại để không cố tạo nhiều bản ghi khi chưa rõ kết quả. Hết 20 giây chờ, báo chưa xác nhận và giữ nội dung, không báo thành công; thao tác ghi đang chờ có thể hoàn thành sau đó. Dùng mã tiếp nhận để kiểm tra trong Admin.

## Kiểm thử

- `npm run build` và `npm run lint` (lint còn cảnh báo kế thừa).
- `npm run test:submissions`: dịch vụ mô phỏng, kiểm tra validation, server timestamp, giới hạn Cloud, quyền admin, lỗi mạng, phân trang/xuất 1.201 dòng có timestamp trùng.
- `npm run test:submissions:browser`: dịch vụ bài gửi mô phỏng và Auth endpoint chặn trong hồ sơ riêng, gửi lỗi giữ nội dung, gửi thành công nhận mã, khách bị chặn Admin, danh sách/tìm kiếm/phân trang/CSV và XLSX 120 dòng, sửa giữ ngày gửi, xóa/xác nhận/hủy, đóng form và bố cục mobile.
- Cache Vite riêng dưới artifacts/submissions/browser, không dùng cache của website 5173.
- Các kiểm tra trên không phải kiểm chứng Rules bằng emulator và không gọi Firebase thật. Không deploy, không sửa cấu hình Firebase hoặc ghi bài thật trong đợt triển khai code này.

## PDF và ảnh trong website

- Form người tham gia không dùng PDF/ảnh/video tải lên, chỉ lưu thông tin và link.
- PDF là tùy chọn cho tài liệu chương trình, thể lệ, điều khoản, hướng dẫn. Không gắn file thì không hiện nút tải; nội dung web vẫn xem được.
- Ảnh dùng cho logo, nền trang chủ, banner thử thách, ảnh cá nhân nổi bật và ảnh xem trước nội dung. Không xóa ảnh/PDF cũ trong thay đổi này.
- Ảnh xem trước tự động được xử lý bởi API Vercel khi lưu link trong Admin; xem ADMIN_ACCOUNTS_HANDOVER.md và DEPLOY_VERCEL.md. Khi nền tảng không cung cấp ảnh, giữ ảnh hiện có.

## Trạng thái sau cập nhật

Đã kiểm tra build, dịch vụ mô phỏng và trình duyệt cách ly; không gọi Firebase thật, chưa kiểm chứng Rules bằng emulator. Cloud vẫn tắt trong .env.local; cần Publish toàn bộ firestore.rules mới và hoàn tất chuyển dữ liệu/bật cloud theo DEPLOY_VERCEL.md trước khi mở nhận bài. Không tự triển khai hay bật thanh toán.

## Cập nhật ảnh bìa video — 25/10/2026

Đổi link trong Admin xóa ảnh của link cũ. TikTok ưu tiên dữ liệu video đúng ID trước oEmbed, không chọn og:image chung/avatar. Không có ảnh thì báo lỗi và giữ màn hình sửa để thử lại. npm run dev có middleware lấy ảnh riêng cho local, xác thực token Firebase và quyền root/admin, không cần khóa dịch vụ và không ghi cloud. Sau thay đổi vite.config.ts, khởi động lại dev tại cổng 5173. Vercel vẫn sử dụng API máy chủ đã cấu hình riêng. Kiểm tra bằng node scripts/preview-check.mjs (mô phỏng mạng) và npm run test:admin-browser; chưa kiểm chứng link người dùng đang dán.
