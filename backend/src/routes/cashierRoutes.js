const express = require('express');
const router = express.Router();
const cashierController = require('../controllers/cashierController');

// กำหนดเส้นทาง
router.get('/', cashierController.getCashiers);
router.put('/orders/:id', cashierController.updateOrderStatus); // เพิ่มเส้นทางสำหรับแก้ไขสถานะคำสั่งซื้อ
router.delete('/orders/:id', cashierController.deleteOrder); // เพิ่มเส้นทางสำหรับลบคำสั่งซื้อ
router.post('/payment', cashierController.processPayment)

module.exports = router;