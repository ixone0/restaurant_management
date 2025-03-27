"use client";

import React, { useEffect, useState } from 'react';

const Cashier = () => {
    const [completedOrders, setCompletedOrders] = useState([]);
    
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/kitchen'); // เปลี่ยนเป็น API ที่คุณใช้
                const data = await response.json();
                setCompletedOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/kitchen/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                const updatedOrder = await response.json();
                setCompletedOrders((prevOrders) =>
                    prevOrders.map(order => (order.id === orderId ? updatedOrder : order))
                );
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        const confirmed = window.confirm('Are you sure you want to delete this order?');
        if (!confirmed) return;

        try {
            const response = await fetch(`http://localhost:5000/api/kitchen/${orderId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCompletedOrders((prevOrders) => prevOrders.filter(order => order.id !== orderId));
            }
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    // จัดกลุ่มออเดอร์ตามโต๊ะเดียวกัน และรวมจำนวนอาหารที่เหมือนกัน ยกเว้นออเดอร์ที่ถูกยกเลิก
    const groupedOrders = completedOrders.reduce((acc, order) => {
        if (order.status === 'CANCELLED') return acc;
        
        const tableNumber = order.table?.number || 'Unknown';
        if (!acc[tableNumber]) {
            acc[tableNumber] = { tableNumber, totalPrice: 0, items: {} };
        }
        acc[tableNumber].totalPrice += order.totalPrice;
        
        order.items.forEach(item => {
            const itemName = item.menu.name || 'Unknown';
            if (!acc[tableNumber].items[itemName]) {
                acc[tableNumber].items[itemName] = 0;
            }
            acc[tableNumber].items[itemName] += item.quantity;
        });

        return acc;
    }, {});

    // แยกออเดอร์ที่ถูกยกเลิก
    const cancelledOrders = completedOrders.filter(order => order.status === 'CANCELLED');

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold text-center mb-6">Check Orders</h2>
            <div className="space-y-4">
                {Object.values(groupedOrders).map(group => (
                    <div key={group.tableNumber} className="bg-white p-4 border border-gray-300 rounded-lg shadow-md">
                        <p className="font-semibold">Table Number: {group.tableNumber}</p>
                        <p>Total: ฿{group.totalPrice}</p>
                        <div>
                            <p className="font-semibold">Items:</p>
                            <ul className="ml-4 list-disc">
                                {Object.entries(group.items).map(([name, quantity], index) => (
                                    <li key={index}>{name} x {quantity}</li>
                                ))}
                            </ul>
                            {cancelledOrders.length > 0 && (
                                <ul className="ml-4 list-disc">
                                    {cancelledOrders.map((order, index) => (
                                        <li key={index}>
                                            {order.items.map(item => `${item.menu.name} x ${item.quantity} (CALCELLED)`).join(', ')}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* เมนูที่ถูกยกเลิกจะอยู่ในบล็อกเดียวกัน */}
            
        </div>
    );
};

export default Cashier;
