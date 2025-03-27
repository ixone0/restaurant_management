const prisma = require('../config/database');

// ฟังก์ชันสำหรับดึงข้อมูลแคชเชียร์
const getCashiers = async (req, res) => {
    const cashiers = await prisma.cashier.findMany();
    res.json(cashiers);
};

// ฟังก์ชันสำหรับแก้ไขสถานะคำสั่งซื้อ
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updatedOrder = await prisma.order.update({
            where: { id: Number(id) },
            data: { status },
        });
        res.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ฟังก์ชันสำหรับลบคำสั่งซื้อ
const deleteOrder = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.order.delete({
            where: { id: Number(id) },
        });
        res.status(204).send(); // No content
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getCashiers, updateOrderStatus, deleteOrder };