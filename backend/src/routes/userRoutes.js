const express = require('express');
const userController = require('../controllers/userController'); 
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); 
const router = express.Router();

// Route สำหรับสร้างผู้ใช้ใหม่
router.post('/registerEmployee', userController.registerEmployee); // Register new employee
router.get('/getEmployees', authenticateToken, authorizeRole(['ADMIN']), userController.getEmployees); // Get all employees
router.post('/login', userController.loginUser);
router.put('/editRole/:id', authenticateToken, authorizeRole(['ADMIN']), userController.editRole); // Edit employee role
router.delete('/deleteEmployee/:id', authenticateToken, authorizeRole(['ADMIN']), userController.deleteEmployee); // Delete employee

module.exports = router;