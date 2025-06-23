import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
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

//Interceptor để xử lý lỗi xác thực trên mỗi PHẢN HỒI (RESPONSE)
api.interceptors.response.use(
    (response) => {
        // Bất kỳ status code nào nằm trong khoảng 2xx sẽ đi vào đây
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
