const xlsx = require('xlsx');
const prisma = require('../config/prisma');
const { logAction } = require('../services/logging.service');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

function convertExcelDate(excelDate) {
    const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
    return jsDate;
}

exports.uploadInvoices = async (req, res) => {
    const { companyId, id: userId } = req.user;

    if (!req.file) {
        return res.status(400).json({ message: "Vui lòng tải lên một file." });
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName]; 
        const data = xlsx.utils.sheet_to_json(sheet, { raw: true });

        if (data.length === 0) {
            return res.status(400).json({ message: "File Excel rỗng." });
        }

        const invoicesToCreate = [];
        const errors = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const lineNumber = i + 2;

            if (!row.SoHoaDon || !row.NgayPhatHanh || row.TienTruocThue == null || row.ThueSuatVAT == null) {
                errors.push(`Dòng ${lineNumber}: Thiếu dữ liệu bắt buộc.`);
                continue;
            }
            
            let issueDate;
            if (typeof row.NgayPhatHanh === 'number') {
                issueDate = convertExcelDate(row.NgayPhatHanh);
            } else if (typeof row.NgayPhatHanh === 'string') {
                const parsedDate = dayjs(row.NgayPhatHanh, ["YYYY-MM-DD", "DD/MM/YYYY", "D/M/YYYY"], true);
                if (parsedDate.isValid()) {
                    issueDate = parsedDate.toDate();
                }
            }

            if (!issueDate || isNaN(issueDate.getTime())) {
                 errors.push(`Dòng ${lineNumber}: Định dạng ngày không hợp lệ. Hãy đảm bảo cột ngày tháng được định dạng là "Date" trong Excel.`);
                 continue;
            }

            const tienTruocThue = parseFloat(row.TienTruocThue);
            const thueSuatVAT = parseInt(row.ThueSuatVAT);

            if (isNaN(tienTruocThue) || isNaN(thueSuatVAT)) {
                errors.push(`Dòng ${lineNumber}: Tiền hoặc Thuế suất không phải là số.`);
                continue;
            }

            invoicesToCreate.push({
                IdCongTy: companyId,
                KyHieuHoaDon: String(row.KyHieuHoaDon || ''),
                SoHoaDon: String(row.SoHoaDon),
                NgayPhatHanh: issueDate,
                LoaiHoaDon: String(row.LoaiHoaDon).toUpperCase() === 'DAUVAO' ? 'DAUVAO' : 'DAURA',
                TienTruocThue: tienTruocThue,
                ThueSuatVAT: thueSuatVAT,
            });
        }

        if (errors.length > 0) {
            return res.status(400).json({
                message: "File của bạn có lỗi. Vui lòng sửa các lỗi sau và tải lên lại:",
                errors: errors
            });
        }

        const result = await prisma.HoaDon.createMany({
            data: invoicesToCreate,
            skipDuplicates: true,
        });

        await logAction(userId, companyId, 'UPLOAD_INVOICES', { file: req.file.originalname, addedCount: result.count });
        res.status(201).json({ message: `Tải lên thành công! Đã thêm ${result.count} hóa đơn mới.` });

    } catch (error) {
        console.error("Lỗi khi xử lý file Excel:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi xử lý file." });
    }
};

// --- NÂNG CẤP HÀM NÀY ---
exports.getInvoices = async (req, res) => {
    const { companyId } = req.user;
    // Lấy các tham số lọc từ query string
    const { keyword, loaiHoaDon, startDate, endDate } = req.query;

    try {
        // Xây dựng điều kiện lọc động
        const whereClause = {
            IdCongTy: companyId,
        };

        if (keyword) {
            whereClause.SoHoaDon = {
                contains: keyword,
                mode: 'insensitive', // Tìm kiếm không phân biệt hoa thường
            };
        }

        if (loaiHoaDon) {
            whereClause.LoaiHoaDon = loaiHoaDon;
        }

        if (startDate && endDate) {
            whereClause.NgayPhatHanh = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        const invoices = await prisma.HoaDon.findMany({
            where: whereClause, // Áp dụng điều kiện lọc
            orderBy: {
                NgayPhatHanh: 'desc',
            },
            take: 500, // Giới hạn kết quả để đảm bảo hiệu năng
        });
        res.status(200).json(invoices);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách hóa đơn:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi ở máy chủ." });
    }
};
