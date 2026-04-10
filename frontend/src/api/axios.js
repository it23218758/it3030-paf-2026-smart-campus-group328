import axios from 'axios';

const envApiUrl = import.meta.env.VITE_API_URL?.trim();

const resolveApiBaseUrl = () => {
    if (envApiUrl) {
        return envApiUrl;
    }

    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8080';
    }

    // For LAN/mobile access, call backend on the same host as the frontend.
    return `http://${hostname}:8080`;
};

// Create axios instance with base configuration
const axiosInstance = axios.create({
    baseURL: resolveApiBaseUrl(),
    withCredentials: true, // Required for session/cookies
    timeout: 10000, // 10 second timeout
});

// Dynamically update baseURL based on current hostname
axiosInstance.interceptors.request.use(
    (config) => {
        // Keep base URL dynamic so requests work from laptop, phone, or tunnel URLs.
        config.baseURL = resolveApiBaseUrl();
        
        // Set Content-Type to application/json for non-FormData requests
        // FormData requests should not have Content-Type set (axios handles it automatically with boundary)
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        
        // Add dev role header if user is logged in via dev mode
        const devUser = localStorage.getItem('devUser');
        if (devUser) {
            try {
                const user = JSON.parse(devUser);
                if (user.role) {
                    config.headers['X-Dev-Role'] = user.role;
                }
            } catch (err) {
                console.error('Failed to parse dev user:', err);
            }
        }
        
        console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
        console.log('📦 Request Data:', config.data);
        console.log('🌐 Base URL:', config.baseURL);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.status, response.config.url);
        console.log('📥 Response Data:', response.data);
        return response;
    },
    (error) => {
        // Silently handle 401 errors for auth check endpoint
        if (error.response?.status === 401 && error.config?.url === '/api/auth/me') {
            console.log('👤 Not authenticated (expected during initial load)');
            return Promise.reject(error);
        }
        
        console.error('❌ API Error:', error.message);
        if (error.response) {
            console.error('📛 Error Response:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('📛 No Response Received - Check if backend is running and reachable from this device');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
