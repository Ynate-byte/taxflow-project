const prisma = require('../config/prisma');
const { logAction } = require('../services/logging.service');

// Lấy danh sách công việc
exports.getTasks = async (req, res) => {
    const { companyId } = req.user;
    try {
        const tasks = await prisma.CongViec.findMany({
            where: { IdCongTy: companyId },
            include: { NguoiDung: { select: { HoVaTen: true } } },
            orderBy: { HanChot: 'asc' }
        });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách công việc." });
    }
};

// Tạo công việc mới
exports.createTask = async (req, res) => {
    const { companyId, id: userId, role } = req.user;
    if (role !== 'QUANTRIVIEN') return res.status(403).json({ message: "Chỉ Quản trị viên được tạo công việc." });

    const { TieuDe, MoTa, HanChot, IdNguoiThucHien } = req.body;
    if (!TieuDe || !HanChot || !IdNguoiThucHien) {
        return res.status(400).json({ message: "Vui lòng điền đầy đủ Tiêu đề, Hạn chót và Người thực hiện." });
    }

    try {
        const task = await prisma.CongViec.create({
            data: {
                IdCongTy: companyId,
                TieuDe,
                MoTa,
                HanChot: new Date(HanChot),
                IdNguoiThucHien: parseInt(IdNguoiThucHien)
            }
        });
        await logAction(userId, companyId, 'CREATE_TASK', { taskId: task.Id, title: task.TieuDe });
        res.status(201).json(task);
    } catch (error) {
        console.error("Lỗi tạo công việc:", error);
        res.status(400).json({ message: "Không thể tạo công việc." });
    }
};

// Cập nhật công việc
exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const { companyId, id: userId, role } = req.user;
    const { TieuDe, MoTa, HanChot, IdNguoiThucHien, TrangThai } = req.body;

    try {
        const task = await prisma.CongViec.findFirst({ where: { Id: parseInt(id), IdCongTy: companyId }});
        if (!task) {
            return res.status(404).json({ message: "Không tìm thấy công việc." });
        }
        
        // Chỉ quản trị viên hoặc người được giao mới được cập nhật
        if (role === 'KETOAN' && task.IdNguoiThucHien !== userId) {
            return res.status(403).json({ message: "Bạn không có quyền cập nhật công việc này." });
        }
        
        const updatedTask = await prisma.CongViec.update({
            where: { Id: parseInt(id) },
            data: { TieuDe, MoTa, HanChot: HanChot ? new Date(HanChot) : undefined, IdNguoiThucHien, TrangThai }
        });

        await logAction(userId, companyId, 'UPDATE_TASK', { taskId: updatedTask.Id, data: req.body });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: "Không thể cập nhật công việc." });
    }
};

// Xóa công việc
exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    const { companyId, id: userId, role } = req.user;

    if (role !== 'QUANTRIVIEN') return res.status(403).json({ message: "Chỉ Quản trị viên được xóa công việc." });

    try {
        await prisma.CongViec.delete({
            where: { Id: parseInt(id), IdCongTy: companyId }
        });
        await logAction(userId, companyId, 'DELETE_TASK', { taskId: id });
        res.status(200).json({ message: "Xóa công việc thành công." });
    } catch (error) {
        res.status(400).json({ message: "Không thể xóa công việc." });
    }
};