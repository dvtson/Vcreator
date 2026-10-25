import { lookup } from 'node:dns/promises';
import { safeFetch as coreFetch, previewImage as corePreview } from '../server/preview-core.mjs';
export * from '../server/preview-core.mjs';
export function safeFetch(value, options = {}) { return coreFetch(value, { resolve: lookup, ...options }); }
export function previewImage(value) { return corePreview(value, { resolve: lookup }); }
