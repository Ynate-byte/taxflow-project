const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    // Lấy token từ header của request
    // Định dạng thường là: "Bearer <TOKEN>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: "Không tìm thấy token xác thực." });
    }

    // Xác thực token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
        }

        req.user = user;
        next(); 
    });
};