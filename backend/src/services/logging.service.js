const prisma = require('../config/prisma');

const logAction = async (userId, companyId, actionType, details = {}) => {
    try {
        await prisma.NhatKyHeThong.create({
            data: {
                IdNguoiDung: userId,
                IdCongTy: companyId,
                LoaiHanhDong: actionType,
                ChiTiet: details,
            },
        });
    } catch (error) {
        console.error("Failed to write to audit log:", error);
    }
};

module.exports = { logAction };