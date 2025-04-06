const express = require('express');
const router = express.Router();
const kitchenController = require('../controllers/kitchenController'); // ตรวจสอบเส้นทางนี้
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // เพิ่ม middleware สำหรับตรวจสอบ JWT

// กำหนดเส้นทาง
router.get('/', authenticateToken, authorizeRole(['CHEF', 'ADMIN']), kitchenController.getKitchens); // ฟังก์ชันนี้ต้องมีอยู่ใน kitchenController
router.put('/:orderId', authenticateToken, authorizeRole(['CHEF', 'ADMIN']), kitchenController.updateOrderStatus);
router.delete('/:orderId', authenticateToken, authorizeRole(['CHEF', 'ADMIN']), kitchenController.deleteOrder); // เพิ่ม API สำหรับลบ

// ส่งออก router
module.exports = router;