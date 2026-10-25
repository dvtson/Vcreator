import { createPublicContent } from '../server/public-content.mjs';
const handler = createPublicContent();
export default { fetch: handler };
