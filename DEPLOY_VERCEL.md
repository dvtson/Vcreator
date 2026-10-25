# Phương án hiện hành: Vercel + Firebase Spark

Trang cá nhân hỗ trợ cuộc thi nội bộ: Vercel Hobby phục vụ giao diện và Vercel Functions; Firebase Spark giữ Firestore và Authentication. Không dùng Cloudflare, không cần triển khai Firebase Cloud Functions hoặc nâng Blaze.

## Source đã chuẩn bị

- React/Vite build vào dist; vercel.json có SPA fallback, chừa /api/ cho máy chủ.
- `api/[action].mjs` dùng Node 22, gọi logic chung trong server/. Chỉ xử lý bốn thao tác quản trị đã định nghĩa. Không cần cài SDK Admin trong trình duyệt.
- Frontend dùng /api trên cùng domain theo mặc định, không cần địa chỉ máy chủ thứ ba. Biến VITE_ADMIN_API_URL chỉ dùng khi chủ động ghi đè ở môi trường kiểm thử.
- Firebase ID token được kiểm tra chữ ký, project, hạn dùng; kiểm tra tài khoản bị khóa/thu hồi và hồ sơ quyền. Tạo/đổi tài khoản chỉ cho UID Super admin. Không gửi mã xác thực email và không lưu mật khẩu vào Firestore.
- Ảnh bìa video được lấy khi mở sửa/dán link và khi lưu. Đổi link xóa ảnh của link cũ. TikTok chọn đúng ID video, không lấy avatar/ảnh chia sẻ chung. Nếu không lấy được ảnh và chưa có ảnh thay thế, form báo lỗi và chưa lưu.
- Đã gỡ cấu hình và công cụ Cloudflare khỏi luồng hiện hành. Thư mục functions/ còn các tệp tương thích/đợt triển khai trước, được loại khỏi upload Vercel. Tài liệu cũ nói đến Blaze là lịch sử phương án cũ, không phải hướng triển khai hiện tại.

## Trình tự triển khai (chờ thao tác/xác nhận người dùng)

1. Sao lưu IndexedDB ở đúng trình duyệt/origin. Áp dụng firestore.rules mới và index exemptions. Chuyển dữ liệu từ Admin lên Cloud, kiểm tra rồi mới bật nguồn Cloud.
2. Đưa source lên GitHub Private thuộc tài khoản cá nhân, bảo đảm .env.local, backups/, artifacts/ và khóa dịch vụ không nằm trong Git. Không push tự động khi chưa được duyệt.
3. Trong Vercel, Import repository, chọn Vite, build `npm run build`, output `dist`, Node 22. Không dùng cấu hình Cloudflare hoặc Firebase Functions.
4. Điền các VITE_FIREBASE_* và VITE_FIREBASE_ADMIN_* public config tương ứng .env.local trên Vercel. Hai cờ CLOUD_ENABLED/ALLOW_CLOUD_WRITES chỉ bật theo bước dữ liệu đã duyệt, không bật trước khi chuyển/kiểm tra Cloud.
5. Cấu hình `GOOGLE_SERVICE_ACCOUNT_JSON` làm Environment Variable **chỉ phía máy chủ** trên Vercel. Đây là thông tin quản trị để máy chủ gọi Firebase, không phải mật khẩu tài khoản Super admin. Không đặt tiền tố VITE_, không commit hoặc gửi vào chat. Tài khoản dịch vụ phải thuộc project vrb-creator và có quyền Authentication Admin + quyền Firestore cần thiết. Chưa tạo hoặc đọc khóa thật trong đợt chuẩn bị code này.
6. Domain Vercel tự được đưa vào danh sách Origin từ biến hệ thống; nếu dùng domain riêng thì thêm ALLOWED_ORIGINS (các origin ngăn bằng dấu phẩy). Thêm domain web vào Firebase Authentication Authorized domains khi cần đăng nhập.
7. Deploy bản xem thử theo xác nhận, kiểm tra quyền và dữ liệu bằng tài khoản thử được duyệt; chỉ sau đó công bố URL chính thức. Chưa hứa số người đồng thời khi chưa kiểm thử tải/hạn mức thực tế.

## Cập nhật sau này

- Đổi nội dung bằng Admin: lưu lên Firestore, không cần deploy lại.
- Đổi source: kiểm tra/build, commit/push GitHub rồi Vercel build bản mới theo nhánh cấu hình. Có thể duyệt Preview trước khi cập nhật Production.
- Đổi Rules: Publish/deploy Rules riêng; sửa tệp trên máy không tự áp dụng lên Firebase.

## Kiểm tra tại máy

- npm run build
- npm run test:api — logic HTTP và Google REST với token/khóa thử sinh trong bộ nhớ, không dùng khóa thật.
- npm run test:admin-backend — tạo tài khoản, quyền, rollback và lấy ảnh.
- npm run test:admin-browser — phản hồi API và Auth giả lập, kiểm tra giao diện tài khoản và ảnh tự lấy lúc Lưu.
- npm run test:firebase / npm run test:submissions — hồi quy dữ liệu và danh sách bài gửi.

`npm run dev` phục vụ giao diện và API lấy ảnh bìa local tại /api/previewImage. API local xác thực tài khoản Firebase bằng token người đăng nhập, không cần khóa dịch vụ. Các thao tác tạo/list/đổi tài khoản vẫn cần API Vercel và GOOGLE_SERVICE_ACCOUNT_JSON chỉ phía máy chủ. Chưa deploy, tạo tài khoản Cloud hay nâng bất kỳ gói nào.

## Kiểm tra chốt trước khi chia sẻ link

- Mở link ở điện thoại/trình duyệt khách: nội dung công bố phải xem được, không hiện bản nháp hoặc thông tin người gửi.
- Thử tài khoản reviewer: chỉ xem/xuất bài gửi; không sửa/xóa/tạo tài khoản.
- Gửi một bài mẫu được duyệt: đủ tên/SĐT/đơn vị/link, Admin thấy ngày giờ; sửa không đổi ngày gửi, xóa có xác nhận, Excel giữ số 0 đầu SĐT.
- Kiểm tra ảnh bìa bằng link thật; Facebook/TikTok có thể chặn lấy ảnh.
- Đóng nhận bài và kiểm tra form khách không gửi được; mở lại khi bắt đầu cuộc thi.
- Kiểm tra Usage Firestore/Vercel sau khi chạy thử. Chưa có kiểm thử tải thực tế hoặc chống spam server cho form công khai; không khẳng định số người đồng thời hay miễn phí không giới hạn.
- Trước khi thay nội dung lớn: xuất bản sao nội dung và danh sách bài gửi riêng.

## Trang chủ dựng sẵn trên máy chủ

Build tạo cả client dist/ và SSR server/generated/. Đường / được rewrite đến api/homepage.mjs; server lấy nội dung public qua Rules ẩn danh, render React thành HTML có đủ các phần trang chủ và đính kèm snapshot công khai. Browser hydrate trên HTML sẵn có, không thay bằng màn hình tải. Không chèn dữ liệu tài khoản/bài gửi/bản nháp. Các trang khác giữ SPA + API public tối ưu; chưa chuyển toàn bộ trang sang SSR.

Vercel cache HTML 15 giây; dữ liệu public cache ngắn ở máy chủ và CDN. Chỉnh nội dung không cần build lại; khách có thể thấy nội dung cũ một khoảng ngắn do cache. Nếu nguồn public lỗi, route trả template SPA không cache để vẫn có đường khôi phục; không tạo nội dung mẫu giả.

Không cần thêm biến môi trường mới. scripts/build-site.mjs được giữ trong upload Vercel; các script kiểm thử vẫn bị loại. server/generated được tạo khi build và include vào function homepage. Kiểm tra npm run test:ssr sau build: HTML có đủ nội dung khi tắt JavaScript, hydration không lỗi, bố cục điện thoại.
