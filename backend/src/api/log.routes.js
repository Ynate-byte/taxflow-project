const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);
router.get('/', logController.getSystemLogs);

module.exports = router;