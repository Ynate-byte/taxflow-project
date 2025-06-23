const prisma = require('../config/prisma');
const { logAction } = require('../services/logging.service');

exports.createPartner = async (req, res) => {
    const { companyId, id: userId } = req.user;
    const { MaSoThue, TenDoiTac, DiaChi, LoaiDoiTac } = req.body;
    try {
        const partner = await prisma.DoiTac.create({
            data: { 
                IdCongTy: companyId, 
                MaSoThue: MaSoThue, 
                TenDoiTac: TenDoiTac, 
                DiaChi: DiaChi, 
                LoaiDoiTac: LoaiDoiTac 
            }
        });
        await logAction(userId, companyId, 'CREATE_PARTNER', { partnerId: partner.Id, name: partner.TenDoiTac });
        res.status(201).json(partner);
    } catch (error) {
        console.error("ERROR CREATING PARTNER:", error); 
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Mã số thuế của đối tác đã tồn tại.' });
        }
        res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
};

exports.getPartners = async (req, res) => {
    const { companyId } = req.user;
    try {
        const partners = await prisma.DoiTac.findMany({ where: { IdCongTy: companyId }, orderBy: { TenDoiTac: 'asc' } });
        res.status(200).json(partners);
    } catch (error) {
        console.error("ERROR GETTING PARTNERS:", error);
        res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
};

exports.updatePartner = async (req, res) => {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;
    // SỬA Ở ĐÂY: Dùng PascalCase
    const { TenDoiTac, DiaChi, LoaiDoiTac } = req.body;
    try {
        const partner = await prisma.DoiTac.update({
            where: { Id: parseInt(id), IdCongTy: companyId },
            data: { 
                TenDoiTac: TenDoiTac, 
                DiaChi: DiaChi, 
                LoaiDoiTac: LoaiDoiTac 
            }
        });
        await logAction(userId, companyId, 'UPDATE_PARTNER', { partnerId: partner.Id, name: partner.TenDoiTac });
        res.status(200).json(partner);
    } catch (error) {
        console.error("ERROR UPDATING PARTNER:", error);
        res.status(500).json({ message: 'Không thể cập nhật đối tác.' });
    }
};

exports.deletePartner = async (req, res) => {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;
    try {
        await prisma.DoiTac.delete({
            where: { Id: parseInt(id), IdCongTy: companyId }
        });
        await logAction(userId, companyId, 'DELETE_PARTNER', { partnerId: id });
        res.status(200).json({ message: 'Xóa đối tác thành công.' });
    } catch (error) {
        console.error("ERROR DELETING PARTNER:", error);
        res.status(500).json({ message: 'Không thể xóa đối tác.' });
    }
};
