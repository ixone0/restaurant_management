const { prisma } = require('../config/database');

const getSales = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
      },
      include: {
        items: {
          include: {
            menu: true, // ดึงข้อมูลเมนู
          },
        },
      },
    });

    const formattedData = orders.map(order => {
      return order.items.map(item => {
        const profit = item.menu.price - item.menu.cost;

        return {
          name: item.menu.name,
          price: item.menu.price,
          cost: item.menu.cost,
          profit: profit,
          quantity: item.quantity,
          paidAt: order.paidAt,
        };
      });
    }).flat(); // Flatten array

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching paid orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
    getSales,
};