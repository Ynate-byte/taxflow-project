const prisma = require('../config/prisma');

exports.getSystemLogs = async (req, res) => {
    const { companyId, role } = req.user;

    // Chỉ Quản trị viên mới có quyền xem log
    if (role !== 'QUANTRIVIEN') {
        return res.status(403).json({ message: "Bạn không có quyền truy cập chức năng này." });
    }

    // Lấy các tham số lọc từ query string
    const { userId, actionType, startDate, endDate } = req.query;

    try {
        // Xây dựng điều kiện lọc động cho Prisma
        const whereClause = {
            IdCongTy: companyId,
        };

        if (userId) {
            whereClause.IdNguoiDung = parseInt(userId);
        }

        if (actionType) {
            whereClause.LoaiHanhDong = actionType;
        }

        if (startDate && endDate) {
            whereClause.ThoiGian = {
                gte: new Date(startDate), 
                lte: new Date(endDate),  
            };
        }

        const logs = await prisma.NhatKyHeThong.findMany({
            where: whereClause,
            orderBy: { ThoiGian: 'desc' },
            take: 500,
            include: {
                NguoiDung: {
                    select: { HoVaTen: true }
                }
            }
        });

        // Lấy danh sách các loại hành động đã có để hiển thị trên bộ lọc
        const distinctActionTypes = await prisma.NhatKyHeThong.findMany({
            where: { IdCongTy: companyId },
            distinct: ['LoaiHanhDong'],
            select: { LoaiHanhDong: true },
        });

        res.status(200).json({
            logs: logs,
            actionTypes: distinctActionTypes.map(item => item.LoaiHanhDong),
        });

    } catch (error) {
        console.error("Lỗi khi lấy nhật ký hệ thống:", error);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};
