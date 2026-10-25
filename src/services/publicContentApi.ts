import type { ContentStore } from './cloudModel';
const pending = new Map<string, { at: number; value: Promise<unknown[]> }>();
export async function publicContentRows<T>(store: ContentStore): Promise<T[]> {
  const cached = pending.get(store);
  if (cached && Date.now() - cached.at < 15_000) return structuredClone(await cached.value) as T[];
  const value = (async () => {
    const response = await fetch('/api/publicContent?' + new URLSearchParams({ store }), { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error('Không tải được dữ liệu công khai.');
    const body = await response.json();
    if (!Array.isArray(body.rows)) throw new Error('Dữ liệu công khai không hợp lệ.');
    const rows = body.rows as Record<string, unknown>[];
    if (store === 'challenges') rows.sort((a,b) => String(a.date).localeCompare(String(b.date)));
    if (['awards','faqs','featured_individuals','featured_contents'].includes(store)) rows.sort((a,b) => Number(a.order)-Number(b.order));
    if (store === 'program_info') for (const row of rows) {
      if (row.hotline === '1800 6656 / (024) 3942 6668') row.hotline = '';
      if (row.supportEmail === 'vrbcreator@vrb.com.vn') row.supportEmail = '';
      if (row.supportContact === 'Ban Truyền thông & Khối Bán lẻ VRB') row.supportContact = '';
    }
    return rows;
  })();
  pending.set(store, { at: Date.now(), value });
  value.catch(() => { if (pending.get(store)?.value === value) pending.delete(store); });
  return structuredClone(await value) as T[];
}
export function invalidatePublicContent() { pending.clear(); }
