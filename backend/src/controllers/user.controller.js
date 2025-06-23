const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const { logAction } = require('../services/logging.service');

exports.getMyProfile = (req, res) => {
    res.status(200).json(req.user);
};

// Lấy danh sách tất cả người dùng trong công ty
exports.getCompanyUsers = async (req, res) => {
    const { companyId } = req.user;
    try {
        const users = await prisma.NguoiDung.findMany({
            where: { IdCongTy: companyId },
            select: {
                Id: true, HoVaTen: true, Email: true, VaiTro: true, DangHoatDong: true,
            },
            orderBy: { HoVaTen: 'asc' }
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách người dùng." });
    }
};

// Tạo người dùng mới (chỉ Admin)
exports.createUser = async (req, res) => {
    const { companyId, id: adminId, role: adminRole } = req.user;
    if (adminRole !== 'QUANTRIVIEN') {
        return res.status(403).json({ message: "Bạn không có quyền tạo người dùng." });
    }

    const { HoVaTen, Email, MatKhau, VaiTro } = req.body;
    if (!HoVaTen || !Email || !MatKhau || !VaiTro) {
        return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin." });
    }

    try {
        const matKhauMaHoa = await bcrypt.hash(MatKhau, 10);
        const newUser = await prisma.NguoiDung.create({
            data: {
                IdCongTy: companyId, HoVaTen, Email, MatKhauMaHoa, VaiTro,
            }
        });
        await logAction(adminId, companyId, 'CREATE_USER', { newUserId: newUser.Id, email: newUser.Email });
        res.status(201).json(newUser);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Email đã tồn tại.' });
        }
        res.status(500).json({ message: 'Lỗi máy chủ khi tạo người dùng.' });
    }
};

// Cập nhật người dùng (chỉ Admin)
exports.updateUser = async (req, res) => {
    const { companyId, id: adminId, role: adminRole } = req.user;
    if (adminRole !== 'QUANTRIVIEN') {
        return res.status(403).json({ message: "Bạn không có quyền cập nhật người dùng." });
    }

    const { id } = req.params;
    const { HoVaTen, VaiTro, DangHoatDong } = req.body;

    try {
        const updatedUser = await prisma.NguoiDung.update({
            where: { Id: parseInt(id), IdCongTy: companyId },
            data: { HoVaTen, VaiTro, DangHoatDong }
        });
        await logAction(adminId, companyId, 'UPDATE_USER', { targetUserId: updatedUser.Id, data: req.body });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: "Không thể cập nhật người dùng." });
    }
};

// Xóa người dùng (chỉ Admin)
exports.deleteUser = async (req, res) => {
    const { companyId, id: adminId, role: adminRole } = req.user;
    if (adminRole !== 'QUANTRIVIEN') {
        return res.status(403).json({ message: "Bạn không có quyền xóa người dùng." });
    }

    const { id } = req.params;
    if (parseInt(id) === adminId) {
        return res.status(400).json({ message: "Bạn không thể xóa chính tài khoản của mình." });
    }

    try {
        await prisma.NguoiDung.delete({
            where: { Id: parseInt(id), IdCongTy: companyId }
        });
        await logAction(adminId, companyId, 'DELETE_USER', { targetUserId: id });
        res.status(200).json({ message: "Xóa người dùng thành công." });
    } catch (error) {
        res.status(400).json({ message: "Không thể xóa người dùng." });
    }
};
