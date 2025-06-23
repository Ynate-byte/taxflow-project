import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Trash2, Download, Send, Check, X } from 'lucide-react';

// --- Interfaces ---
interface ApprovalHistory {
    BinhLuan: string | null;
    NguoiDung: { HoVaTen: string };
}

interface Report {
    Id: number;
    NamBaoCao: number;
    QuyBaoCao: number;
    TrangThai: 'NHAP' | 'CHODUYET' | 'DADUYET' | 'BITUCHOI';
    TongThueDauVao: number;
    TongThueDauRa: number;
    ThuePhaiNop: number;
    NguoiDung?: { HoVaTen: string };
    NgayCapNhat: string;
    LichSuDuyetBaoCao: ApprovalHistory[];
}

// --- Helper function để hiển thị trạng thái ---
const getStatusChip = (status: Report['TrangThai']) => {
    const styles: { [key: string]: string } = {
        NHAP: "bg-gray-100 text-gray-800",
        CHODUYET: "bg-yellow-100 text-yellow-800",
        DADUYET: "bg-green-100 text-green-800",
        BITUCHOI: "bg-red-100 text-red-800",
    };
    const text: { [key: string]: string } = {
        NHAP: "Bản nháp",
        CHODUYET: "Chờ duyệt",
        DADUYET: "Đã duyệt",
        BITUCHOI: "Bị từ chối",
    };
    return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>;
};

const ReportsPage = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reports');
            setReports(response.data);
        } catch (err) {
            setError('Không thể tải danh sách báo cáo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa báo cáo này? Hành động này không thể hoàn tác.')) {
            try {
                await api.delete(`/reports/${id}`);
                alert('Xóa thành công!');
                fetchReports(); // Tải lại danh sách
            } catch (err) {
                alert('Xóa thất bại.');
            }
        }
    };

    const handleAction = async (action: 'submit' | 'approve' | 'reject', id: number) => {
        const url = `/reports/${id}/${action}`;
        let payload = {};
        let confirmMessage = 'Bạn có chắc chắn muốn thực hiện thao tác này?';
        
        if (action === 'reject') {
            const reason = prompt("Vui lòng nhập lý do từ chối:");
            if (!reason) return; // Người dùng hủy hoặc không nhập lý do
            payload = { binhLuan: reason };
        }

        if (window.confirm(confirmMessage)) {
            try {
                await api.post(url, payload);
                alert('Thao tác thành công!');
                fetchReports(); // Tải lại dữ liệu
            } catch (error: any) {
                alert(`Lỗi: ${error.response?.data?.message || 'Thao tác thất bại'}`);
            }
        }
    };

    const handleDownloadPdf = async (report: Report) => {
        try {
            const response = await api.get(`/reports/generate-pdf?year=${report.NamBaoCao}&quarter=${report.QuyBaoCao}`, {
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `BaoCaoThue_Q${report.QuyBaoCao}_${report.NamBaoCao}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("Không thể tạo báo cáo PDF.");
        }
    };

    return (
        <>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Lịch sử Báo cáo Thuế</h1>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Kỳ Báo Cáo</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                                <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Thuế Đầu Vào (VNĐ)</th>
                                <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Thuế Đầu Ra (VNĐ)</th>
                                <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Số Thuế</th>
                                <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="text-center p-6 text-gray-500">Đang tải dữ liệu...</td>
                                </tr>
                            )}
                            {!loading && error && (
                                <tr>
                                    <td colSpan={6} className="text-center p-6 text-red-500">{error}</td>
                                </tr>
                            )}
                            {!loading && reports.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center p-6 text-gray-500">Chưa có báo cáo nào để hiển thị.</td>
                                </tr>
                            )}
                            {!loading && reports.map((report) => (
                                <tr key={report.Id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">Quý {report.QuyBaoCao}/{report.NamBaoCao}</td>
                                    <td className="px-6 py-4">
                                        {getStatusChip(report.TrangThai)}
                                        {report.TrangThai === 'BITUCHOI' && report.LichSuDuyetBaoCao.length > 0 && (
                                            <p className="text-xs text-red-500 mt-1 italic" title={`Bởi ${report.LichSuDuyetBaoCao[0].NguoiDung.HoVaTen}`}>
                                                Lý do: {report.LichSuDuyetBaoCao[0].BinhLuan}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500">{report.TongThueDauVao.toLocaleString('vi-VN')}</td>
                                    <td className="px-6 py-4 text-right text-gray-500">{report.TongThueDauRa.toLocaleString('vi-VN')}</td>
                                    <td className={`px-6 py-4 text-right font-bold ${report.ThuePhaiNop < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {report.ThuePhaiNop.toLocaleString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-center">
                                            {user?.role === 'KETOAN' && (report.TrangThai === 'NHAP' || report.TrangThai === 'BITUCHOI') &&
                                                <button title="Trình duyệt" onClick={() => handleAction('submit', report.Id)} className="p-2 text-gray-500 rounded-full hover:bg-blue-100 hover:text-blue-600"><Send size={16} /></button>
                                            }
                                            {user?.role === 'QUANTRIVIEN' && report.TrangThai === 'CHODUYET' && (
                                                <>
                                                    <button title="Phê duyệt" onClick={() => handleAction('approve', report.Id)} className="p-2 text-gray-500 rounded-full hover:bg-green-100 hover:text-green-600"><Check size={16} /></button>
                                                    <button title="Từ chối" onClick={() => handleAction('reject', report.Id)} className="p-2 text-gray-500 rounded-full hover:bg-yellow-100 hover:text-yellow-600"><X size={16} /></button>
                                                </>
                                            )}
                                            <button title="Tải PDF" onClick={() => handleDownloadPdf(report)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700"><Download size={16} /></button>
                                            {(report.TrangThai === 'NHAP' || report.TrangThai === 'BITUCHOI') &&
                                                <button title="Xóa báo cáo" onClick={() => handleDelete(report.Id)} className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600"><Trash2 size={16} /></button>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ReportsPage;
