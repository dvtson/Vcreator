import {
  ProgramInfo,
  Challenge,
  PageDocument,
  FaqItem,
  AwardItem,
  FeaturedIndividual,
  FeaturedContent,
  LeaderboardPeriod
} from '../types';

export const initialProgramInfo: ProgramInfo = {
  id: 'vrb-creator-2026',
  title: 'VRB CREATOR',
  subTitle: 'Chiến dịch truyền thông nội bộ Sales Bán lẻ VRB 2026',
  slogan: 'Sáng tạo mỗi ngày – Lan tỏa cùng VRB',
  startDate: '2026-11-01',
  endDate: '2026-12-31',
  heroDescription: 'Chương trình truyền thông bùng nổ dành riêng cho đội ngũ Sales bán lẻ và Sales Leader VRB. Cùng kiến tạo những nội dung số sáng tạo, lan tỏa hình ảnh thương hiệu Ngân hàng Liên doanh Việt - Nga và chinh phục hệ thống giải thưởng hấp dẫn.',
  logoUrl: '/assets/vrb-logo.png',
  bannerUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1600&q=80',
  submissionFormUrl: 'https://forms.gle/vrb-creator-submission-demo',
  isSubmissionActive: true,
  zaloGroupUrl: 'https://zalo.me/g/vrb-creator-hub',
  isZaloActive: true,
  hotline: '',
  supportEmail: '',
  supportContact: '',
  updatedAt: '2026-10-15T12:00:00Z',
};

export const initialChallenges: Challenge[] = [
  {
    id: 'c1',
    slug: 'len-song-la-co-co-hoi',
    title: 'Lên sóng là có cơ hội',
    date: '2026-11-02',
    month: 11,
    bannerUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Thử thách khởi động: Đăng tải bài viết hoặc video ngắn đầu tiên giới thiệu về tinh thần làm việc tại VRB.',
    description: '<p>Chào mừng bạn đến với chặng mở màn của <strong>VRB CREATOR</strong>! Thử thách tuần 1 là cơ hội để mỗi Sales bán lẻ tự tin xuất hiện trên mạng xã hội với hình ảnh chuyên nghiệp, năng động và tận tâm của người cán bộ ngân hàng VRB.</p><p>Chỉ cần bạn bắt đầu "lên sóng", bạn đã nắm trong tay cơ hội rinh ngay giải thưởng tuần đầu tiên!</p>',
    requirements: 'Đăng tải tối thiểu 01 bài viết kèm hình ảnh hoặc 01 video ngắn (Reel/TikTok/Short) giới thiệu bản thân hoặc một ngày làm việc tràn đầy năng lượng tại chi nhánh VRB.',
    applicableProducts: 'Hình ảnh thương hiệu cá nhân Sales, dịch vụ ngân hàng bán lẻ VRB chung',
    applicableFormat: 'Bài viết kèm ảnh chân dung/làm việc hoặc Video ngắn dưới 60 giây',
    officialHashtags: '#VRBCreator #LenSongLaCoCoHoi #VRBBanking #SalesNangDong',
    validConditions: 'Bài đăng ở chế độ Công khai (Public), gắn đúng hashtag chính thức, đăng trong khung thời gian tuần phát động và nộp link qua biểu mẫu trước 23h59 Chủ nhật.',
    prizeStructure: '01 Giải Nhất tuần: 1.000.000 VNĐ | 02 Giải Khuyến khích: 500.000 VNĐ/giải',
    submissionGuide: '1. Đăng bài lên Facebook/TikTok cá nhân.<br>2. Sao chép liên kết bài đăng.<br>3. Nhấn nút "Gửi bài dự thi" bên dưới và điền mã cán bộ.',
    submissionFormUrl: 'https://forms.gle/vrb-creator-submission-demo',
    status: 'published',
    isFeaturedHome: true,
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'c2',
    slug: 'anh-show-loi-ich-bai-hut-quan-tam',
    title: 'Ảnh “show” lợi ích – Bài hút quan tâm',
    date: '2026-11-09',
    month: 11,
    bannerUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Thiết kế hoặc chụp ảnh làm nổi bật ngay lợi ích then chốt của các gói gửi tiết kiệm hoặc tài khoản thanh toán VRB.',
    description: '<p>Khách hàng quan tâm nhất đến: <em>Họ nhận được gì?</em> Tuần này, hãy sáng tạo những ấn phẩm hình ảnh trực quan, đánh trúng nhu cầu tài chính và lợi ích vượt trội từ sản phẩm VRB.</p>',
    requirements: 'Bộ ảnh từ 1 - 4 ảnh hoặc ảnh Infographic ngắn gọn, rõ ràng về lãi suất tiết kiệm, ưu đãi biểu phí tài khoản số đẹp hoặc hoàn tiền.',
    applicableProducts: 'Tiền gửi Tiết kiệm VRB, Tài khoản số đẹp, Gói tài khoản thanh toán',
    applicableFormat: 'Hình ảnh đơn hoặc Album ảnh kèm bài viết phân tích lợi ích',
    officialHashtags: '#VRBCreator #ShowLoiIch #TietKiemVRB #LaiSuatHapDan',
    validConditions: 'Số liệu lãi suất và ưu đãi phải chính xác theo biểu phí hiện hành của VRB, không gây hiểu nhầm cho khách hàng.',
    prizeStructure: '01 Giải Sáng tạo hình ảnh: 1.000.000 VNĐ | 02 Giải Bài viết chạm: 500.000 VNĐ/giải',
    submissionGuide: 'Gửi link bài viết Facebook hoặc LinkedIn kèm ảnh chụp màn hình tương tác thực tế.',
    status: 'published',
    isFeaturedHome: false,
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'c3',
    slug: '15-giay-cham-nhu-cau',
    title: '15 giây chạm nhu cầu',
    date: '2026-11-16',
    month: 11,
    bannerUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Sản xuất video ngắn (Reel/TikTok) không quá 15 - 30 giây giải quyết nhanh một băn khoăn tài chính của khách hàng.',
    description: '<p>Tập trung vào yếu tố "giữ chân người xem trong 3 giây đầu tiên". Nêu bật giải pháp tài chính của VRB để giải quyết nỗi đau của khách hàng một cách ngắn gọn, súc tích và cuốn hút.</p>',
    requirements: '01 Video ngắn dọc (9:16) thời lượng từ 15 đến 45 giây, âm thanh rõ nét, phụ đề sinh động.',
    applicableProducts: 'Vay tiêu dùng, Mở thẻ tín dụng online, Chuyển tiền quốc tế Việt - Nga',
    applicableFormat: 'TikTok, Facebook Reel, YouTube Shorts',
    officialHashtags: '#VRBCreator #15GiayChamNhuCau #VayTieuDungVRB #Shorts',
    validConditions: 'Video tự quay hoặc tự biên tập, sử dụng âm nhạc không vi phạm bản quyền thương mại.',
    prizeStructure: '01 Giải Video Triệu View: 1.000.000 VNĐ | 02 Giải Viral: 500.000 VNĐ/giải',
    submissionGuide: 'Nộp link bài đăng video trên TikTok hoặc Facebook Reel.',
    status: 'published',
    isFeaturedHome: false,
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'c4',
    slug: 'ke-chuyen-de-ket-noi',
    title: 'Kể chuyện để kết nối',
    date: '2026-11-23',
    month: 11,
    bannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Chia sẻ câu chuyện thật về một kỷ niệm hỗ trợ khách hàng vượt qua khó khăn tài chính hoặc đạt được mục tiêu lớn.',
    description: '<p>Bán hàng bằng sự chân thành là con đường bền vững nhất. Hãy chia sẻ câu chuyện người thật việc thật: Một người mua nhà lần đầu, một doanh chủ vay vốn sản xuất, hoặc sự đồng hành của bạn cùng khách hàng thân thiết tại VRB.</p>',
    requirements: 'Bài viết dạng Storytelling sâu sắc, hình ảnh chân thực (có sự đồng ý của khách hàng hoặc ẩn thông tin nhạy cảm).',
    applicableProducts: 'Cho vay mua nhà, vay sản xuất kinh doanh, dịch vụ Khách hàng VIP',
    applicableFormat: 'Bài viết dài (Long-form post) kèm ảnh chụp thực tế hoặc video phỏng vấn ngắn',
    officialHashtags: '#VRBCreator #KeChuyenDeKetNoi #DongHanhCungVRB #NguoiVRB',
    validConditions: 'Tuyệt đối bảo mật thông tin cá nhân/số dư/tài khoản khách hàng theo quy định an toàn ngân hàng.',
    prizeStructure: '01 Giải Câu chuyện truyền cảm hứng: 1.000.000 VNĐ | 02 Giải Tri ân: 500.000 VNĐ/giải',
    submissionGuide: 'Nộp đường link bài đăng trên trang cá nhân.',
    status: 'published',
    isFeaturedHome: false,
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'c5',
    slug: 'khach-hoi-sales-dap',
    title: 'Khách hỏi, Sales đáp',
    date: '2026-11-30',
    month: 11,
    bannerUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Giải đáp những thắc mắc phổ biến nhất của khách hàng về sản phẩm, dịch vụ và thủ tục tại VRB.',
    description: '<p>Đóng vai trò chuyên gia tư vấn tận tâm. Hãy tổng hợp 3 - 5 câu hỏi mà bạn nhận được nhiều nhất từ khách hàng và giải đáp một cách dễ hiểu nhất.</p>',
    requirements: 'Bài viết dạng Q&A, Infographic hỏi đáp hoặc Clip đóng vai tình huống giải đáp thắc mắc tài chính.',
    applicableProducts: 'Thủ tục mở thẻ, Điều kiện vay vốn, Quy trình thanh toán song phương',
    applicableFormat: 'Video Q&A, Carousel ảnh hỏi đáp hoặc Post Facebook',
    officialHashtags: '#VRBCreator #KhachHoiSalesDap #ChuyenGiaTaiChinhVRB #HoiDapVRB',
    validConditions: 'Câu trả lời tuân thủ đúng quy trình nghiệp vụ hiện hành của VRB.',
    prizeStructure: '01 Giải Chuyên gia tư vấn: 1.000.000 VNĐ | 02 Giải Giải đáp xuất sắc: 500.000 VNĐ/giải',
    submissionGuide: 'Gửi link bài đăng qua biểu mẫu tiếp nhận.',
    status: 'published',
    isFeaturedHome: false,
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'c6',
    slug: 'len-song-cham-nhu-cau',
    title: 'Lên sóng, chạm nhu cầu',
    date: '2026-12-07',
    month: 12,
    bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Tăng tốc tháng cuối năm: Đưa ra giải pháp tài chính mùa lễ hội, chi tiêu thông minh cùng thẻ VRB.',
    description: '<p>Tháng 12 là thời điểm vàng của chi tiêu, mua sắm và hoàn thành các mục tiêu năm. Hãy cùng VRB đón đầu nhu cầu tiêu dùng và mang lại giải pháp tài chính thông minh cho mọi gia đình.</p>',
    requirements: 'Nội dung hướng đến các chương trình ưu đãi mùa cuối năm, mua sắm qua thẻ tín dụng và tích lũy đầu tư.',
    applicableProducts: 'Thẻ tín dụng VRB Visa, Ưu đãi thanh toán mua sắm, Tiết kiệm tích lũy',
    applicableFormat: 'Video trải nghiệm thực tế, bài review ưu đãi',
    officialHashtags: '#VRBCreator #LenSongChamNhuCau #ChiTieuThongMinh #MuaSamCuoiNam',
    validConditions: 'Nội dung tươi vui, mang không khí mùa lễ hội cuối năm.',
    prizeStructure: '01 Giải Nhất tuần: 1.000.000 VNĐ | 02 Giải Khuyến khích: 500.000 VNĐ/giải',
    submissionGuide: 'Nộp bài qua link đăng ký chính thức.',
    status: 'published',
    isFeaturedHome: false,
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'c7',
    slug: 'chi-tung-buoc-giup-khach-de-lam',
    title: 'Chỉ từng bước, giúp khách dễ làm',
    date: '2026-12-14',
    month: 12,
    bannerUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Hướng dẫn cụ thể cách sử dụng ứng dụng VRB Mobile Banking hoặc đăng ký dịch vụ số nhanh chóng.',
    description: '<p>Một video hướng dẫn chi tiết từng thao tác trên ứng dụng di động sẽ giúp khách hàng lớn tuổi hoặc bận rộn dễ dàng trải nghiệm dịch vụ ngân hàng số của VRB.</p>',
    requirements: 'Video quay màn hình thao tác kèm lồng tiếng hướng dẫn hoặc chuỗi ảnh chỉ dẫn từng bước rõ ràng.',
    applicableProducts: 'VRB Mobile Banking, Kích hoạt sinh trắc học, Chuyển khoản QR 24/7',
    applicableFormat: 'Screen recording video hoặc Tutorial post',
    officialHashtags: '#VRBCreator #ChiTungBuoc #NganHangSoVRB #MobileBanking',
    validConditions: 'Che mờ các thông tin nhạy cảm như mã OTP, số dư thực tế trong clip hướng dẫn.',
    prizeStructure: '01 Giải Hướng dẫn tận tâm: 1.000.000 VNĐ | 02 Giải Trực quan: 500.000 VNĐ/giải',
    submissionGuide: 'Nộp link bài qua hệ thống tiếp nhận.',
    status: 'published',
    isFeaturedHome: false,
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'c8',
    slug: 'phu-song-da-kenh',
    title: 'Phủ sóng đa kênh',
    date: '2026-12-21',
    month: 12,
    bannerUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Chặng về đích: Phủ sóng thông điệp VRB đồng loạt trên Facebook, TikTok, Zalo cá nhân để bứt phá bảng xếp hạng.',
    description: '<p>Chặng đua nước rút cuối cùng của năm 2026! Hãy huy động toàn bộ sức mạnh sáng tạo để đưa hình ảnh VRB lan tỏa khắp các nền tảng mạng xã hội, khẳng định vị thế Sales Bán lẻ hàng đầu.</p>',
    requirements: 'Đăng tải nội dung đồng thời trên ít nhất 02 nền tảng khác nhau (Ví dụ: Facebook + TikTok, hoặc Facebook + Zalo).',
    applicableProducts: 'Toàn bộ sản phẩm bán lẻ VRB và thông điệp chào đón năm mới 2027',
    applicableFormat: 'Đa định dạng: Video, Ảnh, Bài viết tổng kết chặng đua',
    officialHashtags: '#VRBCreator #PhuSongDaKenh #VeDich2026 #VRBBanLe',
    validConditions: 'Cung cấp đầy đủ các đường dẫn đã đăng tải trên các kênh.',
    prizeStructure: '01 Giải Đa kênh xuất sắc: 1.500.000 VNĐ | 03 Giải Lan tỏa mạnh mẽ: 500.000 VNĐ/giải',
    submissionGuide: 'Gửi tổng hợp các link trong một lần nộp biểu mẫu.',
    status: 'published',
    isFeaturedHome: false,
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-15T08:00:00Z',
  },
];

export const initialFeaturedIndividuals: FeaturedIndividual[] = [
  {
    id: 'ind-1',
    fullName: 'Nguyễn Mai Anh',
    branch: 'VRB Sở Giao Dịch',
    roleTitle: 'Chuyên viên QHKH Bán lẻ',
    achievementSummary: 'Đạt hơn 50.000 lượt tương tác tự nhiên với chuỗi video tư vấn tiết kiệm thông minh.',
    quote: 'Sáng tạo nội dung không khó khi ta đặt trọn tâm huyết vào việc thấu hiểu mong muốn tài chính của khách hàng.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    order: 1,
    externalLink: 'https://www.facebook.com',
    status: 'published',
  },
  {
    id: 'ind-2',
    fullName: 'Lê Hoàng Nam',
    branch: 'VRB Chi nhánh TP. Hồ Chí Minh',
    roleTitle: 'Trưởng nhóm Bán lẻ',
    achievementSummary: 'Dẫn đầu lượng khách hàng đăng ký mở gói tài khoản số đẹp qua kênh TikTok cá nhân.',
    quote: 'Mỗi video là một nhịp cầu đưa dịch vụ ngân hàng số VRB đến gần hơn với giới trẻ năng động.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    order: 2,
    externalLink: 'https://www.tiktok.com',
    status: 'published',
  },
  {
    id: 'ind-3',
    fullName: 'Phạm Thanh Hằng',
    branch: 'VRB Chi nhánh Đà Nẵng',
    roleTitle: 'Chuyên viên Tín dụng',
    achievementSummary: 'Tác giả bài viết đạt giải Nhất thử thách Kể chuyện để kết nối tuần 4.',
    quote: 'Kể câu chuyện có thật về khách hàng giúp xây dựng niềm tin vững chắc và dài lâu.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    order: 3,
    externalLink: 'https://www.facebook.com',
    status: 'published',
  },
  {
    id: 'ind-4',
    fullName: 'Vũ Đức Cường',
    branch: 'VRB Chi nhánh Hải Phòng',
    roleTitle: 'Chuyên viên Phát triển Khách hàng',
    achievementSummary: 'Xuất sắc đạt 100% chỉ tiêu giải ngân nhờ kết hợp tư vấn trực tiếp và phủ sóng đa kênh.',
    quote: 'Khách hàng có ở đâu trên mạng xã hội, Sales VRB sẽ hiện diện ở đó để hỗ trợ tức thì.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    order: 4,
    status: 'published',
  },
  {
    id: 'ind-5',
    fullName: 'Hoàng Thu Trang',
    branch: 'VRB Chi nhánh Khánh Hòa',
    roleTitle: 'Chuyên viên Khách hàng Cá nhân',
    achievementSummary: 'Top 1 tương tác chi nhánh Miền Trung với các clip hướng dẫn sinh trắc học cực kỳ trực quan.',
    quote: 'Đơn giản hóa thủ tục ngân hàng cho khách hàng chính là niềm vui lớn nhất của người làm nghề.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    order: 5,
    status: 'published',
  },
];

export const initialFeaturedContents: FeaturedContent[] = [
  {
    id: 'video-1',
    title: 'VRB Mobile Banking - Chuyển tiền siêu tốc, tiện ích trong tầm tay',
    authorName: 'Nguyễn Thu Hà',
    branch: 'VRB Chi nhánh Hà Nội',
    platform: 'facebook',
    contentType: 'video',
    originalUrl: 'https://www.facebook.com/reel/1448880283937555',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Video ngắn trải nghiệm tính năng chuyển tiền 24/7 và thanh toán hóa đơn siêu nhanh qua VRB Mobile Banking.',
    relatedChallengeSlug: '15-giay-cham-nhu-cau',
    order: 1,
    status: 'published',
    note: 'Bài dự thi minh họa Facebook Reel',
    createdAt: '2026-11-03T10:00:00Z',
  },
  {
    id: 'video-2',
    title: 'Gói vay tiêu dùng lãi suất ưu đãi cùng Sales VRB',
    authorName: 'Trần Minh Đức',
    branch: 'VRB Chi nhánh TP. Hồ Chí Minh',
    platform: 'tiktok',
    contentType: 'video',
    originalUrl: 'https://www.tiktok.com/@/video/7620113351552601351',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Mẹo chuẩn bị hồ sơ vay tiêu dùng giải ngân trong 24 giờ tại Ngân hàng Liên doanh Việt - Nga.',
    relatedChallengeSlug: 'khach-hoi-sales-dap',
    order: 2,
    status: 'published',
    isMissingAccountNotice: true,
    note: 'Lưu ý kiểm tra link: URL TikTok này thiếu tên tài khoản cụ thể trong phần @/. Admin có thể cập nhật lại URL chính xác.',
    createdAt: '2026-11-10T14:30:00Z',
  },
  {
    id: 'video-3',
    title: 'Bật mí bí kíp mở thẻ tín dụng VRB Visa trong 5 phút',
    authorName: 'Bùi Thùy Linh',
    branch: 'VRB Chi nhánh Đà Nẵng',
    platform: 'tiktok',
    contentType: 'video',
    originalUrl: 'https://www.tiktok.com/@bthuylinh/video/7621593210179112213',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Hướng dẫn chi tiết mở thẻ tín dụng quốc tế VRB Visa nhận ngay hoàn tiền và miễn phí thường niên.',
    relatedChallengeSlug: 'chi-tung-buoc-giup-khach-de-lam',
    order: 3,
    status: 'published',
    note: 'Video minh họa trên kênh cá nhân @bthuylinh',
    createdAt: '2026-11-17T09:15:00Z',
  },
];

export const initialAwardItems: AwardItem[] = [
  // Nhóm 1: Thử thách thứ Hai (Weekly)
  {
    id: 'aw-1',
    group: 'monday',
    groupName: 'Thử thách Thứ Hai',
    title: 'Giải Nhất Thử Thách Tuần',
    periodDescription: 'Xét thưởng hàng tuần (8 tuần liên tiếp trong tháng 11 & 12/2026)',
    prizeQuantity: '01 giải / tuần (Tổng 08 giải)',
    rewardValue: '1.000.000 VNĐ / giải',
    totalEstimated: 8000000,
    evaluationCriteria: 'Bài thi có nội dung xuất sắc nhất, đúng chủ đề tuần và đạt tương tác tự nhiên tích cực.',
    order: 1,
    status: 'published',
  },
  {
    id: 'aw-2',
    group: 'monday',
    groupName: 'Thử thách Thứ Hai',
    title: 'Giải Khuyến Khích / Sáng Tạo Tuần',
    periodDescription: 'Xét thưởng hàng tuần (8 tuần liên tiếp)',
    prizeQuantity: '02 giải / tuần (Tổng 16 giải)',
    rewardValue: '500.000 VNĐ / giải',
    totalEstimated: 8000000,
    evaluationCriteria: 'Ý tưởng trình bày sáng tạo, hình ảnh/video trực quan, gắn đúng hashtag quy định.',
    order: 2,
    status: 'published',
  },
  // Nhóm 2: Giải nửa tháng (Bi-weekly)
  {
    id: 'aw-3',
    group: 'biweekly',
    groupName: 'Giải Nửa Tháng',
    title: 'Gương Mặt Lan Tỏa Bán Lẻ',
    periodDescription: 'Xét 2 tuần/lần (4 đợt trong suốt chiến dịch)',
    prizeQuantity: '02 giải / đợt (Tổng 08 giải)',
    rewardValue: '2.000.000 VNĐ / giải',
    totalEstimated: 16000000,
    evaluationCriteria: 'Cá nhân có tổng điểm tương tác và số lượng bài dự thi chất lượng cao nhất trong kỳ 15 ngày.',
    order: 3,
    status: 'published',
  },
  {
    id: 'aw-4',
    group: 'biweekly',
    groupName: 'Giải Nửa Tháng',
    title: 'Video Viral Của Kỳ',
    periodDescription: 'Xét 2 tuần/lần (4 đợt)',
    prizeQuantity: '01 giải / đợt (Tổng 04 giải)',
    rewardValue: '1.500.000 VNĐ / giải',
    totalEstimated: 6000000,
    evaluationCriteria: 'Video có lượt xem và chia sẻ cao nhất trên nền tảng TikTok / Facebook Reel.',
    order: 4,
    status: 'published',
  },
  // Nhóm 3: Giải tổng kết (Grand Finale)
  {
    id: 'aw-5',
    group: 'grand',
    groupName: 'Giải Tổng Kết',
    title: 'VRB Creator Champion (Quán Quân Cá Nhân)',
    periodDescription: 'Tổng kết toàn chiến dịch (Công bố vào tháng 01/2027)',
    prizeQuantity: '01 Giải Nhất toàn quốc',
    rewardValue: '10.000.000 VNĐ + Cúp lưu niệm',
    totalEstimated: 10000000,
    evaluationCriteria: 'Cá nhân có tổng điểm tích lũy dẫn đầu toàn quốc qua tất cả các chặng thử thách.',
    order: 5,
    status: 'published',
  },
  {
    id: 'aw-6',
    group: 'grand',
    groupName: 'Giải Tổng Kết',
    title: 'VRB Creator Á Quân Cá Nhân',
    periodDescription: 'Tổng kết toàn chiến dịch',
    prizeQuantity: '02 Giải Nhì toàn quốc',
    rewardValue: '5.000.000 VNĐ / giải',
    totalEstimated: 10000000,
    evaluationCriteria: 'Cá nhân xếp vị trí thứ 2 và thứ 3 trên bảng tổng sắp điểm số.',
    order: 6,
    status: 'published',
  },
  {
    id: 'aw-7',
    group: 'grand',
    groupName: 'Giải Tổng Kết',
    title: 'VRB Creator Quý Quân Cá Nhân',
    periodDescription: 'Tổng kết toàn chiến dịch',
    prizeQuantity: '03 Giải Ba toàn quốc',
    rewardValue: '3.000.000 VNĐ / giải',
    totalEstimated: 9000000,
    evaluationCriteria: 'Cá nhân xếp hạng 4, 5, 6 chung cuộc.',
    order: 7,
    status: 'published',
  },
  {
    id: 'aw-8',
    group: 'grand',
    groupName: 'Giải Tổng Kết',
    title: 'Chi Nhánh VRB Bứt Phá Sáng Tạo (Giải Tập Thể)',
    periodDescription: 'Tổng kết toàn chiến dịch',
    prizeQuantity: '01 Giải Nhất Tập Thể',
    rewardValue: '15.000.000 VNĐ + Cờ thi đua',
    totalEstimated: 15000000,
    evaluationCriteria: 'Đơn vị có tỷ lệ CBNV tham gia cao nhất và tổng điểm phong trào dẫn đầu toàn hệ thống.',
    order: 8,
    status: 'published',
  },
  {
    id: 'aw-9',
    group: 'grand',
    groupName: 'Giải Tổng Kết',
    title: 'Chi Nhánh Năng Động (Giải Tập Thể)',
    periodDescription: 'Tổng kết toàn chiến dịch',
    prizeQuantity: '01 Giải Nhì Tập Thể',
    rewardValue: '4.000.000 VNĐ',
    totalEstimated: 4000000,
    evaluationCriteria: 'Đơn vị xếp hạng nhì tập thể toàn hệ thống.',
    order: 9,
    status: 'published',
  },
];

export const initialPageDocuments: PageDocument[] = [
  {
    id: 'chuong-trinh',
    title: 'Giới thiệu Chương trình VRB CREATOR 2026',
    versionName: 'Bản Dự Thảo Chính Thức v1.0',
    updatedDate: '15/10/2026',
    isPublished: true,
    contentHtml: `
      <h2>1. Mục tiêu chương trình</h2>
      <p>Chương trình <strong>VRB CREATOR: Sáng tạo mỗi ngày – Lan tỏa cùng VRB</strong> được tổ chức nhằm xây dựng văn hóa truyền thông số chủ động cho toàn thể cán bộ nhân viên Khối Bán lẻ VRB, nâng cao năng lực sản xuất nội dung số phục vụ bán hàng, đồng thời quảng bá mạnh mẽ các sản phẩm dịch vụ của Ngân hàng Liên doanh Việt - Nga trên các nền tảng mạng xã hội.</p>

      <h2>2. Thời gian triển khai</h2>
      <p>Chiến dịch diễn ra từ ngày <strong>01/11/2026</strong> đến hết ngày <strong>31/12/2026</strong> trên quy mô toàn hệ thống VRB.</p>

      <h2>3. Đối tượng tham gia</h2>
      <ul>
        <li>Chuyên viên Quản lý Khách hàng Bán lẻ (RM Bán lẻ).</li>
        <li>Chuyên viên Tư vấn Tài chính, Tín dụng cá nhân, Phát triển kinh doanh tại các Chi nhánh và Phòng Giao dịch VRB.</li>
        <li>Sales Leader, Trưởng/Phó phòng Bán lẻ tại các Đơn vị trực thuộc VRB.</li>
      </ul>

      <h2>4. Sản phẩm & Dịch vụ trọng tâm</h2>
      <p>Các nội dung dự thi tập trung vào việc giới thiệu và làm nổi bật các sản phẩm bán lẻ thế mạnh của VRB:</p>
      <ul>
        <li>Tiền gửi tiết kiệm với lãi suất cạnh tranh và kỳ hạn linh hoạt.</li>
        <li>Gói vay mua nhà, vay tiêu dùng, vay sản xuất kinh doanh với thủ tục tinh gọn.</li>
        <li>Tài khoản thanh toán số đẹp, thẻ ghi nợ quốc tế và thẻ tín dụng VRB Visa.</li>
        <li>Ứng dụng ngân hàng số VRB Mobile Banking với nhiều tiện ích 24/7.</li>
        <li>Kênh thanh toán song phương đặc thù Việt - Nga.</li>
      </ul>

      <h2>5. Kênh truyền thông áp dụng</h2>
      <p>Khuyến khích CBNV sáng tạo trên các kênh mạng xã hội cá nhân:</p>
      <ul>
        <li><strong>Facebook:</strong> Bài viết cá nhân, Album ảnh, Facebook Reel, Story.</li>
        <li><strong>TikTok:</strong> Video ngắn từ 15 đến 60 giây.</li>
        <li><strong>YouTube Shorts / LinkedIn / Zalo:</strong> Các bài đăng nghiệp vụ chuyên nghiệp.</li>
      </ul>

      <h2>6. Cơ chế lựa chọn đăng lại trên kênh chính thức của VRB</h2>
      <p>Những bài viết, hình ảnh và video có tính sáng tạo cao, tuân thủ đúng chuẩn nhận diện thương hiệu VRB và thu hút tương tác tốt sẽ được Ban Truyền thông VRB chọn lọc để biên tập, đăng tải lại trên Fanpage chính thức, Kênh TikTok hoặc Website của Ngân hàng, đồng thời được tính điểm thưởng cộng dồn cho tác giả.</p>
    `,
  },
  {
    id: 'the-le',
    title: 'Thể lệ Chương trình VRB CREATOR',
    versionName: 'Quy chế Ban hành v1.1',
    updatedDate: '15/10/2026',
    isPublished: true,
    pdfAttachmentName: 'Quy_che_VRB_Creator_2026_DuThao.pdf',
    contentHtml: `
      <h2>Chương I: Quy định chung</h2>
      <p>1. Chương trình VRB CREATOR là sân chơi nghiệp vụ và truyền thông nội bộ lành mạnh, minh bạch, công bằng dành riêng cho CBNV Khối Bán lẻ VRB.</p>
      <p>2. Mọi bài dự thi phải do chính CBNV trực tiếp sáng tạo, ghi hình, biên tập hoặc đóng vai trò nhân vật chính trong nội dung.</p>

      <h2>Chương II: Tiêu chuẩn nội dung và hình ảnh</h2>
      <ul>
        <li>Trang phục lịch sự, chuyên nghiệp (khuyến khích mặc đồng phục VRB hoặc thẻ đeo ngân hàng khi quay video/chụp ảnh).</li>
        <li>Thông tin về sản phẩm, lãi suất, phí dịch vụ phải căn cứ chính xác theo văn bản quy định hiện hành của VRB.</li>
        <li>Không đưa ra những cam kết vượt quá thẩm quyền hoặc gây hiểu lầm cho khách hàng.</li>
        <li>Tất cả bài đăng dự thi phải để ở chế độ <strong>Công khai (Public)</strong> và có gắn đủ bộ hashtag chính thức của chương trình cùng hashtag thử thách tuần.</li>
      </ul>

      <h2>Chương III: Quy trình gửi bài và xét giải</h2>
      <p><strong>Bước 1:</strong> Đăng tải nội dung lên mạng xã hội cá nhân.</p>
      <p><strong>Bước 2:</strong> Sao chép đường link bài đăng và truy cập vào biểu mẫu tiếp nhận bài thi của chương trình trước thời hạn đóng nhận bài mỗi tuần.</p>
      <p><strong>Bước 3:</strong> Hội đồng thẩm định VRB chấm điểm và công bố kết quả vào Thứ Tư tuần kế tiếp.</p>

      <h2>Chương IV: Tiêu chí chấm điểm và xếp hạng</h2>
      <table>
        <thead>
          <tr>
            <th>Tiêu chí</th>
            <th>Tỷ trọng</th>
            <th>Mô tả chi tiết</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nội dung & Sáng tạo</td>
            <td>40%</td>
            <td>Đúng chủ đề, thông điệp rõ ràng, ý tưởng mới lạ, giải quyết đúng nhu cầu khách hàng.</td>
          </tr>
          <tr>
            <td>Hình thức & Nhận diện</td>
            <td>30%</td>
            <td>Chất lượng hình ảnh/âm thanh sắc nét, trang phục chỉn chu, logo VRB đúng chuẩn.</td>
          </tr>
          <tr>
            <td>Tương tác thực tế</td>
            <td>30%</td>
            <td>Lượt xem, thích, bình luận và chia sẻ tự nhiên từ cộng đồng mạng.</td>
          </tr>
        </tbody>
      </table>
    `,
  },
  {
    id: 'dieu-khoan',
    title: 'Điều khoản & Điều kiện Pháp lý',
    versionName: 'Điều khoản Pháp chế v1.0',
    updatedDate: '15/10/2026',
    isPublished: true,
    contentHtml: `
      <h2>1. Bảo mật thông tin khách hàng</h2>
      <p>CBNV tham gia chương trình tuyệt đối <strong>KHÔNG</strong> làm lộ bất kỳ thông tin cá nhân nào của khách hàng (họ tên đầy đủ, số điện thoại, địa chỉ, số CMND/CCCD, số tài khoản, số dư, sao kê giao dịch...) khi chưa có văn bản chấp thuận rõ ràng của khách hàng.</p>
      <p>Đối với các video hướng dẫn thao tác ứng dụng hoặc câu chuyện thực tế, phải làm mờ hoàn toàn các thông tin bảo mật và mã OTP giao dịch.</p>

      <h2>2. Bản quyền hình ảnh & Nội dung</h2>
      <p>Bằng việc nộp bài dự thi, người tham gia đồng ý cho phép Ngân hàng Liên doanh Việt - Nga (VRB) được quyền sử dụng hình ảnh, âm thanh, video clip và bài viết dự thi vào mục đích truyền thông, quảng bá thương hiệu VRB phi thương mại trên các phương tiện thông tin đại chúng mà không phải trả thêm bất kỳ chi phí phát sinh nào.</p>

      <h2>3. Hành vi nghiêm cấm</h2>
      <ul>
        <li>Sử dụng các công cụ tăng tương tác ảo (buff view, hack like, bot chia sẻ trái phép). Khi phát hiện, bài thi sẽ bị hủy kết quả ngay lập tức.</li>
        <li>Đăng tải các nội dung có yếu tố kích động, chính trị, tôn giáo, phản cảm hoặc vi phạm pháp luật và đạo đức nghề nghiệp ngân hàng.</li>
        <li>So sánh trực tiếp tiêu cực hoặc bôi nhọ sản phẩm của các tổ chức tín dụng khác trên thị trường.</li>
      </ul>

      <h2>4. Giải quyết khiếu nại</h2>
      <p>Quyết định cuối cùng của Ban Giám đốc và Ban Tổ chức chương trình VRB CREATOR là quyết định cao nhất và có hiệu lực thi hành.</p>
    `,
  },
  {
    id: 'huong-dan',
    title: 'Hướng dẫn tham gia & Nộp bài thi',
    versionName: 'Hướng dẫn CBNV v1.0',
    updatedDate: '15/10/2026',
    isPublished: true,
    contentHtml: `
      <h2>Quy trình 4 bước đơn giản để tham gia</h2>
      <ol>
        <li>
          <strong>Bước 1: Nhận đề bài thử thách Thứ Hai</strong>
          <p>Vào 08h00 mỗi sáng Thứ Hai, đề bài thử thách tuần mới sẽ được công bố trên website VRB CREATOR và nhóm Zalo nội bộ.</p>
        </li>
        <li>
          <strong>Bước 2: Sáng tạo và biên tập nội dung</strong>
          <p>Lên kịch bản, quay video ngắn hoặc chụp ảnh thực tế. Bạn có thể sử dụng các ứng dụng phổ biến như CapCut, Canva để biên tập.</p>
        </li>
        <li>
          <strong>Bước 3: Đăng tải kèm hashtag quy định</strong>
          <p>Đăng lên Facebook/TikTok cá nhân ở chế độ Công khai. Đừng quên copy đúng cụm hashtag quy định của tuần.</p>
        </li>
        <li>
          <strong>Bước 4: Nộp link bài dự thi</strong>
          <p>Nhấp vào nút "Gửi bài dự thi" trên website hoặc liên kết biểu mẫu được ghim trên nhóm Zalo để nộp link trước thời hạn quy định.</p>
        </li>
      </ol>

      <h2>Mẹo tăng tương tác cho bài thi</h2>
      <ul>
        <li>Chọn khung giờ vàng đăng bài: 11h30 - 13h00 (trưa) hoặc 20h00 - 21h30 (tối).</li>
        <li>Sử dụng nhạc nền đang thịnh hành (trending) trên TikTok/Reel với âm lượng vừa phải.</li>
        <li>Tích cực phản hồi tất cả bình luận của bạn bè, đồng nghiệp và khách hàng dưới bài viết.</li>
      </ul>
    `,
  },
];

export const initialFaqs: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Tôi là nhân viên thử việc tại VRB có được tham gia không?',
    answer: 'Có! Toàn thể cán bộ nhân viên, kể cả nhân sự đang trong thời gian thử việc hoặc hợp tác viên bán lẻ của VRB đều được khuyến khích tham gia và đều có cơ hội nhận các giải thưởng tuần cũng như giải chung cuộc.',
    category: 'Đối tượng',
    order: 1,
    status: 'published',
  },
  {
    id: 'faq-2',
    question: 'Một tuần tôi có thể nộp nhiều bài dự thi cho cùng một thử thách không?',
    answer: 'Được phép. Mỗi thí sinh có thể nộp tối đa 03 bài thi khác nhau cho một thử thách tuần. Ban Giám khảo sẽ chọn bài thi có điểm số cao nhất để xét giải thưởng.',
    category: 'Gửi bài',
    order: 2,
    status: 'published',
  },
  {
    id: 'faq-3',
    question: 'Tôi có bắt buộc phải mặc đồng phục VRB khi quay video không?',
    answer: 'Không bắt buộc 100% video phải mặc đồng phục, tuy nhiên trang phục bắt buộc phải lịch sự, văn minh. Các video có mặc đồng phục hoặc nhận diện VRB rõ nét sẽ được cộng điểm ưu tiên trong tiêu chí Nhận diện thương hiệu.',
    category: 'Nội dung',
    order: 3,
    status: 'published',
  },
  {
    id: 'faq-4',
    question: 'Nếu bài thi trên TikTok của tôi bị lỗi nhạc bản quyền thì xử lý thế nào?',
    answer: 'Bạn nên sử dụng kho nhạc thương mại miễn phí có sẵn trên TikTok/CapCut. Nếu bị mất tiếng do bản quyền, bài thi sẽ bị giảm điểm đánh giá, do đó bạn nên kiểm tra kỹ video trước khi nộp link chính thức.',
    category: 'Kỹ thuật',
    order: 4,
    status: 'published',
  },
  {
    id: 'faq-5',
    question: 'Giải thưởng được trao bằng tiền mặt hay chuyển khoản?',
    answer: 'Tất cả các giải thưởng sẽ được Ban Tổ chức chuyển khoản trực tiếp vào tài khoản thanh toán mở tại VRB của cá nhân/đơn vị đạt giải sau khi có thông báo công bố kết quả chính thức.',
    category: 'Giải thưởng',
    order: 5,
    status: 'published',
  },
  {
    id: 'faq-6',
    question: 'Điểm số bảng xếp hạng được tính như thế nào?',
    answer: 'Trong giai đoạn chạy thử nghiệm demo, điểm số trên bảng xếp hạng do Ban Tổ chức cập nhật minh họa. Khi triển khai chính thức, công thức tính điểm chi tiết (kết hợp điểm BGK và điểm tương tác) sẽ được ban hành thành văn bản cụ thể.',
    category: 'Bảng xếp hạng',
    order: 6,
    status: 'published',
  },
];

export const initialLeaderboards: LeaderboardPeriod[] = [
  {
    id: 'lb-personal-t11',
    type: 'personal',
    periodCode: 'T11-K1',
    periodName: 'Kỳ 1 - Tháng 11/2026',
    statusLabel: 'tam_tinh',
    updatedAt: '15/11/2026 17:30',
    evaluationNote: 'Dữ liệu demo minh họa bảng xếp hạng cá nhân Kỳ 1 Tháng 11. Thứ hạng do Admin cập nhật để kiểm thử giao diện.',
    entries: [
      { id: 'p1', rank: 1, name: 'Nguyễn Mai Anh', branch: 'VRB Sở Giao Dịch', score: 98.5, awardWon: 'Top 1 Lan Tỏa', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80' },
      { id: 'p2', rank: 2, name: 'Lê Hoàng Nam', branch: 'VRB Chi nhánh TP.HCM', score: 96.0, awardWon: 'Top 2 Sáng Tạo', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
      { id: 'p3', rank: 3, name: 'Phạm Thanh Hằng', branch: 'VRB Chi nhánh Đà Nẵng', score: 94.2, awardWon: 'Top 3 Bứt Phá', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80' },
      { id: 'p4', rank: 4, name: 'Vũ Đức Cường', branch: 'VRB Chi nhánh Hải Phòng', score: 91.8, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
      { id: 'p5', rank: 5, name: 'Hoàng Thu Trang', branch: 'VRB Chi nhánh Khánh Hòa', score: 89.5, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
      { id: 'p6', rank: 6, name: 'Đỗ Tuấn Minh', branch: 'VRB Chi nhánh Hà Nội', score: 87.0 },
      { id: 'p7', rank: 7, name: 'Bùi Thùy Linh', branch: 'VRB Chi nhánh Đà Nẵng', score: 85.5 },
      { id: 'p8', rank: 8, name: 'Nguyễn Văn Hùng', branch: 'VRB Chi nhánh Quảng Ninh', score: 83.2 },
      { id: 'p9', rank: 9, name: 'Trần Thị Ngọc', branch: 'VRB Chi nhánh Vũng Tàu', score: 81.0 },
      { id: 'p10', rank: 10, name: 'Lương Quốc Bảo', branch: 'VRB Chi nhánh Đồng Nai', score: 79.8 },
    ],
  },
  {
    id: 'lb-personal-chungcuoc',
    type: 'personal',
    periodCode: 'CHUNG-CUOC',
    periodName: 'Tổng Kết Chung Cuộc (Dự kiến)',
    statusLabel: 'tam_tinh',
    updatedAt: '31/12/2026 20:00',
    evaluationNote: 'Dữ liệu dự kiến tổng kết toàn chiến dịch.',
    entries: [
      { id: 'cp1', rank: 1, name: 'Nguyễn Mai Anh', branch: 'VRB Sở Giao Dịch', score: 392.5, awardWon: 'Quán Quân VRB Creator 2026', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80' },
      { id: 'cp2', rank: 2, name: 'Lê Hoàng Nam', branch: 'VRB Chi nhánh TP.HCM', score: 388.0, awardWon: 'Á Quân 1', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
      { id: 'cp3', rank: 3, name: 'Phạm Thanh Hằng', branch: 'VRB Chi nhánh Đà Nẵng', score: 379.5, awardWon: 'Á Quân 2', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80' },
    ],
  },
  {
    id: 'lb-collective-t11',
    type: 'collective',
    periodCode: 'T11-TAPTHE',
    periodName: 'Kỳ Tháng 11/2026 (Tập Thể)',
    statusLabel: 'chinh_thuc',
    updatedAt: '30/11/2026 18:00',
    evaluationNote: 'Bảng xếp hạng tổng hợp điểm thi đua các Chi nhánh VRB theo tỷ lệ cán bộ tham gia và bài thi hợp lệ.',
    entries: [
      { id: 'c-unit-1', rank: 1, name: 'VRB Sở Giao Dịch Hà Nội', score: 1450, awardWon: 'Chi Nhánh Dẫn Đầu Tháng 11' },
      { id: 'c-unit-2', rank: 2, name: 'VRB Chi nhánh TP. Hồ Chí Minh', score: 1380, awardWon: 'Chi Nhánh Năng Động' },
      { id: 'c-unit-3', rank: 3, name: 'VRB Chi nhánh Đà Nẵng', score: 1120, awardWon: 'Chi Nhánh Đổi Mới' },
      { id: 'c-unit-4', rank: 4, name: 'VRB Chi nhánh Hải Phòng', score: 950 },
      { id: 'c-unit-5', rank: 5, name: 'VRB Chi nhánh Khánh Hòa', score: 890 },
      { id: 'c-unit-6', rank: 6, name: 'VRB Chi nhánh Quảng Ninh', score: 760 },
      { id: 'c-unit-7', rank: 7, name: 'VRB Chi nhánh Vũng Tàu', score: 680 },
    ],
  },
];
