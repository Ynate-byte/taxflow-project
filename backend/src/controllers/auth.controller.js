const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logAction } = require('../services/logging.service');

exports.register = async (req, res) => {
    const { tenCongTy, maSoThue, email, matKhau, hoVaTen } = req.body;

    if (!tenCongTy || !maSoThue || !email || !matKhau || !hoVaTen) {
        return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin." });
    }

    try {
        const matKhauMaHoa = await bcrypt.hash(matKhau, 10);

        const newCompany = await prisma.$transaction(async (tx) => {
            const congTy = await tx.CongTy.create({
                data: {
                    "TenCongTy": tenCongTy,
                    "MaSoThue": maSoThue,
                }
            });

            await tx.NguoiDung.create({
                data: {
                    "IdCongTy": congTy.Id,
                    "Email": email,
                    "MatKhauMaHoa": matKhauMaHoa,
                    "HoVaTen": hoVaTen,
                    "VaiTro": 'QUANTRIVIEN'
                }
            });

            return congTy;
        });
        
        res.status(201).json({ 
            message: "Đăng ký công ty và tài khoản quản trị viên thành công!",
            companyId: newCompany.Id
        });

    } catch (error) {
        if (error.code === 'P2002') {
            const target = error.meta.target;
            const message = target.includes('MaSoThue') 
                ? 'Mã số thuế đã tồn tại.' 
                : (target.includes('Email') ? 'Email đã tồn tại.' : 'Dữ liệu trùng lặp.');
            return res.status(409).json({ message });
        }
        console.error(error);
        res.status(500).json({ message: "Đã xảy ra lỗi ở máy chủ." });
    }
};

exports.login = async (req, res) => {
    const { email, matKhau } = req.body;

    if (!email || !matKhau) {
        return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu." });
    }

    try {
        const nguoiDung = await prisma.NguoiDung.findUnique({
            where: { "Email": email },
        });

        if (!nguoiDung) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không chính xác." });
        }

        const isMatKhauDung = await bcrypt.compare(matKhau, nguoiDung.MatKhauMaHoa);

        if (!isMatKhauDung) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không chính xác." });
        }

        await logAction(nguoiDung.Id, nguoiDung.IdCongTy, 'USER_LOGIN');

        const token = jwt.sign(
            { 
                id: nguoiDung.Id,
                email: nguoiDung.Email,
                role: nguoiDung.VaiTro,
                companyId: nguoiDung.IdCongTy
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Đăng nhập thành công!",
            token: token,
            user: {
                id: nguoiDung.Id,
                email: nguoiDung.Email,
                hoVaTen: nguoiDung.HoVaTen,
                role: nguoiDung.VaiTro
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Đã xảy ra lỗi ở máy chủ." });
    }
};