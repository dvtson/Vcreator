import { cloudEnabled } from './firebase';
import { requireAdmin, canManageContent } from './authService';
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
import {
  STORES,
  putChallengeAtomically,
  getAllFromStore,
  getByIdFromStore,
  putItemInStore,
  deleteItemFromStore,
  exportCompleteDatabase,
  importCompleteDatabase,
  resetDatabaseToDefaults
} from './dataRepository';
import { initialProgramInfo } from './seedData';

// Custom Event Bus for storage reactivity across UI
export const DATA_CHANGED_EVENT = 'vrb-storage-changed';

export function notifyDataChanged(storeName?: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, { detail: { storeName } }));
    try { localStorage.setItem(DATA_CHANGED_EVENT, JSON.stringify({ storeName, nonce: crypto.randomUUID() })); }
    catch { /* IndexedDB remains saved; tabs also refresh when focused. */ }
  }
}

// PROGRAM INFO
export async function getProgramInfo(): Promise<ProgramInfo> {
  const items = await getAllFromStore<ProgramInfo>(STORES.PROGRAM_INFO);
  if (!items.length && cloudEnabled) throw new Error('Website chưa được khởi tạo dữ liệu cloud. Vui lòng chờ quản trị viên hoàn tất chuyển dữ liệu.');
  const info = items[0] || initialProgramInfo;
  // Retire the original demo contacts in existing browser/cloud datasets too.
  // Admin can supply replacement contact details without resetting other content.
  return { ...info,
    hotline: info.hotline === '1800 6656 / (024) 3942 6668' ? '' : info.hotline,
    supportEmail: info.supportEmail === 'vrbcreator@vrb.com.vn' ? '' : info.supportEmail,
    supportContact: info.supportContact === 'Ban Truyền thông & Khối Bán lẻ VRB' ? '' : info.supportContact,
  };
}

export async function saveProgramInfo(info: ProgramInfo): Promise<void> {
  requireAdmin();
  if (!info.title.trim() || !info.startDate || !info.endDate || info.startDate > info.endDate) throw new Error('Kiểm tra tên chương trình và ngày bắt đầu/kết thúc.');
  const updated = { ...info, updatedAt: new Date().toISOString() };
  await putItemInStore(STORES.PROGRAM_INFO, updated);
  notifyDataChanged(STORES.PROGRAM_INFO);
}

// CHALLENGES
export async function getChallenges(includeHidden = false): Promise<Challenge[]> {
  const list = await getAllFromStore<Challenge>(STORES.CHALLENGES);
  const sorted = list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (includeHidden) return sorted;
  return sorted.filter((c) => c.status === 'published');
}

export async function getChallengeBySlug(slug: string): Promise<Challenge | null> {
  const list = await getAllFromStore<Challenge>(STORES.CHALLENGES);
  return list.find((c) => c.slug === slug && (c.status === 'published' || canManageContent())) || null;
}

export async function getChallengeById(id: string): Promise<Challenge | null> {
  return getByIdFromStore<Challenge>(STORES.CHALLENGES, id);
}

export async function saveChallenge(challenge: Challenge): Promise<void> {
  requireAdmin();
  const now = new Date().toISOString();
  const toSave = {
    ...challenge,
    updatedAt: now,
    createdAt: challenge.createdAt || now,
  };

  await putChallengeAtomically(toSave);
  notifyDataChanged(STORES.CHALLENGES);
}

export async function deleteChallenge(id: string): Promise<void> {
  requireAdmin();
  await deleteItemFromStore(STORES.CHALLENGES, id);
  notifyDataChanged(STORES.CHALLENGES);
}

// PAGE DOCUMENTS (The le, Dieu khoan, Huong dan, Chuong trinh)
export async function getPageDocument(id: PageDocument['id']): Promise<PageDocument | null> {
  const doc = await getByIdFromStore<PageDocument>(STORES.PAGE_DOCUMENTS, id);
  return doc?.isPublished || canManageContent() ? doc : null;
}

export async function getAllPageDocuments(): Promise<PageDocument[]> {
  return getAllFromStore<PageDocument>(STORES.PAGE_DOCUMENTS);
}

export async function savePageDocument(doc: PageDocument): Promise<void> {
  requireAdmin();
  await putItemInStore(STORES.PAGE_DOCUMENTS, doc);
  notifyDataChanged(STORES.PAGE_DOCUMENTS);
}

// FAQS
export async function getFaqs(includeHidden = false): Promise<FaqItem[]> {
  const list = await getAllFromStore<FaqItem>(STORES.FAQS);
  const sorted = list.sort((a, b) => a.order - b.order);
  if (includeHidden) return sorted;
  return sorted.filter((f) => f.status === 'published');
}

export async function saveFaq(faq: FaqItem): Promise<void> {
  requireAdmin();
  await putItemInStore(STORES.FAQS, faq);
  notifyDataChanged(STORES.FAQS);
}

export async function deleteFaq(id: string): Promise<void> {
  requireAdmin();
  await deleteItemFromStore(STORES.FAQS, id);
  notifyDataChanged(STORES.FAQS);
}

// AWARDS
export async function getAwards(includeHidden = false): Promise<AwardItem[]> {
  const list = await getAllFromStore<AwardItem>(STORES.AWARDS);
  const sorted = list.sort((a, b) => a.order - b.order);
  if (includeHidden) return sorted;
  return sorted.filter((a) => a.status === 'published');
}

export async function saveAward(award: AwardItem): Promise<void> {
  requireAdmin();
  await putItemInStore(STORES.AWARDS, award);
  notifyDataChanged(STORES.AWARDS);
}

export async function deleteAward(id: string): Promise<void> {
  requireAdmin();
  await deleteItemFromStore(STORES.AWARDS, id);
  notifyDataChanged(STORES.AWARDS);
}

// FEATURED INDIVIDUALS (Top 5)
export async function getFeaturedIndividuals(includeHidden = false): Promise<FeaturedIndividual[]> {
  const list = await getAllFromStore<FeaturedIndividual>(STORES.FEATURED_INDIVIDUALS);
  const sorted = list.sort((a, b) => a.order - b.order);
  if (includeHidden) return sorted;
  return sorted.filter((i) => i.status === 'published');
}

export async function saveFeaturedIndividual(ind: FeaturedIndividual): Promise<void> {
  requireAdmin();
  await putItemInStore(STORES.FEATURED_INDIVIDUALS, ind);
  notifyDataChanged(STORES.FEATURED_INDIVIDUALS);
}

export async function deleteFeaturedIndividual(id: string): Promise<void> {
  requireAdmin();
  await deleteItemFromStore(STORES.FEATURED_INDIVIDUALS, id);
  notifyDataChanged(STORES.FEATURED_INDIVIDUALS);
}

// FEATURED CONTENTS / VIDEOS
export async function getFeaturedContents(includeHidden = false): Promise<FeaturedContent[]> {
  const list = await getAllFromStore<FeaturedContent>(STORES.FEATURED_CONTENTS);
  const sorted = list.sort((a, b) => a.order - b.order);
  if (includeHidden) return sorted;
  return sorted.filter((c) => c.status === 'published');
}

export async function getFeaturedContentById(id: string): Promise<FeaturedContent | null> {
  const item = await getByIdFromStore<FeaturedContent>(STORES.FEATURED_CONTENTS, id);
  return item && (item.status === 'published' || canManageContent()) ? item : null;
}

export async function saveFeaturedContent(content: FeaturedContent): Promise<void> {
  requireAdmin();
  await putItemInStore(STORES.FEATURED_CONTENTS, content);
  notifyDataChanged(STORES.FEATURED_CONTENTS);
}

export async function deleteFeaturedContent(id: string): Promise<void> {
  requireAdmin();
  await deleteItemFromStore(STORES.FEATURED_CONTENTS, id);
  notifyDataChanged(STORES.FEATURED_CONTENTS);
}

// LEADERBOARDS
export async function getLeaderboards(): Promise<LeaderboardPeriod[]> {
  return getAllFromStore<LeaderboardPeriod>(STORES.LEADERBOARDS);
}

export async function getLeaderboardById(id: string): Promise<LeaderboardPeriod | null> {
  return getByIdFromStore<LeaderboardPeriod>(STORES.LEADERBOARDS, id);
}

export async function saveLeaderboard(lb: LeaderboardPeriod): Promise<void> {
  requireAdmin();
  await putItemInStore(STORES.LEADERBOARDS, lb);
  notifyDataChanged(STORES.LEADERBOARDS);
}

export async function deleteLeaderboard(id: string): Promise<void> {
  requireAdmin();
  await deleteItemFromStore(STORES.LEADERBOARDS, id);
  notifyDataChanged(STORES.LEADERBOARDS);
}

// BACKUP & RESTORE
export async function exportDatabaseBackup(): Promise<string> {
  return exportCompleteDatabase();
}

export async function importDatabaseBackup(jsonString: string): Promise<boolean> {
  requireAdmin();
  const result = await importCompleteDatabase(jsonString);
  notifyDataChanged();
  return result;
}

export async function resetDatabase(): Promise<void> {
  requireAdmin();
  await resetDatabaseToDefaults();
  notifyDataChanged();
}
