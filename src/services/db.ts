import { isCalendarDate } from './dates';
import { requireAdmin } from './authService';
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
  initialProgramInfo,
  initialChallenges,
  initialPageDocuments,
  initialFaqs,
  initialAwardItems,
  initialFeaturedIndividuals,
  initialFeaturedContents,
  initialLeaderboards
} from './seedData';

const DB_NAME = 'vrb_creator_db';
const DB_VERSION = 1;

export const STORES = {
  PROGRAM_INFO: 'program_info',
  CHALLENGES: 'challenges',
  PAGE_DOCUMENTS: 'page_documents',
  FAQS: 'faqs',
  AWARDS: 'awards',
  FEATURED_INDIVIDUALS: 'featured_individuals',
  FEATURED_CONTENTS: 'featured_contents',
  LEADERBOARDS: 'leaderboards',
  APP_META: 'app_meta',
} as const;

type StoreName = typeof STORES[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.PROGRAM_INFO)) {
        db.createObjectStore(STORES.PROGRAM_INFO, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.CHALLENGES)) {
        const cs = db.createObjectStore(STORES.CHALLENGES, { keyPath: 'id' });
        cs.createIndex('slug', 'slug', { unique: true });
        cs.createIndex('date', 'date');
      }
      if (!db.objectStoreNames.contains(STORES.PAGE_DOCUMENTS)) {
        db.createObjectStore(STORES.PAGE_DOCUMENTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.FAQS)) {
        db.createObjectStore(STORES.FAQS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.AWARDS)) {
        db.createObjectStore(STORES.AWARDS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.FEATURED_INDIVIDUALS)) {
        db.createObjectStore(STORES.FEATURED_INDIVIDUALS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.FEATURED_CONTENTS)) {
        db.createObjectStore(STORES.FEATURED_CONTENTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.LEADERBOARDS)) {
        db.createObjectStore(STORES.LEADERBOARDS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.APP_META)) {
        db.createObjectStore(STORES.APP_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = async () => {
      const db = request.result;
      db.onversionchange = () => { db.close(); dbPromise = null; };
      try { await ensureSeedData(db); resolve(db); }
      catch (error) { db.close(); dbPromise = null; reject(error); }
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

async function ensureSeedData(db: IDBDatabase): Promise<void> {
  const isInitialized = await new Promise<boolean>((resolve) => {
    const tx = db.transaction(STORES.APP_META, 'readonly');
    const store = tx.objectStore(STORES.APP_META);
    const getReq = store.get('initialized');
    getReq.onsuccess = () => resolve(!!getReq.result);
    getReq.onerror = () => resolve(false);
  });

  if (isInitialized) return;

  // Populate seed data
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(
      [
        STORES.PROGRAM_INFO,
        STORES.CHALLENGES,
        STORES.PAGE_DOCUMENTS,
        STORES.FAQS,
        STORES.AWARDS,
        STORES.FEATURED_INDIVIDUALS,
        STORES.FEATURED_CONTENTS,
        STORES.LEADERBOARDS,
        STORES.APP_META
      ],
      'readwrite'
    );

    tx.objectStore(STORES.PROGRAM_INFO).put(initialProgramInfo);

    initialChallenges.forEach((item) => tx.objectStore(STORES.CHALLENGES).put(item));
    initialPageDocuments.forEach((item) => tx.objectStore(STORES.PAGE_DOCUMENTS).put(item));
    initialFaqs.forEach((item) => tx.objectStore(STORES.FAQS).put(item));
    initialAwardItems.forEach((item) => tx.objectStore(STORES.AWARDS).put(item));
    initialFeaturedIndividuals.forEach((item) => tx.objectStore(STORES.FEATURED_INDIVIDUALS).put(item));
    initialFeaturedContents.forEach((item) => tx.objectStore(STORES.FEATURED_CONTENTS).put(item));
    initialLeaderboards.forEach((item) => tx.objectStore(STORES.LEADERBOARDS).put(item));

    tx.objectStore(STORES.APP_META).put({ key: 'initialized', value: true, seededAt: new Date().toISOString() });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllFromStore<T>(storeName: StoreName): Promise<T[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getByIdFromStore<T>(storeName: StoreName, id: string): Promise<T | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(id);
    req.onsuccess = () => resolve((req.result as T) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function putItemInStore<T>(storeName: StoreName, item: T): Promise<void> {
  requireAdmin();
  validateStoreItem(storeName, item);
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(item);
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error || new Error("Giao dịch bị hủy"));
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteItemFromStore(storeName: StoreName, id: string): Promise<void> {
  requireAdmin();
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error || new Error("Giao dịch bị hủy"));
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearStore(storeName: StoreName): Promise<void> {
  requireAdmin();
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.clear();
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error || new Error("Giao dịch bị hủy"));
    tx.onerror = () => reject(tx.error);
  });
}

export interface BackupPayload {
  version: number;
  exportedAt: string;
  appName: string;
  data: {
    programInfo: ProgramInfo;
    challenges: Challenge[];
    pageDocuments: PageDocument[];
    faqs: FaqItem[];
    awards: AwardItem[];
    featuredIndividuals: FeaturedIndividual[];
    featuredContents: FeaturedContent[];
    leaderboards: LeaderboardPeriod[];
  };
}

export async function exportCompleteDatabase(): Promise<string> {
  const db = await getDB();
  const [
    infoList,
    challenges,
    pageDocuments,
    faqs,
    awards,
    featuredIndividuals,
    featuredContents,
    leaderboards
  ] = await Promise.all([
    getAllFromStore<ProgramInfo>(STORES.PROGRAM_INFO),
    getAllFromStore<Challenge>(STORES.CHALLENGES),
    getAllFromStore<PageDocument>(STORES.PAGE_DOCUMENTS),
    getAllFromStore<FaqItem>(STORES.FAQS),
    getAllFromStore<AwardItem>(STORES.AWARDS),
    getAllFromStore<FeaturedIndividual>(STORES.FEATURED_INDIVIDUALS),
    getAllFromStore<FeaturedContent>(STORES.FEATURED_CONTENTS),
    getAllFromStore<LeaderboardPeriod>(STORES.LEADERBOARDS),
  ]);

  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    appName: 'VRB CREATOR DEMO',
    data: {
      programInfo: infoList[0] || initialProgramInfo,
      challenges,
      pageDocuments,
      faqs,
      awards,
      featuredIndividuals,
      featuredContents,
      leaderboards
    }
  };

  return JSON.stringify(payload, null, 2);
}

export async function importCompleteDatabase(jsonString: string): Promise<boolean> {
  requireAdmin();
  try {
    const payload = JSON.parse(jsonString) as BackupPayload;
    if (!payload.data || payload.version !== 1) {
      throw new Error('Dữ liệu sao lưu không đúng định dạng');
    }

    validateBackupData(payload.data);
    const db = await getDB();
    const tx = db.transaction(
      [
        STORES.PROGRAM_INFO,
        STORES.CHALLENGES,
        STORES.PAGE_DOCUMENTS,
        STORES.FAQS,
        STORES.AWARDS,
        STORES.FEATURED_INDIVIDUALS,
        STORES.FEATURED_CONTENTS,
        STORES.LEADERBOARDS
      ],
      'readwrite'
    );

    // Clear stores
    tx.objectStore(STORES.PROGRAM_INFO).clear();
    tx.objectStore(STORES.CHALLENGES).clear();
    tx.objectStore(STORES.PAGE_DOCUMENTS).clear();
    tx.objectStore(STORES.FAQS).clear();
    tx.objectStore(STORES.AWARDS).clear();
    tx.objectStore(STORES.FEATURED_INDIVIDUALS).clear();
    tx.objectStore(STORES.FEATURED_CONTENTS).clear();
    tx.objectStore(STORES.LEADERBOARDS).clear();

    // Populate new
    if (payload.data.programInfo) {
      tx.objectStore(STORES.PROGRAM_INFO).put(payload.data.programInfo);
    }
    payload.data.challenges?.forEach((item) => tx.objectStore(STORES.CHALLENGES).put(item));
    payload.data.pageDocuments?.forEach((item) => tx.objectStore(STORES.PAGE_DOCUMENTS).put(item));
    payload.data.faqs?.forEach((item) => tx.objectStore(STORES.FAQS).put(item));
    payload.data.awards?.forEach((item) => tx.objectStore(STORES.AWARDS).put(item));
    payload.data.featuredIndividuals?.forEach((item) => tx.objectStore(STORES.FEATURED_INDIVIDUALS).put(item));
    payload.data.featuredContents?.forEach((item) => tx.objectStore(STORES.FEATURED_CONTENTS).put(item));
    payload.data.leaderboards?.forEach((item) => tx.objectStore(STORES.LEADERBOARDS).put(item));

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    return true;
  } catch (error) {
    console.error('Lỗi nhập dữ liệu:', error);
    throw error;
  }
}

export async function resetDatabaseToDefaults(): Promise<void> {
  requireAdmin();
  const db = await getDB();
  const tx = db.transaction(
    [
      STORES.PROGRAM_INFO,
      STORES.CHALLENGES,
      STORES.PAGE_DOCUMENTS,
      STORES.FAQS,
      STORES.AWARDS,
      STORES.FEATURED_INDIVIDUALS,
      STORES.FEATURED_CONTENTS,
      STORES.LEADERBOARDS,
      STORES.APP_META
    ],
    'readwrite'
  );

  tx.objectStore(STORES.PROGRAM_INFO).clear();
  tx.objectStore(STORES.CHALLENGES).clear();
  tx.objectStore(STORES.PAGE_DOCUMENTS).clear();
  tx.objectStore(STORES.FAQS).clear();
  tx.objectStore(STORES.AWARDS).clear();
  tx.objectStore(STORES.FEATURED_INDIVIDUALS).clear();
  tx.objectStore(STORES.FEATURED_CONTENTS).clear();
  tx.objectStore(STORES.LEADERBOARDS).clear();

  tx.objectStore(STORES.PROGRAM_INFO).put(initialProgramInfo);
  initialChallenges.forEach((item) => tx.objectStore(STORES.CHALLENGES).put(item));
  initialPageDocuments.forEach((item) => tx.objectStore(STORES.PAGE_DOCUMENTS).put(item));
  initialFaqs.forEach((item) => tx.objectStore(STORES.FAQS).put(item));
  initialAwardItems.forEach((item) => tx.objectStore(STORES.AWARDS).put(item));
  initialFeaturedIndividuals.forEach((item) => tx.objectStore(STORES.FEATURED_INDIVIDUALS).put(item));
  initialFeaturedContents.forEach((item) => tx.objectStore(STORES.FEATURED_CONTENTS).put(item));
  initialLeaderboards.forEach((item) => tx.objectStore(STORES.LEADERBOARDS).put(item));

  tx.objectStore(STORES.APP_META).put({ key: 'initialized', value: true, seededAt: new Date().toISOString() });

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function validateBackupData(data: BackupPayload['data']): void {
  const required: Record<string, Record<string, string>> = {
    programInfo: { id:'string', title:'string', subTitle:'string', slogan:'string', startDate:'string', endDate:'string', heroDescription:'string', logoUrl:'string', bannerUrl:'string', submissionFormUrl:'string', isSubmissionActive:'boolean', zaloGroupUrl:'string', isZaloActive:'boolean', hotline:'string', supportEmail:'string', supportContact:'string', updatedAt:'string' },
    challenges: { id:'string', slug:'string', title:'string', date:'string', month:'number', bannerUrl:'string', excerpt:'string', description:'string', requirements:'string', applicableProducts:'string', applicableFormat:'string', officialHashtags:'string', validConditions:'string', prizeStructure:'string', submissionGuide:'string', status:'string', isFeaturedHome:'boolean', createdAt:'string', updatedAt:'string' },
    pageDocuments: { id:'string', title:'string', versionName:'string', updatedDate:'string', contentHtml:'string', isPublished:'boolean' },
    faqs: { id:'string', question:'string', answer:'string', category:'string', order:'number', status:'string' },
    awards: { id:'string', group:'string', groupName:'string', order:'number', title:'string', periodDescription:'string', prizeQuantity:'string', rewardValue:'string', totalEstimated:'number', evaluationCriteria:'string', status:'string' },
    featuredIndividuals: { id:'string', fullName:'string', branch:'string', roleTitle:'string', achievementSummary:'string', quote:'string', avatarUrl:'string', status:'string', order:'number' },
    featuredContents: { id:'string', title:'string', status:'string', platform:'string', contentType:'string', authorName:'string', branch:'string', originalUrl:'string', thumbnailUrl:'string', excerpt:'string', order:'number', createdAt:'string' },
    leaderboards: { id:'string', type:'string', periodCode:'string', periodName:'string', statusLabel:'string', updatedAt:'string', evaluationNote:'string', entries:'object' },
  };
  if (!data || typeof data !== 'object') throw new Error('Tệp không có dữ liệu hợp lệ');
  for (const [key, fields] of Object.entries(required)) {
    const value = (data as unknown as Record<string, unknown>)[key];
    if (key !== 'programInfo' && !Array.isArray(value)) throw new Error(`Thiếu danh sách ${key}`);
    const rows = key === 'programInfo' ? [value] : value as unknown[];
    const ids = new Set<string>();
    for (const row of rows) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`Dòng không hợp lệ trong ${key}`);
      const item = row as Record<string, unknown>;
      for (const [field, type] of Object.entries(fields)) {
        if (typeof item[field] !== type || (type === 'number' && !Number.isFinite(item[field]))) throw new Error(`Trường ${key}.${field} không hợp lệ`);
      }
      if (!item.id || ids.has(item.id as string)) throw new Error(`Mã trống hoặc trùng trong ${key}`);
      ids.add(item.id as string);
      if ('status' in item && !['draft','published','hidden'].includes(item.status as string)) throw new Error('Trạng thái nội dung không hợp lệ');
      validateRecordLinks(item);
    }
  }
  const optional:Record<string,Record<string,string>> = {
    challenges:{submissionFormUrl:'string',winnersAnnouncement:'string'},
    pageDocuments:{draftContentHtml:'string',pdfAttachmentUrl:'string',pdfAttachmentName:'string'},
    featuredIndividuals:{externalLink:'string'},
    featuredContents:{relatedChallengeSlug:'string',isMissingAccountNotice:'boolean',note:'string'},
  };
  for(const [section,fields]of Object.entries(optional)) for(const row of (data as unknown as Record<string,Record<string,unknown>[]>)[section]) {
    for(const [key,type]of Object.entries(fields))if(row[key]!==undefined && typeof row[key]!==type)throw new Error(`Trường ${section}.${key} không hợp lệ`);
  }
  if (!isCalendarDate(data.programInfo.startDate) || !isCalendarDate(data.programInfo.endDate) || data.programInfo.startDate > data.programInfo.endDate) throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
  const texts=data.programInfo.siteText;
  if (texts !== undefined && (!texts || typeof texts !== 'object' || Array.isArray(texts) || Object.values(texts).some(value=>typeof value!=='string'))) throw new Error('Nội dung giao diện phải là danh sách văn bản');
  if (data.programInfo.budgetTotal !== undefined && (!Number.isFinite(data.programInfo.budgetTotal) || data.programInfo.budgetTotal<0)) throw new Error('Ngân sách không hợp lệ');
  for (const doc of data.pageDocuments) if (!['the-le','dieu-khoan','huong-dan','chuong-trinh'].includes(doc.id)) throw new Error('Mã trang tài liệu không hợp lệ');
  for (const award of data.awards) if (!['monday','biweekly','grand'].includes(award.group) || award.totalEstimated<0) throw new Error('Nhóm giải hoặc mức thưởng không hợp lệ');
  for (const item of data.featuredContents) if (!['facebook','tiktok','youtube','other'].includes(item.platform) || !['video','post','infographic'].includes(item.contentType)) throw new Error('Nền tảng hoặc loại nội dung không hợp lệ');
  for (const challenge of data.challenges) {
    if(!challenge.title.trim() || !isCalendarDate(challenge.date) || challenge.month!==Number(challenge.date.slice(5,7)))throw new Error('Tên, ngày hoặc tháng của thử thách không hợp lệ');
  }
  for (const doc of data.pageDocuments) if(doc.draftMetadata !== undefined) {
    if(!doc.draftMetadata || typeof doc.draftMetadata!=='object' || Array.isArray(doc.draftMetadata))throw new Error('Thông tin bản nháp không hợp lệ');
    for(const key of ['title','versionName','updatedDate','pdfAttachmentName','pdfAttachmentUrl'] as const)if(typeof doc.draftMetadata[key]!=='string')throw new Error('Thông tin bản nháp không hợp lệ');
  }
  const slugs = data.challenges.map(row => row.slug);
  if (slugs.some(slug => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) || new Set(slugs).size !== slugs.length) throw new Error('Đường dẫn thử thách trống, trùng hoặc sai định dạng');
  if (data.challenges.filter(row => row.isFeaturedHome).length > 1) throw new Error('Chỉ được ghim một thử thách trên trang chủ');
  for (const period of data.leaderboards) {
    if (!['personal','collective'].includes(period.type) || !['tam_tinh','chinh_thuc'].includes(period.statusLabel) || !Array.isArray(period.entries)) throw new Error('Kỳ xếp hạng không hợp lệ');
    const ids = new Set();
    for (const entry of period.entries) {
      if (!entry || typeof entry.id !== 'string' || !entry.id || ids.has(entry.id) || typeof entry.name !== 'string' || !Number.isFinite(entry.score) || entry.score < 0 || !Number.isInteger(entry.rank) || entry.rank < 1) throw new Error('Dòng bảng xếp hạng không hợp lệ');
      for(const field of ['branch','awardWon','avatar'] as const)if(entry[field]!==undefined && typeof entry[field]!=='string')throw new Error('Thông tin bảng điểm không hợp lệ');
      ids.add(entry.id);
    }
  }
}

export function validateRecordLinks(value: unknown): void {
  if (!value || typeof value !== 'object') return;
  for (const [key, field] of Object.entries(value)) {
    if (field && typeof field === 'object') validateRecordLinks(field);
    if (typeof field !== 'string' || !field || !/(?:url|avatar|thumbnail|externalLink)$/i.test(key)) continue;
    const image = /(?:logo|banner|avatar|thumbnail|image)/i.test(key);
    const pdf = /pdfAttachmentUrl/i.test(key);
    if (/^https?:\/\/[^\s]+$/i.test(field)) continue;
    if (image && (/^\/(?!\/)/.test(field) || /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(field))) continue;
    if (pdf && /^data:application\/pdf;base64,[a-z0-9+/=]+$/i.test(field)) continue;
    throw new Error(`Liên kết không hợp lệ: ${key}`);
  }
}

export function validateStoreItem(storeName: StoreName, item: unknown): void {
  const names: Partial<Record<StoreName, keyof BackupPayload['data']>> = {
    program_info:'programInfo',challenges:'challenges',page_documents:'pageDocuments',faqs:'faqs',awards:'awards',featured_individuals:'featuredIndividuals',featured_contents:'featuredContents',leaderboards:'leaderboards'
  };
  const key=names[storeName];if(!key)throw new Error('Không được chỉnh sửa kho dữ liệu hệ thống');
  const sample={programInfo:initialProgramInfo,challenges:initialChallenges,pageDocuments:initialPageDocuments,faqs:initialFaqs,awards:initialAwardItems,featuredIndividuals:initialFeaturedIndividuals,featuredContents:initialFeaturedContents,leaderboards:initialLeaderboards};
  validateBackupData({...sample,[key]:key==='programInfo'?item:[item]} as BackupPayload['data']);
}

export async function putChallengeAtomically(challenge: Challenge): Promise<void> {
  requireAdmin();validateStoreItem(STORES.CHALLENGES,challenge);
  const db=await getDB();
  await new Promise<void>((resolve,reject)=>{
    const tx=db.transaction(STORES.CHALLENGES,'readwrite');const store=tx.objectStore(STORES.CHALLENGES);
    tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error||new Error('Không thể lưu thử thách; kiểm tra đường dẫn có bị trùng.'));tx.onerror=()=>reject(tx.error);
    const request=store.getAll();request.onsuccess=()=>{
      if(challenge.isFeaturedHome)for(const other of request.result as Challenge[])if(other.id!==challenge.id && other.isFeaturedHome)store.put({...other,isFeaturedHome:false});
      store.put(challenge);
    };
  });
}
