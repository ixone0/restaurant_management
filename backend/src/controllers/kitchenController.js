// src/controllers/kitchenController.js
const { prisma } = require('../config/database');

const getKitchens = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        table: true, // ดึงข้อมูลโต๊ะ (ถ้าไม่มีจะเป็น null)
        items: {
          include: {
            menu: true, // ดึงข้อมูลเมนูแต่ละรายการ
          },
        },
      },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching kitchen orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  console.log('Received request to update order:', orderId, 'to status:', status);

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status },
    });
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const deleteOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    await prisma.order.delete({
      where: { id: parseInt(orderId) },
    });

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getKitchens, updateOrderStatus, deleteOrder };

