export type ContentStatus = 'draft' | 'published' | 'hidden';

export type TimeStatus = 'upcoming' | 'ongoing' | 'ended';

export interface ProgramInfo {
  siteText?: Record<string, string>;
  budgetTotal?: number;
  id: string;
  title: string;
  subTitle: string;
  slogan: string;
  startDate: string; // e.g. 2026-11-01
  endDate: string;   // e.g. 2026-12-31
  heroDescription: string;
  logoUrl: string;
  bannerUrl: string;
  submissionFormUrl: string; // Google Form / Office 365 form
  isSubmissionActive: boolean;
  zaloGroupUrl: string;
  isZaloActive: boolean;
  hotline: string;
  supportEmail: string;
  supportContact: string;
  updatedAt: string;
}

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  month: number; // 11 or 12
  bannerUrl: string;
  excerpt: string;
  description: string;
  requirements: string;
  applicableProducts: string;
  applicableFormat: string;
  officialHashtags: string;
  validConditions: string;
  prizeStructure: string;
  submissionGuide: string;
  submissionFormUrl?: string;
  status: ContentStatus;
  isFeaturedHome: boolean;
  winnersAnnouncement?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageDocument {
  draftMetadata?: { title: string; versionName: string; updatedDate: string; pdfAttachmentName: string; pdfAttachmentUrl: string };
  id: 'the-le' | 'dieu-khoan' | 'huong-dan' | 'chuong-trinh';
  title: string;
  versionName: string;
  updatedDate: string;
  contentHtml: string;
  draftContentHtml?: string;
  pdfAttachmentUrl?: string;
  pdfAttachmentName?: string;
  isPublished: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  status: ContentStatus;
}

export interface AwardItem {
  id: string;
  group: 'monday' | 'biweekly' | 'grand';
  groupName: string;
  title: string;
  periodDescription: string;
  prizeQuantity: string;
  rewardValue: string; // e.g. "500.000 VNĐ", "2.000.000 VNĐ"
  totalEstimated: number; // in VNĐ
  evaluationCriteria: string;
  order: number;
  status: ContentStatus;
}

export interface FeaturedIndividual {
  id: string;
  fullName: string;
  branch: string; // Đơn vị / Chi nhánh VRB
  roleTitle: string; // Chức danh / Phòng ban
  achievementSummary: string; // Thành tích nổi bật
  quote: string;
  avatarUrl: string;
  order: number;
  externalLink?: string;
  status: ContentStatus;
}

export interface FeaturedContent {
  id: string;
  title: string;
  authorName: string;
  branch: string;
  platform: 'facebook' | 'tiktok' | 'youtube' | 'other';
  contentType: 'video' | 'post' | 'infographic';
  originalUrl: string;
  thumbnailUrl: string;
  excerpt: string;
  relatedChallengeSlug?: string;
  order: number;
  status: ContentStatus;
  isMissingAccountNotice?: boolean; // Đặc biệt cho link TikTok 1 thiếu username
  note?: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string; // Họ tên hoặc Tên đơn vị
  branch?: string; // Chi nhánh (cho cá nhân)
  score: number;
  awardWon?: string; // Danh hiệu / giải nếu có
  avatar?: string;
}

export interface LeaderboardPeriod {
  id: string;
  type: 'personal' | 'collective';
  periodCode: string; // e.g. "T11-K1", "T11-K2", "CHUNG-CUOC"
  periodName: string; // e.g. "Kỳ 1 - Tháng 11/2026", "Tổng kết chung cuộc"
  statusLabel: 'tam_tinh' | 'chinh_thuc';
  updatedAt: string;
  evaluationNote: string;
  entries: LeaderboardEntry[];
}
