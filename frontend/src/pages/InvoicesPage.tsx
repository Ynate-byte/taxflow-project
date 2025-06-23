import { useState, useEffect, ChangeEvent, useCallback } from 'react';
import api from '../api/axios';
import { UploadCloud, FileText, Search, XCircle } from 'lucide-react';

// --- Interfaces & Custom Hooks ---

interface Invoice {
    Id: number;
    KyHieuHoaDon: string;
    SoHoaDon: string;
    NgayPhatHanh: string;
    LoaiHoaDon: 'DAUVAO' | 'DAURA';
    TienTruocThue: number;
    ThueSuatVAT: number;
    TienThueVAT: number;
    TongTien: number;
}

interface Filters {
    keyword: string;
    loaiHoaDon: string;
    startDate: string;
    endDate: string;
}

// Custom hook để "trì hoãn" việc gọi API khi người dùng đang gõ tìm kiếm
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


const InvoicesPage = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Bắt đầu với true để fetch lần đầu
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [errorDetails, setErrorDetails] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // State cho bộ lọc
    const [filters, setFilters] = useState<Filters>({ keyword: '', loaiHoaDon: '', startDate: '', endDate: '' });
    const debouncedKeyword = useDebounce(filters.keyword, 500); // Trì hoãn 500ms

    const fetchInvoices = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedKeyword) params.append('keyword', debouncedKeyword);
            if (filters.loaiHoaDon) params.append('loaiHoaDon', filters.loaiHoaDon);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            
            const response = await api.get('/invoices', { params });
            setInvoices(response.data);
        } catch (err) {
            console.error('Không thể tải danh sách hóa đơn.', err);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedKeyword, filters.loaiHoaDon, filters.startDate, filters.endDate]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const clearFilters = () => {
        setFilters({ keyword: '', loaiHoaDon: '', startDate: '', endDate: '' });
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFile(event.target.files[0]);
            setUploadError('');
            setErrorDetails([]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        setUploadError('');
        setErrorDetails([]);

        const formData = new FormData();
        formData.append('invoiceFile', selectedFile);

        try {
            const response = await api.post('/invoices/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert(response.data.message);
            fetchInvoices(); // Tải lại danh sách sau khi upload thành công
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Upload thất bại.';
            const details = err.response?.data?.errors || [];
            setUploadError(errorMessage);
            setErrorDetails(details);
        } finally {
            setIsUploading(false);
            setSelectedFile(null);
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        }
    };

    return (
        <>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý Hóa đơn</h1>
            
            {/* Vùng Upload */}
            <div className="p-6 mb-8 bg-white border border-dashed border-gray-300 rounded-lg text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <h2 className="mt-2 text-lg font-semibold text-gray-700">Tải lên bảng kê hóa đơn</h2>
                <p className="mt-1 text-sm text-gray-500">Kéo và thả file hoặc chọn file từ máy tính (.xlsx, .xls)</p>
                <div className="mt-4 flex justify-center items-center gap-4">
                    <input
                        id="file-upload" type="file" onChange={handleFileChange} accept=".xlsx, .xls"
                        className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Chọn file
                    </label>
                    <button
                        onClick={handleUpload}
                        disabled={isUploading || !selectedFile}
                        className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                        {isUploading ? 'Đang xử lý...' : 'Tải lên'}
                    </button>
                </div>
                 {selectedFile && <p className="mt-2 text-sm text-gray-600">Đã chọn: <span className="font-medium">{selectedFile.name}</span></p>}

                {uploadError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-left max-w-2xl mx-auto">
                        <p className="font-semibold text-red-800">{uploadError}</p>
                        {errorDetails.length > 0 && (
                            <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                                {errorDetails.map((detail, index) => <li key={index}>{detail}</li>)}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {/* Vùng Lọc và Tìm kiếm - ĐÃ SỬA LỖI */}
            <div className="p-4 mb-6 bg-white rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Tìm theo số hóa đơn</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="text" name="keyword" value={filters.keyword} onChange={handleFilterChange} placeholder="Nhập số hóa đơn..."
                                className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Loại hóa đơn</label>
                        <select name="loaiHoaDon" value={filters.loaiHoaDon} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">Tất cả</option>
                            <option value="DAUVAO">Đầu vào</option>
                            <option value="DAURA">Đầu ra</option>
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
                        <XCircle size={16} /> Xóa lọc
                    </button>
                </div>
            </div>

            {/* Bảng hiển thị */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Danh sách Hóa đơn
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Số HĐ</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Ngày HĐ</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                                <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Tiền hàng (VNĐ)</th>
                                <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Thuế GTGT (VNĐ)</th>
                                <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Tổng tiền (VNĐ)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                             {isLoading && (
                                <tr>
                                    <td colSpan={6} className="text-center p-6 text-gray-500">Đang tải dữ liệu...</td>
                                </tr>
                            )}
                            {!isLoading && invoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center p-6 text-gray-500">Không tìm thấy hóa đơn nào phù hợp.</td>
                                </tr>
                            )}
                            {!isLoading && invoices.map((invoice) => (
                                <tr key={invoice.Id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{`${invoice.KyHieuHoaDon} - ${invoice.SoHoaDon}`}</td>
                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{new Date(invoice.NgayPhatHanh).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${invoice.LoaiHoaDon === 'DAUVAO' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                            {invoice.LoaiHoaDon === 'DAUVAO' ? 'ĐẦU VÀO' : 'ĐẦU RA'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500 whitespace-nowrap">{invoice.TienTruocThue.toLocaleString('vi-VN')}</td>
                                    <td className="px-6 py-4 text-right text-gray-500 whitespace-nowrap">{invoice.TienThueVAT.toLocaleString('vi-VN')}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-gray-900 whitespace-nowrap">{invoice.TongTien.toLocaleString('vi-VN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default InvoicesPage;
