import { createAdminApi } from '../server/admin-http.mjs';
const api = createAdminApi();
export default {
  fetch(request) {
    const origins = [
      process.env.ALLOWED_ORIGINS,
      'http://localhost:5173',
      process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : '',
      process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL : '',
      process.env.VERCEL_BRANCH_URL ? 'https://' + process.env.VERCEL_BRANCH_URL : '',
    ].filter(Boolean).join(',');
    return api.fetch(request, {
      FIREBASE_PROJECT_ID: 'vrb-creator',
      GOOGLE_SERVICE_ACCOUNT_JSON: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      ALLOWED_ORIGINS: origins,
    });
  },
};
