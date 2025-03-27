const express = require('express');
const router = express.Router();
const kitchenController = require('../controllers/kitchenController'); // ตรวจสอบเส้นทางนี้

// กำหนดเส้นทาง
router.get('/', kitchenController.getKitchens); // ฟังก์ชันนี้ต้องมีอยู่ใน kitchenController
router.put('/:orderId', kitchenController.updateOrderStatus);
router.delete('/:orderId', kitchenController.deleteOrder); // เพิ่ม API สำหรับลบ

// ส่งออก router
module.exports = router;