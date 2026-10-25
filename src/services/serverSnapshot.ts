import type { PublicSnapshot } from './publicSnapshot';
let cached: PublicSnapshot | null | undefined;
export function serverSnapshot(): PublicSnapshot | null {
  if (cached !== undefined) return cached;
  try {
    const source = typeof document !== 'undefined' && document.getElementById('vrb-public-data')?.textContent;
    cached = source ? JSON.parse(source) as PublicSnapshot : null;
  } catch { cached = null; }
  return cached;
}
