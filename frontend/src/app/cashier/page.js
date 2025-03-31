"use client";

import React, { useEffect, useState } from 'react';

const Cashier = () => {
    const [completedOrders, setCompletedOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/kitchen'); // Update API as needed
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
            } else {
                console.error("Failed to update order status");
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

    const handlePayment = async (tableNumber) => {
        // Confirm payment for the table
        const confirmed = window.confirm(`Confirm payment for Table ${tableNumber}?`);
        if (confirmed) {
            try {
                // Call your backend API to process the payment (mocking payment success)
                const response = await fetch('http://localhost:5000/api/cashier/payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tableNumber }),
                });

                if (response.ok) {
                    alert(`Payment confirmed for Table ${tableNumber}`);
                    // Optionally: mark the order as paid or update status after payment
                } else {
                    alert('Payment failed. Please try again.');
                }
            } catch (error) {
                console.error('Error during payment:', error);
                alert('Payment failed. Please try again.');
            }
        }
    };

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
                                    <li key={index}>
                                        {name} x {quantity}
                                    </li>
                                ))}
                            </ul>
                            {cancelledOrders.length > 0 && (
                                <ul className="ml-4 list-disc mt-2 text-red-500">
                                    {cancelledOrders.map((order, index) => (
                                        <li key={index}>
                                            {order.items.map(item => (
                                                <span key={item.menu.name}>
                                                    {item.menu.name} x {item.quantity} (CANCELLED)
                                                </span>
                                            ))}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="mt-4">
                            {group.tableNumber !== 'Unknown' && (
                                <button 
                                    onClick={() => handlePayment(group.tableNumber)} 
                                    className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                                >
                                    Confirm Payment
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Cashier;
