const { prisma } = require('../config/database');

const getPendingOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { status: 'PENDING' },
            include: { items: true } // ดึงข้อมูล OrderItem ด้วย
        });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        res.status(500).send('Internal Server Error');
    }
};

const checkout = async (req, res) => {
    const { tableId, items } = req.body;

    if (!tableId || !items || items.length === 0) {
        return res.status(400).json({ error: 'Invalid request: tableId and items are required' });
    }

    console.log('Table ID:', tableId);
    console.log('Items:', items);

    try {
        const totalPrice = items.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);

        const order = await prisma.order.create({
            data: {
                totalPrice,
                status: "PENDING",
                table: {
                    connect: { id: parseInt(tableId) } // เชื่อมกับโต๊ะ
                },
                items: {
                    create: items.map(item => ({
                        menu: { connect: { id: item.id } }, // เชื่อมกับเมนู
                        quantity: item.quantity || 1
                    }))
                }
            },
            include: { items: true } // ดึงข้อมูลรายการอาหารที่สั่ง
        });

        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        console.error('Error creating order:', error.message);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

module.exports = { getPendingOrders, checkout };
