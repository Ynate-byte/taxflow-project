const express = require('express');
const router = express.Router();
const googleController = require('../controllers/google.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Route này không cần verifyToken vì nó là callback từ Google
router.get('/auth/google/callback', googleController.handleGoogleCallback);

router.use(verifyToken);
router.get('/auth/google', googleController.getAuthUrl);
router.post('/gmail/scan', googleController.scanInvoices);

module.exports = router;