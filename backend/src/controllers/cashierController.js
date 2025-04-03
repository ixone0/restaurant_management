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

// ดึงคำสั่งซื้อที่ยังไม่ได้ชำระ
const getUnpaidOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { paymentStatus: 'UNPAID' },
            include: {
                items: {
                    include: {
                        menu: true,  // Include the menu details for each order item
                    },
                },
                table: true,  // Include table details
            },
        });

        // Group orders by table number
        const groupedOrders = orders.reduce((acc, order) => {
            const tableNumber = order.table.number;
            if (!acc[tableNumber]) {
                acc[tableNumber] = [];
            }
            acc[tableNumber].push(order);
            return acc;
        }, {});

        res.json(groupedOrders);  // Send grouped orders by table number
    } catch (error) {
        console.error('Error fetching unpaid orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



// ดึงคำสั่งซื้อที่ถูกชำระแล้ว
// Updated getPaidOrders API endpoint
const getPaidOrders = async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        include: {
          items: {
            include: {
              menu: true,  // Include menu data for each order item
            },
          },
          table: true,  // Include table information for each order
        },
      });
  
      // Group orders by table number and paidAt (timestamp)
      const groupedOrders = orders.reduce((acc, order) => {
        const tableNumber = order.table.number;
        const paidAt = order.paidAt;  // Get the time of payment
        const key = `${tableNumber}-${paidAt}`;
  
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(order);
        return acc;
      }, {});
  
      // Return the grouped orders with the 'paidAt' timestamp
      res.json(groupedOrders);
    } catch (error) {
      console.error('Error fetching paid orders:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
// ฟังก์ชันชำระเงิน
const processPayment = async (req, res) => {
  const { tableNumber } = req.body;

  try {
    const orders = await prisma.order.findMany({
      where: {
        tableId: parseInt(tableNumber, 10),
        paymentStatus: 'UNPAID',
      },
      include: {
        items: {
          include: {
            menu: true, // รวมรายละเอียดเมนู
          },
        },
      },
    });

    // คำนวณ totalPrice สำหรับแต่ละออร์เดอร์
    await Promise.all(orders.map(async (order) => {
      const newTotalPrice = order.items.reduce((total, item) => {
        if (item.menu) {
          return total + item.quantity * item.menu.price; // เข้าถึง price หาก menu มีอยู่
        } else {
          console.warn(`Menu not found for item ID: ${item.id}`);
          return total;
        }
      }, 0);

      // อัปเดต totalPrice ใน Order
      await prisma.order.update({
        where: { id: order.id },
        data: { totalPrice: newTotalPrice },
      });
    }));

    // สุดท้ายอัปเดตสถานะการชำระเงิน
    const updatedOrders = await prisma.order.updateMany({
      where: {
        tableId: parseInt(tableNumber, 10),
        paymentStatus: 'UNPAID',
      },
      data: {
        paymentStatus: 'PAID',
        paidAt: new Date(),
      },
    });

    if (updatedOrders.count > 0) {
      res.json({ message: `Payment confirmed for Table ${tableNumber}`, updatedOrders });
    } else {
      res.status(404).json({ error: 'No unpaid orders found for this table.' });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
  

// ฟังก์ชันสำหรับอัพเดตจำนวนสินค้าในคำสั่งซื้อ
const updateItemQuantity = async (req, res) => {
  const { orderId, itemId, newQuantity } = req.body;

  try {
    console.log(`Updating item with ID: ${itemId} in order ID: ${orderId} to new quantity: ${newQuantity}`);

    const updatedItem = await prisma.orderItem.update({
      where: {
        orderId: orderId,
        id: itemId,
      },
      data: {
        quantity: newQuantity,
      },
    });

    console.log('Updated item:', updatedItem);

    // คำนวณ totalPrice ใหม่
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menu: true, // รวมรายละเอียดเมนู
          },
        },
      },
    });

    console.log('Fetched order:', order);

    const newTotalPrice = order.items.reduce((total, item) => {
      if (item.menu) {
        return total + item.quantity * item.menu.price; // เข้าถึง price หาก menu มีอยู่
      } else {
        console.warn(`Menu not found for item ID: ${item.id}`);
        return total;
      }
    }, 0);

    console.log(`Calculated new total price: ${newTotalPrice}`);

    // อัปเดต totalPrice ใน Order
    await prisma.order.update({
      where: { id: orderId },
      data: { totalPrice: newTotalPrice },
    });

    console.log('Updated order total price successfully.');

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item quantity:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getCashiers, updateOrderStatus, deleteOrder, processPayment, getUnpaidOrders, getPaidOrders, updateItemQuantity };
