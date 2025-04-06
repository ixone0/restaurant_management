"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Head from 'next/head';

const Paidorders = () => {
  const [paidOrders, setPaidOrders] = useState([]);
  const router = useRouter();
  const token = localStorage.getItem('token'); // ดึง token จาก localStorage

  // Fetch paid orders
  useEffect(() => {
    const fetchPaidOrders = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/cashier/paid", {
          headers: {
            'Authorization': `Bearer ${token}`, // ส่ง token ใน header
          }
        });
        const data = await response.json();
        const ordersArray = Object.values(data).flat();
        setPaidOrders(ordersArray);
      } catch (error) {
        console.error("Error fetching paid orders:", error);
      }
    };
    fetchPaidOrders();
  }, [token]);

  // Sort and group orders
  const sortedOrders = paidOrders.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
  const groupedOrders = Array.isArray(sortedOrders)
    ? sortedOrders.reduce((acc, order) => {
        const tableNumber = order.table?.number || "Unknown";
        const paidAt = order.paidAt;
        const key = `${tableNumber},${paidAt}`;

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(order);
        return acc;
      }, {})
    : {};

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Paid Orders</title>
      </Head>
      <h2 className="text-2xl font-bold text-center mb-6">Paid Orders</h2>
      <button
        onClick={() => router.push("/cashier")}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-4"
      >
        Back to cashier
      </button>
      <div className="space-y-4">
        {Object.keys(groupedOrders).length > 0 ? (
          Object.entries(groupedOrders).map(([key, orders]) => {
            const [tableNumber, paidAt] = key.split(',');
            const totalTablePrice = orders.reduce((total, order) => total + order.totalPrice, 0);
            const orderRounds = orders.length;

            return (
              <div key={key} className="bg-white p-4 border rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <p className="font-semibold text-xl">Table Number: {tableNumber}</p>
                  <p className="text-lg text-gray-600">Orders: {orderRounds} rounds</p>
                  <p className="text-lg text-gray-600">Paid At: {new Date(paidAt).toLocaleString()}</p>
                </div>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                      <p className="font-semibold">Order ID: {order.id}</p>
                      <div>
                        <ul className="ml-4 list-disc">
                          {order.items?.length > 0 ? (
                            order.items.map((item) => (
                              <li key={item.id}>
                                {item.menu?.name || "Unknown Menu"} ฿{item.menu?.price} x {item.quantity}
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
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500">No paid orders found.</p>
        )}
      </div>
    </div>
  );
};

export default Paidorders;