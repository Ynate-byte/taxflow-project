const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', reportController.getReports); 
router.get('/summary', reportController.getSummary);
router.get('/generate-pdf', reportController.generatePdfReport);
router.delete('/:id', reportController.deleteReport); 
router.post('/:id/submit', reportController.submitReport);
router.post('/:id/approve', reportController.approveReport);
router.post('/:id/reject', reportController.rejectReport);

module.exports = router;