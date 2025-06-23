import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useLocation } from 'react-router-dom';
import { Mail, ScanLine, CheckCircle, AlertTriangle } from 'lucide-react';

const SettingsPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [scanResult, setScanResult] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('');

    const location = useLocation();

    // Lắng nghe query param từ URL sau khi Google redirect về
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const status = queryParams.get('status');
        if (status === 'google_connected') {
            setConnectionStatus('Kết nối với Google thành công!');
        } else if (status === 'google_error') {
            setConnectionStatus('Kết nối với Google thất bại. Vui lòng thử lại.');
        }
        // Xóa query param khỏi URL để không hiển thị lại khi refresh
        if (status) {
            window.history.replaceState({}, document.title, "/settings");
        }
    }, [location]);

    const handleConnectGoogle = async () => {
        try {
            const response = await api.get('/auth/google');
            const { authUrl } = response.data;
            if (authUrl) {
                window.location.href = authUrl;
            }
        } catch (error) {
            alert("Không thể bắt đầu quá trình kết nối với Google.");
        }
    };

    const handleScanEmails = async () => {
        setIsLoading(true);
        setScanResult('');
        try {
            const response = await api.post('/gmail/scan');
            setScanResult(response.data.message);
        } catch (error: any) {
            setScanResult(`Lỗi: ${error.response?.data?.message || 'Thao tác thất bại'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Cài đặt & Tích hợp</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Card Tích hợp Gmail */}
                <div className="p-6 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <Mail className="h-8 w-8 text-blue-500" />
                        <h2 className="ml-3 text-xl font-semibold text-gray-700">Tích hợp Gmail</h2>
                    </div>
                    <p className="text-gray-600 mt-2">Kết nối tài khoản Gmail của bạn để tự động quét và nhập các hóa đơn từ email. Ứng dụng sẽ chỉ yêu cầu quyền đọc email.</p>
                    <button onClick={handleConnectGoogle} className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700">
                        Kết nối với Google
                    </button>
                    {connectionStatus && 
                        <div className={`mt-4 flex items-center text-sm font-medium ${connectionStatus.includes('thất bại') ? 'text-red-600' : 'text-green-600'}`}>
                            {connectionStatus.includes('thất bại') ? <AlertTriangle size={16} className="mr-2" /> : <CheckCircle size={16} className="mr-2" />}
                            {connectionStatus}
                        </div>
                    }
                </div>

                {/* Card Quét Email */}
                <div className="p-6 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <ScanLine className="h-8 w-8 text-teal-500" />
                        <h2 className="ml-3 text-xl font-semibold text-gray-700">Quét hóa đơn thủ công</h2>
                    </div>
                    <p className="text-gray-600 mt-2">Sau khi kết nối, nhấn nút dưới đây để bắt đầu quét các email gần nhất có chứa hóa đơn (file .xlsx).</p>
                     <button onClick={handleScanEmails} disabled={isLoading} className="mt-4 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-sm hover:bg-teal-700 disabled:bg-gray-400">
                        {isLoading ? 'Đang quét...' : 'Bắt đầu quét Email'}
                    </button>
                    {scanResult && 
                        <div className="mt-4 p-4 bg-gray-50 border rounded-md text-gray-800">
                            <p className="font-medium">Kết quả:</p>
                            <p>{scanResult}</p>
                        </div>
                    }
                </div>
            </div>
        </>
    );
};

export default SettingsPage;
