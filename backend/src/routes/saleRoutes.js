const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

router.get('/', salesController.getSales); // ใช้ฟังก์ชัน getSales

module.exports = router; // ตรวจสอบให้แน่ใจว่า export ถูกต้อง