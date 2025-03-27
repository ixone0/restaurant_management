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

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold text-center mb-6">ตรวจสอบคำสั่งซื้อ</h2>
            <div className="space-y-4">
                {completedOrders.map(order => (
                    <div key={order.id} className="p-4 border border-gray-300 rounded-lg shadow-md flex justify-between items-center">
                        <div>
                            <p className="font-semibold">Order ID: {order.id}</p>
                            <p>Total: ฿{order.totalPrice}</p>
                        </div>
                        <div className="flex space-x-2">
                            <select 
                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)} 
                                defaultValue={order.status}
                                className="border rounded p-1"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                            <button 
                                onClick={() => handleDeleteOrder(order.id)} 
                                className="bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Cashier;