import { useEffect, useState, ChangeEvent } from 'react';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Interface để định nghĩa kiểu dữ liệu cho báo cáo
interface ReportSummary {
  Id: number;
  NamBaoCao: number;
  QuyBaoCao: number;
  TrangThai: string;
  TongThueDauVao: number;
  TongThueDauRa: number;
  ThuePhaiNop: number;
}

// Component thẻ hiển thị số liệu
const StatCard = ({ title, value, colorClass }: { title: string; value: number; colorClass: string }) => (
  <div className={`p-6 bg-white border rounded-lg shadow-sm ${colorClass}`}>
    <h3 className="text-lg font-medium text-gray-500">{title}</h3>
    <p className="mt-2 text-4xl font-bold text-gray-900">{value.toLocaleString('vi-VN')} VNĐ</p>
  </div>
);

const DashboardPage = () => {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/reports/summary?year=${year}&quarter=${quarter}`);
        setSummary(response.data);
      } catch (err) {
        setError(`Không thể tải dữ liệu cho Quý ${quarter}/${year}. Có thể chưa có hóa đơn nào trong kỳ này.`);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [year, quarter]);

  const handleDownloadPdf = async () => {
    if (!summary) {
        alert("Không có dữ liệu để tạo báo cáo.");
        return;
    }
    setIsGeneratingPdf(true);
    try {
        const response = await api.get(`/reports/generate-pdf?year=${summary.NamBaoCao}&quarter=${summary.QuyBaoCao}`, {
            responseType: 'blob',
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `BaoCaoThue_Q${summary.QuyBaoCao}_${summary.NamBaoCao}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error("Lỗi khi tải PDF:", err);
        alert("Không thể tạo báo cáo PDF.");
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  const chartData = summary ? [
    {
      name: `Quý ${summary.QuyBaoCao}/${summary.NamBaoCao}`,
      'Thuế GTGT Đầu vào': summary.TongThueDauVao,
      'Thuế GTGT Đầu ra': summary.TongThueDauRa,
    },
  ] : [];

  return (
    // Sử dụng Fragment <> để bọc component vì layout đã có thẻ div bao ngoài
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Bảng điều khiển</h1>
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
          <label htmlFor="year-select" className="font-medium text-gray-700">Xem báo cáo:</label>
          <select id="quarter-select" value={quarter} onChange={(e: ChangeEvent<HTMLSelectElement>) => setQuarter(Number(e.target.value))} className="p-2 border rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500">
            <option value={1}>Quý 1</option>
            <option value={2}>Quý 2</option>
            <option value={3}>Quý 3</option>
            <option value={4}>Quý 4</option>
          </select>
          <select id="year-select" value={year} onChange={(e: ChangeEvent<HTMLSelectElement>) => setYear(Number(e.target.value))} className="p-2 border rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500">
            {[2025, 2024, 2023].map(y => <option key={y} value={y}>Năm {y}</option>)}
          </select>
        </div>
      </div>
      
      {loading && <div className='mt-8 text-center text-lg'>Đang tải dữ liệu...</div>}
      {error && !loading && <div className='mt-8 text-center text-red-600 p-4 bg-red-50 rounded-lg'>{error}</div>}

      {summary && !loading && (
        <main>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard title="Tổng thuế GTGT đầu vào" value={summary.TongThueDauVao} colorClass="border-blue-300" />
            <StatCard title="Tổng thuế GTGT đầu ra" value={summary.TongThueDauRa} colorClass="border-green-300" />
            <StatCard title="Thuế phải nộp / được hoàn" value={summary.ThuePhaiNop} colorClass={summary.ThuePhaiNop >= 0 ? "border-red-300" : "border-teal-300"} />
          </div>

          <div className="p-6 mt-8 bg-white border rounded-lg shadow">
            <div className='flex justify-between items-center'>
              <h3 className="text-xl font-semibold text-gray-800">So sánh Thuế GTGT (Quý {summary.QuyBaoCao}/{summary.NamBaoCao})</h3>
              <button 
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="px-6 py-2 font-semibold text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-gray-400"
              >
                  {isGeneratingPdf ? 'Đang tạo...' : 'Tải Báo cáo PDF'}
              </button>
            </div>
            <div style={{ width: '100%', height: 400 }} className="mt-4">
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => new Intl.NumberFormat('vi-VN').format(value)} />
                  <Tooltip formatter={(value: number, name: string) => [`${value.toLocaleString('vi-VN')} VNĐ`, name]} />
                  <Legend />
                  <Bar dataKey="Thuế GTGT Đầu vào" fill="#3b82f6" />
                  <Bar dataKey="Thuế GTGT Đầu ra" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      )}
    </>
  );
};

export default DashboardPage;
