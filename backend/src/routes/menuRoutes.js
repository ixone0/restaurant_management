// routes/menuRoutes.js
const express = require('express');
const menuController = require('../controllers/menuController'); // ปรับเส้นทางให้ถูกต้อง

const router = express.Router();

router.get('/', menuController.getMenu); // GET /api/menu
router.get('/:id', menuController.getMenuById); // GET /api/menu/:id

module.exports = router;