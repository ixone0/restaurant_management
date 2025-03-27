// controllers/menuController.js
const { prisma } = require('../config/database'); // ตรวจสอบว่าเส้นทางถูกต้อง

// ฟังก์ชันสำหรับดึงข้อมูลเมนูทั้งหมด
const getMenu = async (req, res) => {
    try {
        const menuItems = await prisma.menu.findMany(); // ดึงข้อมูลเมนูทั้งหมด
        res.json(menuItems);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).send('Internal Server Error');
    }
};

// ฟังก์ชันสำหรับดึงข้อมูลเมนูตาม ID
const getMenuById = async (req, res) => {
    const { id } = req.params; // รับ ID จาก URL params

    try {
        const menuItem = await prisma.menu.findUnique({
            where: { id: Number(id) }, // ค้นหาข้อมูลเมนูตาม ID
        });

        if (!menuItem) {
            return res.status(404).send('Menu item not found');
        }

        res.json(menuItem);
    } catch (error) {
        console.error('Error fetching menu item:', error);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = { getMenu, getMenuById };