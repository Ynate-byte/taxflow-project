import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { VenetianMask, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Địa chỉ email không hợp lệ'),
    matKhau: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const { login } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const response = await api.post('/auth/login', data);
            login(response.data.token, response.data.user);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                alert(`Lỗi: ${error.response.data.message}`);
            } else {
                alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="flex justify-center mx-auto w-fit mb-4">
                         <VenetianMask className="h-12 w-12 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Đăng nhập vào TaxFlow
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Chào mừng trở lại!
                    </p>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input 
                            {...register('email')} 
                            id="email" 
                            type="email" 
                            placeholder="Email"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input 
                            {...register('matKhau')} 
                            id="matKhau" 
                            type="password" 
                            placeholder="Mật khẩu"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                        />
                        {errors.matKhau && <p className="mt-1 text-xs text-red-600">{errors.matKhau.message}</p>}
                    </div>
                    <div>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Đang xử lý...' : 'Đăng Nhập'}
                        </button>
                    </div>
                </form>

                <p className="text-sm text-center text-gray-600">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
