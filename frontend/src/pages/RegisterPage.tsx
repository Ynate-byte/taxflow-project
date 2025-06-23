import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { VenetianMask } from 'lucide-react';

const registerSchema = z.object({
    tenCongTy: z.string().min(3, 'Tên công ty phải có ít nhất 3 ký tự'),
    maSoThue: z.string().regex(/^[0-9]{10,13}$/, 'Mã số thuế không hợp lệ (10 hoặc 13 số)'),
    hoVaTen: z.string().min(3, 'Họ và tên phải có ít nhất 3 ký tự'),
    email: z.string().email('Địa chỉ email không hợp lệ'),
    matKhau: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            const response = await api.post('/auth/register', data);
            alert(response.data.message + "\nBây giờ bạn có thể đăng nhập.");
            navigate('/login');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                alert(`Lỗi: ${error.response.data.message}`);
            } else {
                alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="flex justify-center mx-auto w-fit mb-4">
                         <VenetianMask className="h-12 w-12 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Tạo tài khoản TaxFlow
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Bắt đầu quản lý thuế một cách hiệu quả.
                    </p>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên công ty</label>
                            <input {...register('tenCongTy')} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                            {errors.tenCongTy && <p className="mt-1 text-xs text-red-600">{errors.tenCongTy.message}</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Mã số thuế</label>
                            <input {...register('maSoThue')} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                            {errors.maSoThue && <p className="mt-1 text-xs text-red-600">{errors.maSoThue.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Họ và tên người quản trị</label>
                        <input {...register('hoVaTen')} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                        {errors.hoVaTen && <p className="mt-1 text-xs text-red-600">{errors.hoVaTen.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input {...register('email')} type="email" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                        <input {...register('matKhau')} type="password" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                        {errors.matKhau && <p className="mt-1 text-xs text-red-600">{errors.matKhau.message}</p>}
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={isSubmitting} className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
                            {isSubmitting ? 'Đang xử lý...' : 'Đăng Ký'}
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
