const { prisma } = require('../config/database');
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

// ฟังก์ชันสำหรับการจ่ายเงิน
const processPayment = async (req, res) => {
    const { tableNumber } = req.body; // Assume the table number is passed in the request body

    try {
        // Find all orders associated with the table and update their status to "PAID"
        const orders = await prisma.order.updateMany({
            where: {
                tableId: parseInt(tableNumber, 10),
                status: { not: 'CANCELLED' }, // Only update non-cancelled orders
            },
            data: { paymentStatus: 'PAID' },
        });

        // If no orders were found, respond with a message
        if (orders.count === 0) {
            return res.status(404).json({ error: 'No orders found for this table' });
        }

        // Find the orders associated with the table to delete related OrderItems
        const orderIds = await prisma.order.findMany({
            where: {
                tableId: parseInt(tableNumber, 10),
                status: 'CANCELLED',
            },
            select: { id: true },
        });

        // Delete the OrderItems associated with the orders
        if (orderIds.length > 0) {
            await prisma.orderItem.deleteMany({
                where: {
                    orderId: { in: orderIds.map(order => order.id) },
                },
            });
        }

        // Delete cancelled orders for the given table
        await prisma.order.deleteMany({
            where: {
                tableId: parseInt(tableNumber, 10),
                status: 'CANCELLED',
            },
        });

        res.json({ message: `Payment confirmed for Table ${tableNumber}`, orders });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



module.exports = { getCashiers, updateOrderStatus, deleteOrder, processPayment };
