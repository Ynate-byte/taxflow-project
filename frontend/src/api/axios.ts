import axios from 'axios';

const api = axios.create({
    // Sử dụng biến môi trường được inject bởi Vite/Vercel
    baseURL: import.meta.env.VITE_REACT_APP_API_URL, 
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                alert('Phiên đăng nhập của bạn đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;