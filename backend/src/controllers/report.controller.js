const prisma = require('../../config/prisma.js');
const puppeteer = require('puppeteer'); 
const { getReportHtml } = require('../services/pdfTemplate');
const { logAction } = require('../services/logging.service');

exports.getSummary = async (req, res) => {
    const { companyId, id: userId } = req.user;
    const { year, quarter } = req.query;

    if (!year || !quarter) {
        return res.status(400).json({ message: 'Vui lòng cung cấp năm và quý.' });
    }

    const numYear = parseInt(year);
    const numQuarter = parseInt(quarter);

    const startDate = new Date(numYear, (numQuarter - 1) * 3, 1);
    const endDate = new Date(numYear, numQuarter * 3, 0);

    try {
        const inputVatAggregation = await prisma.HoaDon.aggregate({
            _sum: { TienThueVAT: true },
            where: { IdCongTy: companyId, LoaiHoaDon: 'DAUVAO', NgayPhatHanh: { gte: startDate, lte: endDate } },
        });
        const outputVatAggregation = await prisma.HoaDon.aggregate({
            _sum: { TienThueVAT: true },
            where: { IdCongTy: companyId, LoaiHoaDon: 'DAURA', NgayPhatHanh: { gte: startDate, lte: endDate } },
        });

        const totalInputVat = inputVatAggregation._sum.TienThueVAT || 0;
        const totalOutputVat = outputVatAggregation._sum.TienThueVAT || 0;
        const taxPayable = totalOutputVat - totalInputVat;

        const report = await prisma.BaoCaoThue.upsert({
            where: {
                IdCongTy_NamBaoCao_QuyBaoCao: {
                    IdCongTy: companyId,
                    NamBaoCao: numYear,
                    QuyBaoCao: numQuarter,
                },
            },
            update: {
                TongThueDauVao: totalInputVat,
                TongThueDauRa: totalOutputVat,
                ThuePhaiNop: taxPayable,
            },
            create: {
                IdCongTy: companyId,
                IdNguoiTao: userId,
                NamBaoCao: numYear,
                QuyBaoCao: numQuarter,
                TongThueDauVao: totalInputVat,
                TongThueDauRa: totalOutputVat,
                ThuePhaiNop: taxPayable,
                TrangThai: 'NHAP',
            },
        });
        
        await logAction(userId, companyId, 'GET_REPORT_SUMMARY', { reportId: report.Id, year, quarter });
        res.status(200).json(report);

    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tóm tắt:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi xử lý yêu cầu.' });
    }
};

exports.getReports = async (req, res) => {
    const { companyId } = req.user;
    try {
        const reports = await prisma.BaoCaoThue.findMany({
            where: { IdCongTy: companyId },
            orderBy: [{ NamBaoCao: 'desc' }, { QuyBaoCao: 'desc' }],
            include: { 
                NguoiDung: { select: { HoVaTen: true } },
                LichSuDuyetBaoCao: {
                    orderBy: { NgayDuyet: 'desc' },
                    include: { NguoiDung: { select: { HoVaTen: true } } }
                }
            }
        });
        res.status(200).json(reports);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách báo cáo:", error);
        res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
};

exports.deleteReport = async (req, res) => {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;
    try {
        const reportToDelete = await prisma.BaoCaoThue.findFirst({
            where: { Id: parseInt(id), IdCongTy: companyId }
        });

        if (!reportToDelete) {
            return res.status(404).json({ message: "Không tìm thấy báo cáo hoặc bạn không có quyền xóa." });
        }

        await prisma.BaoCaoThue.delete({
            where: { Id: parseInt(id) }
        });

        await logAction(userId, companyId, 'DELETE_REPORT', { reportId: id });
        res.status(200).json({ message: 'Xóa báo cáo thành công.' });
    } catch (error) {
        console.error("Lỗi khi xóa báo cáo:", error);
        res.status(500).json({ message: 'Không thể xóa báo cáo.' });
    }
};

exports.generatePdfReport = async (req, res) => {
    const { companyId } = req.user;
    const { year, quarter } = req.query;

    if (!year || !quarter) {
        return res.status(400).json({ message: 'Vui lòng cung cấp năm và quý.' });
    }

    try {
        const company = await prisma.CongTy.findUnique({ where: { Id: companyId }});
        if (!company) {
            return res.status(404).json({ message: "Không tìm thấy thông tin công ty."});
        }

        const numYear = parseInt(year);
        const numQuarter = parseInt(quarter);
        const startDate = new Date(numYear, (numQuarter - 1) * 3, 1);
        const endDate = new Date(numYear, numQuarter * 3, 0);

        const inputVatAggregation = await prisma.HoaDon.aggregate({ _sum: { TienThueVAT: true }, where: { IdCongTy: companyId, LoaiHoaDon: 'DAUVAO', NgayPhatHanh: { gte: startDate, lte: endDate } } });
        const outputVatAggregation = await prisma.HoaDon.aggregate({ _sum: { TienThueVAT: true }, where: { IdCongTy: companyId, LoaiHoaDon: 'DAURA', NgayPhatHanh: { gte: startDate, lte: endDate } } });

        const summaryData = {
            company,
            year: numYear,
            quarter: numQuarter,
            totalInputVat: parseFloat(inputVatAggregation._sum.TienThueVAT || 0),
            totalOutputVat: parseFloat(outputVatAggregation._sum.TienThueVAT || 0),
            taxPayable: parseFloat((outputVatAggregation._sum.TienThueVAT || 0) - (inputVatAggregation._sum.TienThueVAT || 0)),
        };

        const htmlContent = getReportHtml(summaryData);

        // CẤU HÌNH PUPPETEER CHO MÔI TRƯỜNG RENDER (ĐÃ SỬA LỖI THEO TÀI LIỆU RENDER)
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Các args cơ bản
            // Quan trọng: Sử dụng biến môi trường PUPPETEER_EXECUTABLE_PATH nếu có,
            // nếu không thì Puppeteer sẽ cố gắng tìm mặc định.
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
            headless: true, // Chạy ở chế độ không giao diện
        });
        
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        await logAction(req.user.id, companyId, 'GENERATE_PDF_REPORT', { year, quarter });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=BaoCaoThue_Q${quarter}_${year}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Lỗi khi tạo báo cáo PDF:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi tạo PDF.' });
    }
};

exports.submitReport = async (req, res) => {
    const { id } = req.params;
    const { companyId, id: userId, role } = req.user;

    if (role !== 'KETOAN') {
        return res.status(403).json({ message: "Chỉ Kế toán mới có thể trình báo cáo." });
    }

    try {
        const report = await prisma.$transaction(async (tx) => {
            const report = await tx.BaoCaoThue.update({
                where: { Id: parseInt(id), IdCongTy: companyId, TrangThai: { in: ['NHAP', 'BITUCHOI'] } },
                data: { TrangThai: 'CHODUYET' }
            });

            await tx.LichSuDuyetBaoCao.create({
                data: {
                    IdBaoCaoThue: report.Id,
                    IdNguoiDuyet: userId,
                    DaDuyet: true,
                    BinhLuan: 'Đã phê duyệt'
                }
            });

            await logAction(userId, companyId, 'SUBMIT_REPORT', { reportId: report.Id });
            return report;
        });
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: "Không thể trình báo cáo. Báo cáo có thể đã được trình hoặc không tồn tại." });
    }
};

exports.approveReport = async (req, res) => {
    const { id } = req.params;
    const { companyId, id: userId, role } = req.user;

    if (role !== 'QUANTRIVIEN') {
        return res.status(403).json({ message: "Bạn không có quyền phê duyệt." });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const report = await tx.BaoCaoThue.update({
                where: { Id: parseInt(id), IdCongTy: companyId, TrangThai: 'CHODUYET' },
                data: { TrangThai: 'DADUYET' }
            });

            await tx.LichSuDuyetBaoCao.create({
                data: {
                    IdBaoCaoThue: report.Id,
                    IdNguoiDuyet: userId,
                    DaDuyet: true,
                    BinhLuan: 'Đã phê duyệt'
                }
            });

            await logAction(userId, companyId, 'APPROVE_REPORT', { reportId: report.Id });
            return report;
        });
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: "Không thể phê duyệt. Báo cáo có thể không ở trạng thái 'Chờ duyệt'." });
    }
};

exports.rejectReport = async (req, res) => {
    const { id } = req.params;
    const { binhLuan } = req.body;
    const { companyId, id: userId, role } = req.user;

    if (role !== 'QUANTRIVIEN') {
        return res.status(403).json({ message: "Bạn không có quyền từ chối báo cáo." });
    }
    if (!binhLuan) {
        return res.status(400).json({ message: "Vui lòng cung cấp lý do từ chối." });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const report = await tx.BaoCaoThue.update({
                where: { Id: parseInt(id), IdCongTy: companyId, TrangThai: 'CHODUYET' },
                data: { TrangThai: 'BITUCHOI' }
            });

            await tx.LichSuDuyetBaoCao.create({
                data: {
                    IdBaoCaoThue: report.Id,
                    IdNguoiDuyet: userId,
                    DaDuyet: false,
                    BinhLuan: binhLuan
                }
            });

            await logAction(userId, companyId, 'REJECT_REPORT', { reportId: report.Id, reason: binhLuan });
            return report;
        });
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: "Không thể từ chối. Báo cáo có thể không ở trạng thái 'Chờ duyệt'." });
    }
};