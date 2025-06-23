const express = require('express');
const router = express.Router();
const multer = require('multer');
const invoiceController = require('../controllers/invoice.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Cấu hình multer để nhận file trong memory (dưới dạng buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Định nghĩa các routes
// Tất cả các route trong file này đều được bảo vệ
router.use(verifyToken);

router.get('/', invoiceController.getInvoices);

router.post('/upload', upload.single('invoiceFile'), invoiceController.uploadInvoices);

module.exports = router;