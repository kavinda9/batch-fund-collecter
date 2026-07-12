// Central API base URL — strips any trailing slash so that
// ${API_BASE}/api/... never becomes ...app//api/... (double-slash redirect)
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/+$/, '');

export default API_BASE;
