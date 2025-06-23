exports.getReportHtml = (data) => {
    const { company, quarter, year, totalInputVat, totalOutputVat, taxPayable } = data;
    const generationDate = new Date().toLocaleDateString('vi-VN');

    return `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Báo cáo thuế GTGT</title>
            <style>
                body { 
                    font-family: 'Helvetica', 'Arial', sans-serif; 
                    font-size: 12px; 
                    color: #333; 
                    -webkit-print-color-adjust: exact; /* Đảm bảo in màu nền trên trình duyệt dựa trên WebKit */
                }
                .container { 
                    width: 90%; 
                    margin: auto; 
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 40px; 
                }
                .header h1 { 
                    margin: 0; 
                    font-size: 24px; 
                }
                .header h2 { 
                    margin: 5px 0; 
                    font-size: 18px; 
                    font-weight: normal;
                    color: #555; 
                }
                .info { 
                    margin-bottom: 30px; 
                    border: 1px solid #eee; 
                    padding: 15px; 
                    border-radius: 5px; 
                }
                .info p { 
                    margin: 8px 0; 
                }
                .summary-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px; 
                }
                .summary-table th, .summary-table td { 
                    border: 1px solid #ddd; 
                    padding: 10px; 
                    text-align: left; 
                }
                .summary-table th { 
                    background-color: #f7f7f7; 
                    font-weight: bold;
                }
                .summary-table td.amount { 
                    text-align: right; 
                    font-weight: bold; 
                }
                .final-row {
                    background-color: #e6f7ff;
                    font-weight: bold;
                }
                .footer { 
                    text-align: right; 
                    margin-top: 50px; 
                    font-style: italic; 
                    color: #888; 
                }
                .signature {
                    margin-top: 80px;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>BÁO CÁO TỔNG HỢP THUẾ GIÁ TRỊ GIA TĂNG</h1>
                    <h2>(Quý ${quarter} Năm ${year})</h2>
                </div>
                <div class="info">
                    <p><strong>Tên công ty:</strong> ${company.TenCongTy}</p>
                    <p><strong>Mã số thuế:</strong> ${company.MaSoThue}</p>
                    <p><strong>Địa chỉ:</strong> ${company.DiaChi || 'Chưa cập nhật'}</p>
                </div>
                <table class="summary-table">
                    <thead>
                        <tr>
                            <th>Chỉ tiêu</th>
                            <th>Số tiền (VNĐ)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1. Tổng thuế GTGT đầu vào được khấu trừ</td>
                            <td class="amount">${totalInputVat.toLocaleString('vi-VN')}</td>
                        </tr>
                        <tr>
                            <td>2. Tổng thuế GTGT đầu ra</td>
                            <td class="amount">${totalOutputVat.toLocaleString('vi-VN')}</td>
                        </tr>
                        <tr class="final-row">
                            <td><strong>3. Thuế GTGT phải nộp (hoặc được hoàn) [2-1]</strong></td>
                            <td class="amount">${taxPayable.toLocaleString('vi-VN')}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="footer">
                    <p>Ngày tạo báo cáo: ${generationDate}</p>
                    <p class="signature">Kế toán trưởng</p>
                </div>
            </div>
        </body>
        </html>
    `;
};