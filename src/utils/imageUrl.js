/**
 * Build a safe image URL from a backend path.
 * Returns null if the path is missing, the literal string "null", or "undefined".
 * Handles absolute URLs (already starting with http) by returning them as-is.
 */
export function getImageUrl(path) {
    if (!path || path === 'null' || path === 'undefined') return null;
    // Already a full URL
    if (path.startsWith('http')) return path;
    const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}
