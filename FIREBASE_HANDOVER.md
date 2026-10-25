# Kết nối Firebase — bàn giao ngày 21/10/2026

## Trạng thái sau đợt sửa code

- Mã nguồn đã có cấu hình Web của project `vrb-creator` trong `.env.local`.
- Đăng nhập dùng Firebase Authentication Email/Password. Tài khoản được cấp quyền: `sondvt@vrbank.com.vn`, UID `FBeRHAsHrNPeuhmfUF6yeF8QmMs2`.
- Tài khoản demo và token tự ghi vào sessionStorage không còn cấp quyền quản trị.
- Phiên Firebase được lưu theo tab/phiên trình duyệt; khôi phục phiên được chờ trước khi xét quyền và chuyển trang.
- Dữ liệu website vẫn đọc/ghi IndexedDB cũ vì hai cờ cloud đang tắt. Không xóa hoặc tự chuyển dữ liệu hiện có.
- Rules, indexes và cấu hình Hosting mới chỉ là tệp trong project. Chưa áp dụng lên Firebase, chưa nhập dữ liệu, chưa triển khai website.
- Bản sao mã nguồn trước thay đổi: `backups/pre-firebase-20261021-001.zip`. Đây là bản sao mã nguồn, không phải bản sao IndexedDB trong trình duyệt thật của người dùng.

## Các bước tiếp theo — chỉ thực hiện sau xác nhận riêng

1. Khởi động lại máy chủ phát triển khi người dùng đồng ý, vì Vite cần nạp lại `.env.local`.
2. Người dùng đăng nhập bằng email trên và mật khẩu tự đặt trong Firebase. Không gửi mật khẩu vào chat.
3. Trong cùng trình duyệt và cùng địa chỉ/cổng từng chỉnh nội dung, mở Admin → Dữ liệu & Sao lưu → Xuất dữ liệu trình duyệt. Kiểm tra tệp JSON, giữ bản sao an toàn. Nếu dùng cổng khác hoặc trình duyệt khác, dữ liệu IndexedDB sẽ khác.
4. Duyệt tệp `firestore.rules`, rồi áp dụng Rules lên đúng project `vrb-creator`. Cần áp dụng `firestore.indexes.json` trước khi chuyển nội dung lớn để các chuỗi ảnh/PDF không bị lập chỉ mục không cần thiết. Không bật Test mode hoặc quyền ghi công khai.
5. Sau khi người dùng duyệt chuyển dữ liệu: đổi `VITE_FIREBASE_ALLOW_CLOUD_WRITES=true`, giữ `VITE_FIREBASE_CLOUD_ENABLED=false`, khởi động lại khi được đồng ý. Vào Dữ liệu & Sao lưu → Chuyển lần đầu lên cloud → kiểm tra project → Xác nhận chuyển. Thao tác này tải thêm một bản sao trước khi chuyển và chỉ chấp nhận cloud còn trống.
6. Kiểm tra dữ liệu trên Firebase và thử đọc/ghi bằng đúng admin; thử tài khoản khác và cửa sổ không đăng nhập. Khi được duyệt chuyển nguồn: đổi `VITE_FIREBASE_CLOUD_ENABLED=true`, khởi động lại hoặc tạo bản build mới.
7. Kiểm tra trên hai thiết bị: nội dung đã công bố cập nhật, nội dung ẩn/nháp không xuất hiện; người xem và tài khoản khác không ghi được. Kiểm tra đăng xuất, tải lại tab admin, nhập/xuất, PDF và liên kết.
8. Chỉ triển khai Firebase Hosting sau xác nhận riêng. Dùng Firebase Hosting cho bản SPA ở `dist`; chưa cần App Hosting hoặc nâng cấp gói.

## Kiến trúc và quyền truy cập

- `site/state` chỉ chứa mã phiên bản dữ liệu đang hoạt động và thông tin thay đổi. Người xem được đọc; chỉ UID admin được cập nhật. Không cho xóa con trỏ này qua ứng dụng.
- `datasets/{generation}/privateStores/{store}/records/{id}` chứa bản quản trị đầy đủ. Chỉ UID admin được đọc/ghi.
- `datasets/{generation}/publicStores/{store}/records/{id}` chứa bản công khai theo danh sách trường cho phép. Chỉ giữ nội dung published hoặc trang isPublished; không đưa draftContentHtml/draftMetadata vào đây.
- Người xem chỉ đọc được thế hệ dữ liệu đang hoạt động. Các phần dữ liệu cũ đã thay revision hoặc đã xóa bản công khai không còn được cấp quyền đọc công khai.
- Một listener theo dõi thay đổi của `site/state`, làm mới bộ đệm và cập nhật giao diện/chi tiết trên các thiết bị. Không tự đổ seedData lên cloud khi người xem mở web.
- Ghim thử thách, kiểm tra slug trùng và cập nhật bản công khai dùng giao dịch. Nếu thay đổi đồng thời trong lúc lưu, thao tác bị từ chối để người dùng tải lại.
- Nhập toàn bộ hoặc khôi phục tạo một thế hệ đầy đủ trước; chỉ đổi con trỏ khi tất cả đã ghi thành công và dữ liệu hiện hành chưa thay đổi. Mất kết nối giữa chừng không công khai bản nhập dở.
- Nhập riêng từng mục đi qua cùng tầng dữ liệu, không còn ghi thẳng IndexedDB khi website đã dùng cloud. Tối đa 150 nội dung trong một lần nhập riêng.
- Không tự chuyển sang dữ liệu local nếu Firestore lỗi quyền/mạng. Giao diện báo lỗi để tránh người dùng tưởng nội dung đã đồng bộ.

## Ảnh, PDF và giới hạn

Chưa dùng Cloud Storage hoặc nâng cấp gói thanh toán. Để bảo toàn khả năng nhập/xuất ảnh và PDF hiện có, bản ghi lớn được chia thành các phần JSON có revision, mỗi phần nằm dưới giới hạn tài liệu Firestore. Một bản ghi tối đa 24 MiB, bao gồm cả nội dung và tệp bản nháp. Các yêu cầu ghi được chia nhỏ, rồi công bố metadata trong một giao dịch.

Cách này dùng dung lượng, lượt đọc/ghi và băng thông của Firestore. Nên ưu tiên ảnh đã giảm dung lượng và URL trực tiếp cho PDF; không dùng website để lưu video. Các phiên bản cũ và phần của lần chuyển bị gián đoạn được giữ lại trong cloud, không công khai; cần theo dõi dung lượng và duyệt thao tác dọn riêng khi vận hành lâu dài. Khi quy mô tệp lớn, cần đánh giá dịch vụ lưu trữ tệp chuyên dụng theo ngân sách được duyệt.

## Kiểm thử và giới hạn xác nhận

- `npm run build`: kiểm tra TypeScript và build phát hành.
- `npm run test:firebase`: SDK giả lập trong bộ nhớ, kiểm tra phân quyền ứng dụng, chia/ghép Unicode và PDF, giữ riêng bản nháp, chống slug trùng, pin, khôi phục, ngắt mạng và xung đột cập nhật.
- `npm run test:browser`: kiểm tra bằng Firebase SDK thật trong trình duyệt nhưng chặn và giả lập toàn bộ API Identity Toolkit; không dùng mật khẩu thật, không đăng nhập hoặc ghi cloud thật. Mọi hồ sơ/tệp tạm và báo cáo đều đặt trong project.
- Báo cáo: `artifacts/firebase-check/report.json` và `artifacts/firebase-browser/report.json`.
- Rules chưa được chạy với Firebase Emulator hay kiểm chứng trên project thật trong đợt này. Các kiểm tra quyền thực tế là bước bắt buộc sau khi được phép áp dụng Rules, trước Hosting.
- Máy chạy kiểm tra trình duyệt cần Playwright và Edge; bộ kiểm tra tự tìm Playwright được cài trong môi trường hiện tại. Khi chuyển máy, cài Playwright trong project hoặc cấu hình đường dẫn phù hợp.

## Quay lại nếu chưa đạt kiểm tra

Giữ bản IndexedDB và JSON trước chuyển. Nếu chưa triển khai Hosting, có thể chuyển `VITE_FIREBASE_CLOUD_ENABLED=false` rồi khởi động lại sau khi được phép để tiếp tục dùng dữ liệu local. Các sửa trên cloud không tự nhập ngược về local; cần xuất sao lưu cloud trước khi quyết định chuyển nguồn để tránh bỏ sót thay đổi.

Không giải nén đè bản backup hoặc xóa dữ liệu cloud khi chưa xác nhận phạm vi phục hồi.
