Phương án hiện hành 25/10/2026: Vercel Hobby + Firebase Spark — xem [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md). Các ghi chú Cloudflare/Blaze bên dưới là phương án cũ, không còn dùng để triển khai.

Cập nhật 24/10/2026: tự lấy ảnh khi Lưu và quản lý tài khoản Super admin — xem [ADMIN_ACCOUNTS_HANDOVER.md](./ADMIN_ACCOUNTS_HANDOVER.md). Chưa deploy Functions hoặc Publish Rules mới.

Cập nhật ngày 23/10/2026: đã bổ sung form `/gui-bai` và Admin → Bài dự thi đã gửi, xem [SUBMISSIONS_HANDOVER.md](./SUBMISSIONS_HANDOVER.md). Chưa Publish Rules mới hay mở nhận bài thật; cần hoàn tất chuyển Cloud và kiểm tra quyền trước khi sử dụng.

Cập nhật trải nghiệm quản trị ngày 22/10/2026:

- FAQ, Giải thưởng, Top cá nhân và Nội dung/Video chuyển giữa màn hình Danh sách và Chỉnh sửa trong cùng tab Admin. Bấm Sửa/Thêm mới đưa khung quản trị lên đầu và focus ô đầu tiên; chỉ hiển thị biểu mẫu, không chèn biểu mẫu phía trên danh sách.
- Lưu thành công hoặc Hủy/Quay lại danh sách khôi phục vị trí danh sách (giới hạn theo chiều cao mới nếu nội dung thay đổi); giữ bộ lọc FAQ. Lỗi lưu giữ nguyên biểu mẫu và cho phép thử lại. Khóa biểu mẫu khi lưu và chặn gửi lặp.
- Điều hướng giữa các trang Admin cuộn đúng khung main, thay vì chỉ cuộn cửa sổ bên ngoài.
- Kiểm thử bổ sung trong scripts/firebase-browser-check.mjs: danh sách dài của bốn mục, màn hình 1280/390 px, lưu và kiểm tra dữ liệu đã lưu, quay lại, thêm mới, lỗi ghi IndexedDB. Tất cả dữ liệu thử nằm trong hồ sơ riêng dưới artifacts/firebase-browser; không sử dụng dữ liệu trình duyệt thường của người dùng.
- Rà soát vận hành tại máy: xác thực/phân quyền, kho dữ liệu, bản nháp, lưu đồng thời và khôi phục được kiểm tra bằng mô phỏng. Đây chưa phải kiểm thử tải nhiều người trên Firebase thật. Cloud vẫn tắt trong cấu hình; cần sao lưu/chuyển dữ liệu, kiểm chứng Rules thực tế và đo số lượt đọc trước khi công bố. Hiện trang người xem nạp các bộ sưu tập dùng chung và tài liệu đính kèm có thể chia thành nhiều phần, nên lượng đọc phụ thuộc số nội dung/kích thước tệp; không suy ra số người phục vụ chỉ từ hạn mức Hosting.

Cập nhật kết nối Firebase ngày 21/10/2026: xem [FIREBASE_HANDOVER.md](./FIREBASE_HANDOVER.md). Xác thực demo đã được thay bằng Firebase; dữ liệu cloud đang chờ kích hoạt theo xác nhận.

# Cập nhật vận hành VRB Creator — 20/10/2026

## Sử dụng quản trị

- Bấm Admin ở đầu trang hoặc chân trang: khu vực quản trị mở trong tab mới. Đăng nhập bằng tài khoản đã bàn giao riêng; giao diện không điền sẵn hay công khai thông tin đăng nhập.
- Nút Đăng xuất luôn nằm trên thanh trên cùng, cả máy tính và điện thoại. Chưa đăng nhập sẽ được chuyển về trang đăng nhập.
- Bấm Xem trang Người dùng hoặc Xem trên website để mở nội dung đã lưu. Riêng thử thách có đường dẫn xem chi tiết trong trang sửa.
- Các tab cùng trình duyệt/cùng địa chỉ website tự cập nhật sau khi lưu. Có thể tải lại trang chính để kiểm tra. Dữ liệu hiện vẫn nằm trong IndexedDB trên máy này; chưa đồng bộ qua máy hoặc trình duyệt khác.

## Chỉnh nội dung

- Thông tin chương trình: tên, mô tả, thời gian, logo, liên kết, liên hệ và ngân sách dự thảo.
- Nội dung giao diện: tìm theo câu hoặc chọn trang để chỉnh các tiêu đề, đoạn giới thiệu, hướng dẫn và nhãn. Khôi phục câu mặc định rồi Lưu nếu cần hoàn tác.
- Các mục Thử thách, FAQ, Giải thưởng, Top cá nhân, Nội dung/Video, Bảng xếp hạng tiếp tục quản lý dữ liệu tương ứng.
- Thể lệ & Điều khoản quản lý cả bốn trang văn bản. Lưu nháp giữ nguyên nội dung, tiêu đề và PDF đang công khai; Công bố áp dụng bản mới.
- PDF: tải lên tối đa 5 MB hoặc nhập liên kết HTTP/HTTPS; có xem/tải, thay và gỡ. Tệp được lưu cùng văn bản sau khi bấm Lưu nháp/Công bố. PDF từ liên kết ngoài có thể mở tab mới theo cách máy chủ đích xử lý tệp.

## Nhập/xuất

- Thanh công cụ mỗi mục có Xuất JSON, Xuất CSV (mở trong Excel), Nhập JSON/CSV.
- Xuất dữ liệu hiện tại làm mẫu. Giữ nguyên mã `id` để cập nhật; dùng mã mới để thêm. Dòng không có trong tệp nhập được giữ nguyên. Với cấu hình chương trình, giữ nguyên mã chương trình.
- Tệp nhập kiểm tra cấu trúc, mã trùng, liên kết, trạng thái và bảng điểm trước khi ghi. Xem số dòng rồi Xác nhận nhập. Hệ thống tải bản sao lưu trước khi nhập.
- Nhập theo nhóm tối đa 25 MB. Sao lưu toàn bộ tối đa 50 MB. Hình ảnh/PDF làm tệp JSON lớn hơn; dùng JSON khi cần giữ toàn bộ tệp đính kèm.
- CSV dùng UTF-8 BOM, hỗ trợ dấu phẩy, xuống dòng và dấu ngoặc kép. Ô dạng công thức được bảo vệ khi xuất. Danh sách lồng nhau trong tệp tổng (như `entries`) dùng JSON trong ô.
- Bảng xếp hạng có thêm xuất danh sách điểm phẳng, tải mẫu và nhập CSV riêng theo kỳ. Sau khi áp dụng danh sách, kiểm tra rồi bấm Lưu để công bố.
- Sao lưu toàn bộ vẫn ở Dữ liệu & Sao lưu. Nhập sao lưu toàn bộ ghi đè dữ liệu sau xác nhận; hệ thống tải bản sao lưu trước khi khôi phục hoặc đặt lại.

## Các sửa lỗi và giới hạn

- Chặn ghi/xóa/nhập tại tầng dịch vụ và dữ liệu nếu chưa đăng nhập; không hiển thị nội dung ẩn/nháp qua đường dẫn chi tiết với người xem.
- Ghim thử thách và lưu dữ liệu trong một giao dịch: lỗi đường dẫn trùng không làm mất ghim cũ. Chỉ báo thành công sau khi giao dịch đã hoàn tất.
- Lọc HTML theo danh sách thẻ/thuộc tính cho phép, gồm cả nội dung trong trình soạn thảo. Có thông báo và lối tải lại nếu dữ liệu hoặc giao diện gặp lỗi.
- Tải riêng từng trang để giảm phần mã tải ban đầu, đặc biệt các trình biên tập admin.
- Đây vẫn là xác thực demo phía trình duyệt. Phải nối Firebase Authentication và thiết lập Firestore Security Rules trước khi đưa vào sử dụng công khai. Ẩn thông tin đăng nhập trên giao diện không thay thế bảo mật phía máy chủ.
- Chưa kết nối Firebase hoặc triển khai hosting trong đợt chỉnh sửa này.

## Kiểm tra

`npm run build` kiểm tra TypeScript và tạo bản phát hành. `npm run lint` kiểm tra mã. Bộ kiểm tra trình duyệt nằm tại `scripts/qa.mjs`, chạy với Playwright và Edge; dùng dữ liệu trong phiên trình duyệt kiểm thử riêng, không sửa dữ liệu người dùng.

## Tối ưu tải nội dung — 25/10/2026

- DataContext áp dụng từng nhóm khi hoàn tất thay vì chờ Promise.all mới hiển thị tất cả. PublicLayout hiển thị trang khi thông tin chương trình sẵn sàng; Admin vẫn chờ đủ dữ liệu trước khi sửa.
- Cache IndexedDB riêng vrb_public_preview_v1, tách theo project, dùng trong 10 phút. Chỉ ghi khi đọc ẩn danh; luôn lọc whitelist bằng publicProjection, loại bản nháp/ẩn và không chứa bài gửi hoặc tài khoản. Bản công khai cũ có thể hiện ngắn trước khi được thay bằng dữ liệu mới; đây không phải cache ngoại tuyến lâu dài. Không dùng dữ liệu mẫu để giả lập dữ liệu cloud thành công.
- Lỗi/quota cache không chặn nội dung thật; callback request cũ không được ghi vào trạng thái tài khoản mới.
- getCloudRecord dùng get một tài liệu thay cho tải tất cả bản ghi/tệp PDF cùng nhóm nếu chưa có cache danh sách.
- npm run test:loading kiểm tra mạng chậm, render trước nhóm phụ, cache công khai, dữ liệu mới thay cache và loại bản nháp bằng trình duyệt cách ly. Không kiểm thử tải production hoặc hứa số mili giây cụ thể.
- Chưa push/deploy bản tối ưu ở thời điểm ghi chú này. .env.local vẫn là cấu hình riêng, không đưa lên Git.

## Đường tải nhanh cho khách mới — 25/10/2026

- api/publicContent.mjs và server/public-content.mjs đọc ẩn danh đúng publicStores của activeGeneration; không dùng service account và không đọc privateStores/submissions/admin_users.
- API nội dung được Vercel CDN cache 15 giây, cache trong tiến trình 15 giây; tách ảnh Base64 thành URL ảnh theo revision. Ảnh không còn làm phình JSON văn bản. Mỗi store là một request độc lập. Không cache phản hồi lỗi.
- Production public pages dùng API trước cả khi Firebase Auth ready; không mở listener Firestore cho trang công khai. Refresh khi tab đang hiển thị mỗi 30 giây. Admin giữ Firebase riêng và thấy thay đổi tức thời theo cơ chế hiện hành; khách có thể thấy cập nhật trễ khoảng một phút cộng thời gian mạng.
- Nếu API lỗi, quay về đường Firebase hiện hành. Phần tối ưu cache trình duyệt/hiện theo nhóm bổ trợ vẫn giữ; đây không phải cách duy nhất tăng tốc.
- Card ảnh dùng lazy loading và giải mã bất đồng bộ.
- npm run test:public-content: public-only REST, dữ liệu chia phần, tách ảnh, ID/revision, loại draft, cache/TTL và lỗi không cache. npm run test:first-visit: profile mới, giữ Auth pending, trang chủ vẫn hiện qua public API và không gọi Firestore.
- Đo backend chỉ đọc thật: program_info JSON 1045 bytes, featured_contents 2256 bytes, featured_individuals 2898 bytes, tổng 6199 bytes; warm process ~0–1ms, cold đọc từng nhóm ~443–604ms trên máy kiểm tra. Không coi đây là thời gian tải production/trình duyệt hoặc cam kết SLA.
- Chưa đẩy lên GitHub hoặc deploy bản tối ưu tại thời điểm ghi chú.
