const express = require('express');
const router = express.Router();
const cashierController = require('../controllers/cashierController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); 

// กำหนดเส้นทาง
router.put('/orders/:id', authenticateToken, authorizeRole(['CASHIER', 'ADMIN']), cashierController.updateOrderStatus);
router.delete('/orders/:id', authenticateToken, authorizeRole(['CASHIER', 'ADMIN']), cashierController.deleteOrder);
router.post('/payment', authenticateToken, authorizeRole(['CASHIER']), cashierController.processPayment);
router.get('/unpaid', authenticateToken, authorizeRole(['CASHIER']), cashierController.getUnpaidOrders);
router.get('/paid', authenticateToken, authorizeRole(['CASHIER']), cashierController.getPaidOrders);
router.patch('/update-item-quantity', authenticateToken, authorizeRole(['CASHIER']), cashierController.updateItemQuantity);

module.exports = router;