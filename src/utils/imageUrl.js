/**
 * Build a safe image URL from a backend path.
 * Returns null if the path is missing, the literal string "null", or "undefined".
 * Handles absolute URLs (already starting with http) by returning them as-is.
 */
export function getImageUrl(path) {
    if (!path || path === 'null' || path === 'undefined') return null;
    const value = String(path).trim();
    // Already a full URL
    if (
        value.startsWith('http') ||
        value.startsWith('//') ||
        value.startsWith('data:') ||
        value.startsWith('blob:') ||
        value.startsWith('file:')
    ) {
        return value;
    }
    // Prefer explicit VITE_API_URL configured at build time
    let base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    // Fallback to a runtime-provided global or current origin (best-effort)
    if (!base) {
        if (typeof window !== 'undefined' && window.__BACKEND_URL__) base = String(window.__BACKEND_URL__).replace(/\/$/, '');
        else if (typeof window !== 'undefined' && window.location && window.location.origin) base = String(window.location.origin).replace(/\/$/, '');
    }
    // If still empty, return the raw path (browser will resolve relative to current origin)
    if (!base) return value;
    return `${base}${value.startsWith('/') ? '' : '/'}${value}`;
}
