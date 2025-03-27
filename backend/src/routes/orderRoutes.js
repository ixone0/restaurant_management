const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// กำหนดเส้นทางต่าง ๆ ที่นี่
router.get('/pending', orderController.getPendingOrders);
router.post('/checkout', orderController.checkout)

module.exports = router;