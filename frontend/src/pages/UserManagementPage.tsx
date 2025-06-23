import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Edit, Trash2, UserPlus } from 'lucide-react';

// Interfaces
interface User {
    Id: number; HoVaTen: string; Email: string;
    VaiTro: 'QUANTRIVIEN' | 'KETOAN'; DangHoatDong: boolean;
}
type UserFormData = Omit<User, 'Id' | 'DangHoatDong'> & { MatKhau?: string };

const UserManagementPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { register, handleSubmit, reset, setValue } = useForm<UserFormData>();

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/company');
            setUsers(response.data);
        } catch (error) { console.error("Không thể tải danh sách người dùng", error); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const onSubmit: SubmitHandler<UserFormData> = async (data) => {
        try {
            if (editingUser) {
                // Logic cập nhật
                // Ensure MatKhau is not sent if it's an empty string during update
                const updateData: { HoVaTen: string; VaiTro: 'QUANTRIVIEN' | 'KETOAN'; MatKhau?: string } = {
                    HoVaTen: data.HoVaTen,
                    VaiTro: data.VaiTro
                };
                if (data.MatKhau) {
                    updateData.MatKhau = data.MatKhau;
                }
                await api.put(`/users/${editingUser.Id}`, updateData);
                alert("Cập nhật thành công!");
            } else {
                // Logic tạo mới
                await api.post('/users', data);
                alert("Tạo người dùng thành công!");
            }
            resetForm();
            fetchUsers();
        } catch (error: any) {
            alert(`Lỗi: ${error.response?.data?.message || 'Thao tác thất bại'}`);
        }
    };

    const resetForm = () => {
        setEditingUser(null);
        reset({ HoVaTen: '', Email: '', MatKhau: '', VaiTro: 'KETOAN' });
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setValue('HoVaTen', user.HoVaTen);
        setValue('Email', user.Email);
        setValue('VaiTro', user.VaiTro);
        setValue('MatKhau', ''); // Clear password field when editing
    };

    const handleDelete = async (user: User) => {
        if (window.confirm(`Bạn có chắc muốn xóa người dùng "${user.HoVaTen}"?`)) {
            try {
                await api.delete(`/users/${user.Id}`);
                alert("Xóa thành công!");
                if(editingUser?.Id === user.Id) resetForm();
                fetchUsers();
            } catch (error: any) {
                alert(`Lỗi: ${error.response?.data?.message || 'Xóa thất bại'}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8"> {/* Added a minimum height and padding to the overall container */}
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Quản lý Người dùng</h1> {/* Larger, bolder title, centered */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10"> {/* Increased gap */}
                {/* Form Section */}
                <div className="lg:col-span-1 bg-white p-8 rounded-xl shadow-lg h-fit"> {/* More padding, larger border radius, stronger shadow */}
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
                        <UserPlus size={24} className="mr-3 text-indigo-600"/> {/* Larger icon, colored */}
                        {editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5"> {/* Increased spacing */}
                        <div>
                            <label htmlFor="hoVaTen" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                            <input
                                id="hoVaTen"
                                {...register('HoVaTen', { required: 'Họ và tên không được để trống' })}
                                placeholder="Nhập họ và tên"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                            />
                            {/* Add error handling later if needed from react-hook-form */}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                id="email"
                                {...register('Email', { required: 'Email không được để trống' })}
                                placeholder="Nhập email"
                                type="email"
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                                disabled={!!editingUser}
                            />
                        </div>

                        {!editingUser && (
                            <div>
                                <label htmlFor="matKhau" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                                <input
                                    id="matKhau"
                                    {...register('MatKhau', { required: 'Mật khẩu không được để trống' })}
                                    placeholder="Nhập mật khẩu"
                                    type="password"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                />
                            </div>
                        )}
                         {editingUser && (
                            <div>
                                <label htmlFor="matKhau" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu (để trống nếu không đổi)</label>
                                <input
                                    id="matKhau"
                                    {...register('MatKhau')}
                                    placeholder="Để trống nếu không đổi mật khẩu"
                                    type="password"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="vaiTro" className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                            <select
                                id="vaiTro"
                                {...register('VaiTro')}
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                            >
                                <option value="KETOAN">Kế toán</option>
                                <option value="QUANTRIVIEN">Quản trị viên</option>
                            </select>
                        </div>

                        <div className="flex gap-4 pt-2"> {/* Increased gap and padding top */}
                            <button
                                type="submit"
                                className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 ease-in-out font-semibold shadow-md"
                            >
                                {editingUser ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                            {editingUser && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 bg-gray-300 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-400 transition duration-300 ease-in-out font-semibold shadow-md"
                                >
                                    Hủy
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* User Table Section */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden"> {/* Larger border radius, stronger shadow */}
                    <div className="overflow-x-auto"> {/* Added for better responsiveness on smaller screens */}
                        <table className="min-w-full text-sm divide-y divide-gray-200">
                            <thead className="bg-gray-100"> {/* Lighter header background */}
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                                            Không có người dùng nào.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user.Id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{user.HoVaTen}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.Email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.VaiTro === 'KETOAN' ? 'Kế toán' : 'Quản trị viên'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.DangHoatDong ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {user.DangHoatDong ? 'Hoạt động' : 'Khóa'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="text-indigo-600 hover:text-indigo-900 transition duration-150 ease-in-out"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit size={18}/>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={18}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagementPage;