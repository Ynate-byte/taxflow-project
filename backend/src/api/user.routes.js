const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

// Các route có sẵn
router.get('/me', userController.getMyProfile);
router.get('/company', userController.getCompanyUsers);

// Các route CRUD mới cho Quản trị viên
router.post('/', userController.createUser); 
router.put('/:id', userController.updateUser); 
router.delete('/:id', userController.deleteUser); 

module.exports = router;
