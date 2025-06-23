import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { XCircle } from 'lucide-react';

// --- Interfaces ---
interface LogEntry {
    Id: number; LoaiHanhDong: string; ChiTiet: any; ThoiGian: string;
    NguoiDung?: { HoVaTen: string };
}
interface UserAccount { Id: number; HoVaTen: string; }
interface Filters { userId: string; actionType: string; startDate: string; endDate: string; }

const AuditLogPage = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [users, setUsers] = useState<UserAccount[]>([]);
    const [actionTypes, setActionTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<Filters>({ userId: '', actionType: '', startDate: '', endDate: '' });

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.userId) params.append('userId', filters.userId);
            if (filters.actionType) params.append('actionType', filters.actionType);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await api.get('/logs', { params });
            setLogs(response.data.logs);
            setActionTypes(response.data.actionTypes);
        } catch (error) {
            console.error("Không thể tải nhật ký", error);
            alert("Bạn không có quyền truy cập trang này hoặc đã có lỗi xảy ra.");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users/company');
                setUsers(response.data);
            } catch (error) { console.error("Không thể tải danh sách người dùng", error); }
        };
        fetchUsers();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const clearFilters = () => {
        setFilters({ userId: '', actionType: '', startDate: '', endDate: '' });
    };

    return (
        <>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Nhật ký Hệ thống</h1>

            {/* Bộ lọc */}
            <div className="p-4 mb-6 bg-white rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Người dùng</label>
                        <select name="userId" value={filters.userId} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">Tất cả</option>
                            {users.map(user => <option key={user.Id} value={user.Id}>{user.HoVaTen}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Hành động</label>
                        <select name="actionType" value={filters.actionType} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">Tất cả</option>
                            {actionTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Từ ngày</label>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Đến ngày</label>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <button onClick={clearFilters} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold flex items-center justify-center gap-2">
                        <XCircle size={16} />
                        Xóa lọc
                    </button>
                </div>
            </div>

            {/* Bảng hiển thị */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Người thực hiện</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && <tr><td colSpan={4} className="text-center p-6 text-gray-500">Đang tải...</td></tr>}
                            {!loading && logs.length === 0 && <tr><td colSpan={4} className="text-center p-6 text-gray-500">Không tìm thấy nhật ký nào.</td></tr>}
                            {!loading && logs.map((log) => (
                                <tr key={log.Id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(log.ThoiGian).toLocaleString('vi-VN')}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{log.NguoiDung?.HoVaTen || 'Hệ thống'}</td>
                                    <td className="px-6 py-4 font-mono text-blue-600">{log.LoaiHanhDong}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{JSON.stringify(log.ChiTiet)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AuditLogPage;
