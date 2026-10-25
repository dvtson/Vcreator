import type { BackupPayload } from './db';
import { initialProgramInfo, initialChallenges, initialPageDocuments, initialFaqs, initialAwardItems, initialFeaturedIndividuals, initialFeaturedContents, initialLeaderboards } from './seedData';
export const storeKeys = ['program_info','challenges','page_documents','faqs','awards','featured_individuals','featured_contents','leaderboards'] as const;
export type ContentStore = typeof storeKeys[number];
export type ContentRecord = { id: string; [key: string]: unknown };
export const sectionStores = { programInfo:'program_info', challenges:'challenges', pageDocuments:'page_documents', faqs:'faqs', awards:'awards', featuredIndividuals:'featured_individuals', featuredContents:'featured_contents', leaderboards:'leaderboards' } as const;
export function seedPayload(): BackupPayload {
  return structuredClone({ version:1, exportedAt:new Date().toISOString(), appName:'VRB CREATOR', data:{programInfo:initialProgramInfo,challenges:initialChallenges,pageDocuments:initialPageDocuments,faqs:initialFaqs,awards:initialAwardItems,featuredIndividuals:initialFeaturedIndividuals,featuredContents:initialFeaturedContents,leaderboards:initialLeaderboards} });
}
export function publicProjection(store: ContentStore, input: ContentRecord): ContentRecord | null {
  if (store === 'page_documents' && input.isPublished !== true) return null;
  if (['challenges','faqs','awards','featured_individuals','featured_contents'].includes(store) && input.status !== 'published') return null;
  // Firestore reads whole documents: never put draft fields in a publicly readable document.
  const fields:Record<ContentStore,string[]> = {
    program_info:['id','title','subTitle','slogan','startDate','endDate','heroDescription','logoUrl','bannerUrl','submissionFormUrl','isSubmissionActive','zaloGroupUrl','isZaloActive','hotline','supportEmail','supportContact','updatedAt','siteText','budgetTotal'],
    challenges:['id','slug','title','date','month','bannerUrl','excerpt','description','requirements','applicableProducts','applicableFormat','officialHashtags','validConditions','prizeStructure','submissionGuide','submissionFormUrl','status','isFeaturedHome','winnersAnnouncement','createdAt','updatedAt'],
    page_documents:['id','title','versionName','updatedDate','contentHtml','pdfAttachmentUrl','pdfAttachmentName','isPublished'],
    faqs:['id','question','answer','category','order','status'],
    awards:['id','group','groupName','title','periodDescription','prizeQuantity','rewardValue','totalEstimated','evaluationCriteria','order','status'],
    featured_individuals:['id','fullName','branch','roleTitle','achievementSummary','quote','avatarUrl','order','externalLink','status'],
    featured_contents:['id','title','authorName','branch','platform','contentType','originalUrl','thumbnailUrl','excerpt','relatedChallengeSlug','order','status','isMissingAccountNotice','note','createdAt'],
    leaderboards:['id','type','periodCode','periodName','statusLabel','updatedAt','evaluationNote','entries'],
  };
  const record = Object.fromEntries(fields[store].filter(key=>input[key]!==undefined).map(key=>[key,input[key]])) as ContentRecord;
  return JSON.parse(JSON.stringify(record)) as ContentRecord;
}
export function cleanRecord(input: unknown): ContentRecord {
  const record = JSON.parse(JSON.stringify(input)) as ContentRecord;
  if (!record || typeof record !== 'object' || Array.isArray(record) || typeof record.id !== 'string' || !record.id || record.id.length > 180 || record.id==='.' || record.id==='..' || record.id.includes('/')) throw new Error('Mã nội dung cần là chuỗi không rỗng, tối đa 180 ký tự và không chứa dấu /');
  return record;
}
export const PART_CHARACTERS = 120_000;
export function encodeRecord(input: ContentRecord): { inline?: ContentRecord; parts: string[] } {
  const json = JSON.stringify(input);
  if (new TextEncoder().encode(json).byteLength > 24 * 1024 * 1024) throw new Error('Một nội dung vượt quá 24 MB. Vui lòng giảm dung lượng ảnh hoặc dùng đường dẫn tệp.');
  if (new TextEncoder().encode(json).byteLength <= 16_000) return { inline: input, parts: [] };
  const parts: string[] = [];
  for (let start = 0; start < json.length;) {
    let end = Math.min(start + PART_CHARACTERS, json.length);
    // Never split a UTF-16 surrogate pair at a Firestore string boundary.
    if (end < json.length && /[\uD800-\uDBFF]/.test(json[end-1])) end--;
    parts.push(json.slice(start,end)); start=end;
  }
  return { parts };
}
export function decodeRecord(inline: ContentRecord | undefined, parts: string[]): ContentRecord {
  return cleanRecord(inline ?? JSON.parse(parts.join('')));
}
export function payloadRecords(payload: BackupPayload): Map<ContentStore, ContentRecord[]> {
  return new Map(Object.entries(sectionStores).map(([section,store])=> {
    const value=payload.data[section as keyof BackupPayload['data']];
    return [store,(Array.isArray(value)?value:[value]).map(cleanRecord)];
  }));
}
