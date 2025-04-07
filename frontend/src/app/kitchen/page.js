'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import jwtDecode from 'jwt-decode';

const Kitchen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // Fetch token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    if (!storedToken) {
      router.push('/login'); // เปลี่ยนเส้นทางไปยังหน้า Login ถ้าไม่มี token
      return;
    }
  }, []);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5000/api/kitchen', {
          headers: {
            'Authorization': `Bearer ${token}`, // ส่ง token ใน header
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        const data = await response.json();
        const decodedToken = jwtDecode(token); // ใช้ jwtDecode
          if (decodedToken.role === 'ADMIN') {
            setIsAdmin(true);
          }
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  const updateOrderStatus = async (orderId, newStatus) => {
    if (newStatus === 'COMPLETED') {
      const confirmed = window.confirm('Are you sure you want to mark this order as completed?');
      if (!confirmed) return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/kitchen/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ส่ง token ใน header
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const updatedOrder = await response.json();
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

  const deleteOrder = async (orderId) => {
    const confirmed = window.confirm('Are you sure you want to delete this order?');
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/api/kitchen/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // ส่ง token ใน header
        },
      });

      if (response.ok) {
        setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
      } else {
        console.error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // ลบ token
    router.push('/login'); // เปลี่ยนเส้นทางไปยังหน้า Login
  };

  if (loading) return <p className="text-center text-lg">Loading orders...</p>;

  // Filter out completed orders
  const pendingOrders = orders.filter(order => order.status !== 'COMPLETED');

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-center font-bold text-2xl text-blue-500 mb-6 mt-8">
        Orders Awaiting Preparation
      </h2>
      <div className="flex justify-between mb-4">
        <button
          onClick={() => router.push("/CompletedOrders")}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mb-4"
        >
          Completed Orders
        </button>
        {isAdmin && (
          <button 
          onClick={() => router.push("/admin")}
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-700 mb-4">
            Admin Panel
          </button>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 mb-4"
        >
          Log Out
        </button>
        
      </div>
      <div>
        {pendingOrders.map((order) => (
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

export default Kitchen;