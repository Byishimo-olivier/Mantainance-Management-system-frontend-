import axios from 'axios';


let baseURL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/,'') : '';
console.log('[API Debug] VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('[API Debug] Using baseURL:', baseURL || '(relative)');

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token in all requests
// prepend /api to any relative URL that doesn't already start with it
api.interceptors.request.use(
    (config) => {
        if (config.url && typeof config.url === 'string' && !config.url.match(/^https?:\/\//i)) {
            if (!config.url.startsWith('/api')) {
                // avoid double slashes
                config.url = '/api' + (config.url.startsWith('/') ? '' : '/') + config.url;
            }
        }
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            const token = localStorage.getItem('token');
            if (token) {
                console.warn('[API Auth] 401 Unauthorized detected with token. Clearing session.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Check if we're not already on the login page to avoid infinite loops
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            } else {
                console.warn('[API Auth] 401 Unauthorized detected as guest. No redirect.');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
