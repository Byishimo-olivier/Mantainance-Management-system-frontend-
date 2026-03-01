import axios from 'axios';

// Create an axios instance with default config
let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// ensure API prefix is included
if (!baseURL.endsWith('/api')) {
  baseURL = baseURL.replace(/\/+$/,'') + '/api';
}
console.log('[API Debug] VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('[API Debug] Using baseURL:', baseURL);

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
    (config) => {
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
