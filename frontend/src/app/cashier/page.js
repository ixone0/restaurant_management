"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Head from 'next/head';
import jwtDecode from 'jwt-decode';

const Cashier = () => {
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    if (!storedToken) {
      router.push('/login');
      return;
    }
  }, []);

  // Fetch unpaid orders
  useEffect(() => {
    if (token) {
      
      const fetchUnpaidOrders = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/cashier/unpaid", {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const ordersArray = Object.values(data).flat();
          const decodedToken = jwtDecode(token); // ใช้ jwtDecode
          if (decodedToken.role === 'ADMIN') {
            setIsAdmin(true);
          }
          setUnpaidOrders(ordersArray);

          
        } catch (error) {
          console.error("Error fetching unpaid orders:", error);
        }
      };
      fetchUnpaidOrders();
    }
  }, [token]);

  const handlePayment = async (tableNumber) => {
    const confirmed = window.confirm(`Confirm payment for Table ${tableNumber}?`);
    if (confirmed) {
      try {
        const response = await fetch("http://localhost:5000/api/cashier/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ tableNumber }),
        });

        if (response.ok) {
          const { updatedOrders } = await response.json();
          setUnpaidOrders((prevOrders) =>
            prevOrders.filter((order) => order.table.number !== tableNumber)
          );
          alert(`Payment confirmed for Table ${tableNumber}`);
        } else {
          alert("Payment failed. Please try again.");
        }
      } catch (error) {
        console.error("Error during payment:", error);
        alert("Payment failed. Please try again.");
      }
    }
  };

  const updateItemQuantity = async (orderId, itemId, operation, quantity) => {
    const confirmMessage = operation === "increase" 
        ? `Confirm to increase quantity?` 
        : `Confirm to decrease quantity?`;
        
    const confirmed = window.confirm(confirmMessage);
    if (confirmed) {
      const newQuantity = operation === "increase" ? quantity + 1 : quantity - 1;

      try {
        const response = await fetch("http://localhost:5000/api/cashier/update-item-quantity", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId,
            itemId,
            newQuantity,
          }),
        });

        if (response.ok) {
          const updatedItem = await response.json();
          setUnpaidOrders((prevOrders) => {
            return prevOrders.map((order) => {
              if (order.id === orderId) {
                return {
                  ...order,
                  items: order.items.map((item) => {
                    if (item.id === itemId) {
                      return { ...item, quantity: newQuantity };
                    }
                    return item;
                  }),
                };
              }
              return order;
            });
          });
        } else {
          alert("Failed to update item quantity.");
        }
      } catch (error) {
        console.error("Error updating item quantity:", error);
        alert("Error updating item quantity.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // ลบ token
    router.push('/login'); // เปลี่ยนเส้นทางไปยังหน้า Login
  };

  const groupedOrders = unpaidOrders.reduce((acc, order) => {
    const tableNumber = order.table?.number || "Unknown";
    if (!acc[tableNumber]) {
      acc[tableNumber] = [];
    }
    acc[tableNumber].push(order);
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Cashier</title>
      </Head>
      <h2 className="text-2xl font-bold text-center mb-6">Check Orders</h2>
      <div className="flex justify-between mb-4">
        <button
          onClick={() => router.push("/paidorders")}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mb-4"
        >
          Order History
        </button>
        {/* ปุ่มไปยังหน้า /admin หากเป็น ADMIN */}
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
      <div className="space-y-4">
        {Object.keys(groupedOrders).length > 0 ? (
          Object.entries(groupedOrders).map(([tableNumber, orders]) => {
            const totalTablePrice = orders.reduce((total, order) => {
              return total + order.items.reduce((itemTotal, item) => {
                return itemTotal + item.quantity * item.menu.price;
              }, 0);
            }, 0);
            const orderRounds = orders.length;

            return (
              <div key={tableNumber} className="bg-white p-4 border rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <p className="font-semibold text-xl">Table Number: {tableNumber}</p>
                  <p className="text-lg text-gray-600">Orders: {orderRounds} rounds</p>
                </div>

                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <div key={order.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                      <p className="font-semibold">Round {index + 1} / Order ID: {order.id}</p>
                      <div>
                        <ul className="ml-4 list-disc">
                          {order.items?.length > 0 ? (
                            order.items.map((item) => (
                              <li key={item.id} className="flex items-center justify-between my-0.25">
                                <span>
                                  {item.menu?.name || "Unknown Menu"} ฿{item.menu?.price} x {item.quantity}
                                </span>
                                <div className="flex items-center">
                                  <button
                                    onClick={() => updateItemQuantity(order.id, item.id, "decrease", item.quantity)}
                                    className="bg-gray-500 text-white px-2 rounded hover:bg-gray-600"
                                    disabled={item.quantity <= 0}
                                  >
                                    -
                                  </button>
                                  <button
                                    onClick={() => updateItemQuantity(order.id, item.id, "increase", item.quantity)}
                                    className="bg-gray-500 text-white px-2 rounded hover:bg-gray-600 ml-2"
                                  >
                                    +
                                  </button>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li>No items</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="font-semibold mt-4 text-lg">Total Price for Table {tableNumber}: ฿{totalTablePrice}</p>

                <button
                  onClick={() => handlePayment(tableNumber)}
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 mt-2"
                >
                  Confirm Payment
                </button>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500">No unpaid orders found.</p>
        )}
      </div>
    </div>
  );
};

export default Cashier;