const express = require('express');
const userController = require('../controllers/userController'); 
const router = express.Router();

// Route สำหรับสร้างผู้ใช้ใหม่
router.post('/registerEmployee', userController.registerEmployee); // Register new employee
router.get('/getEmployees', userController.getEmployees); // Get all employees
router.post('/login', userController.loginUser);
router.put('/editRole/:id', userController.editRole); // Edit employee role
router.delete('/deleteEmployee/:id', userController.deleteEmployee); // Delete employee

module.exports = router;