import type { ProgramInfo, Challenge, AwardItem, FeaturedIndividual, FeaturedContent, FaqItem, LeaderboardPeriod } from '../types';
import { publicProjection } from './cloudModel';
import type { ContentRecord, ContentStore } from './cloudModel';
import { firebaseConfig } from './firebase';

export interface PublicSnapshot {
  info: ProgramInfo; challenges: Challenge[]; awards: AwardItem[]; individuals: FeaturedIndividual[];
  contents: FeaturedContent[]; faqs: FaqItem[]; boards: LeaderboardPeriod[];
}
const MAX_AGE = 10 * 60_000;
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('vrb_public_preview_v1', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('snapshots');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function project<T>(store: ContentStore, rows: T[]): T[] {
  return rows.map(row => publicProjection(store, row as ContentRecord)).filter(Boolean) as T[];
}
export function sanitizeSnapshot(value: PublicSnapshot): PublicSnapshot {
  return {
    info: project('program_info', [value.info])[0], challenges: project('challenges', value.challenges),
    awards: project('awards', value.awards), individuals: project('featured_individuals', value.individuals),
    contents: project('featured_contents', value.contents), faqs: project('faqs', value.faqs), boards: project('leaderboards', value.boards),
  };
}
export async function readPublicSnapshot(): Promise<PublicSnapshot | null> {
  let db: IDBDatabase | undefined;
  try {
    db = await database();
    const stored = await new Promise<{ savedAt: number; value: PublicSnapshot } | undefined>((resolve, reject) => {
      const request = db!.transaction('snapshots').objectStore('snapshots').get(firebaseConfig.projectId);
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    if (!stored || !Number.isFinite(stored.savedAt) || Date.now() - stored.savedAt < 0 || Date.now() - stored.savedAt > MAX_AGE) return null;
    return sanitizeSnapshot(stored.value);
  } catch { return null; }
  finally { db?.close(); }
}
export async function writePublicSnapshot(value: PublicSnapshot): Promise<void> {
  let db: IDBDatabase | undefined;
  try {
    const clean = sanitizeSnapshot(value);
    db = await database();
    await new Promise<void>((resolve, reject) => {
      const transaction = db!.transaction('snapshots', 'readwrite');
      transaction.objectStore('snapshots').put({ savedAt: Date.now(), value: clean }, firebaseConfig.projectId);
      transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); transaction.onabort = () => reject(transaction.error);
    });
  } catch { /* Private browsing/quota failures must never block live content. */ }
  finally { db?.close(); }
}
