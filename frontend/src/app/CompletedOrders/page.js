'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";

const CompletedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:5000/api/kitchen')
      .then((response) => response.json())
      .then((data) => {
        // Filter to get only completed orders
        const completedOrders = data.filter(order => order.status === 'COMPLETED');
        setOrders(completedOrders);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching completed orders:', error);
        setLoading(false);
      });
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/kitchen/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const updatedOrder = await response.json();

      if (!response.ok) {
        throw new Error(updatedOrder.message || 'Failed to update order');
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) return <p className="text-center text-lg">Loading completed orders...</p>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-center font-bold text-2xl text-blue-500 mb-6 mt-8">
        Completed Orders
      </h2>
      <button
        onClick={() => router.push("/kitchen")}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mb-4"
      >
        Back to Kitchen Orders
      </button>
      <div>
        {orders.map((order) => (
          <div key={order.id} className="mb-4 p-4 border border-gray-300 rounded-lg shadow-md bg-white">
            <p className="font-bold">Table Number: {order.table?.number || 'Unknown'}</p>
            <p>Order ID: {order.id} - Total: ฿{order.totalPrice} - Status: {order.status}</p>
            <div>
              <p className="font-semibold">Items:</p>
              <ul className="ml-4 list-disc">
                {order.items?.length > 0 ? (
                  order.items.map((item) => (
                    <li key={item.id}>{item.menu.name || 'Unknown'} x {item.quantity}</li>
                  ))
                ) : (
                  <li>No items</li>
                )}
              </ul>
            </div>
            <div className="flex items-center mt-2">
              <div className="flex space-x-2 flex-grow">
                {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                  <button
                    key={status}
                    className={`text-white py-2 px-4 rounded focus:outline-none cursor-pointer transition duration-200 
                      ${order.status === status ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-800'}`}
                    onClick={() => updateOrderStatus(order.id, status)}
                    disabled={order.status === status}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedOrders;