import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import api from '../api/axios';
import { Edit, Trash2, UserPlus, Users } from 'lucide-react';

// --- Interfaces ---
interface Partner {
    Id: number; MaSoThue: string; TenDoiTac: string; DiaChi: string | null; LoaiDoiTac: 'KHACHHANG' | 'NHACUNGCAP';
}
type PartnerFormData = Omit<Partner, 'Id'>;

const PartnersPage = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

    const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<PartnerFormData>();

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const response = await api.get('/partners');
            setPartners(response.data);
        } catch (error) { console.error("Failed to fetch partners", error); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPartners(); }, []);

    const onSubmit: SubmitHandler<PartnerFormData> = async (data) => {
        try {
            if (editingPartner) {
                await api.put(`/partners/${editingPartner.Id}`, data);
                alert('Cập nhật đối tác thành công!');
            } else {
                await api.post('/partners', data);
                alert('Thêm đối tác thành công!');
            }
            resetForm();
            fetchPartners();
        } catch (error: any) {
            alert(`Lỗi: ${error.response?.data?.message || 'Thao tác thất bại'}`);
        }
    };
    
    const resetForm = () => {
        setEditingPartner(null);
        reset({ MaSoThue: '', TenDoiTac: '', DiaChi: '', LoaiDoiTac: 'KHACHHANG' });
    };

    const handleEdit = (partner: Partner) => {
        setEditingPartner(partner);
        setValue('MaSoThue', partner.MaSoThue);
        setValue('TenDoiTac', partner.TenDoiTac);
        setValue('DiaChi', partner.DiaChi || '');
        setValue('LoaiDoiTac', partner.LoaiDoiTac);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đối tác này?')) {
            try {
                await api.delete(`/partners/${id}`);
                alert('Xóa thành công!');
                if (editingPartner?.Id === id) resetForm();
                fetchPartners();
            } catch (error) { alert('Xóa thất bại.'); }
        }
    };
    
    return (
        <>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý Đối tác</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cột Form */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm h-fit">
                    <h2 className="text-xl font-bold mb-4 text-gray-700 flex items-center">
                        <UserPlus size={20} className="mr-2" />
                        {editingPartner ? 'Sửa Đối Tác' : 'Thêm Đối Tác Mới'}
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Mã số thuế</label>
                            <input {...register('MaSoThue', { required: true })} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" disabled={!!editingPartner} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Tên đối tác</label>
                            <input {...register('TenDoiTac', { required: true })} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Địa chỉ</label>
                            <input {...register('DiaChi')} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Loại đối tác</label>
                            <select {...register('LoaiDoiTac')} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="KHACHHANG">Khách hàng</option>
                                <option value="NHACUNGCAP">Nhà cung cấp</option>
                            </select>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
                                {isSubmitting ? 'Đang lưu...' : (editingPartner ? 'Lưu thay đổi' : 'Thêm mới')}
                            </button>
                            {editingPartner && (
                                <button type="button" onClick={resetForm} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                    Hủy
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Cột Bảng */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <Users className="h-5 w-5 mr-2" />
                            Danh sách Đối tác
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Tên Đối Tác</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">MST</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                                    <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading && <tr><td colSpan={4} className="text-center p-6 text-gray-500">Đang tải...</td></tr>}
                                {!loading && partners.length === 0 && <tr><td colSpan={4} className="text-center p-6 text-gray-500">Chưa có đối tác nào.</td></tr>}
                                {!loading && partners.map(p => (
                                    <tr key={p.Id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{p.TenDoiTac}</td>
                                        <td className="px-6 py-4 text-gray-500">{p.MaSoThue}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${p.LoaiDoiTac === 'KHACHHANG' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                {p.LoaiDoiTac === 'KHACHHANG' ? 'Khách hàng' : 'Nhà cung cấp'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 justify-center">
                                                <button title="Sửa" onClick={() => handleEdit(p)} className="p-2 text-gray-500 rounded-full hover:bg-blue-100 hover:text-blue-600"><Edit size={16} /></button>
                                                <button title="Xóa" onClick={() => handleDelete(p.Id)} className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PartnersPage;
