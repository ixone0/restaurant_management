"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const Customer = () => {
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState(null);  // เพิ่มสถานะการชำระเงิน
    const searchParams = useSearchParams();
    const tableId = searchParams.get("tableId");

    useEffect(() => {
        fetch("http://localhost:5000/api/menu")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => setMenu(data))
            .catch((error) => console.error("Error fetching menu:", error));
    }, []);

    const addToCart = (item) => {
        if (item.available) {
            setCart((prevCart) => {
                const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
                if (existingItem) {
                    return prevCart.map((cartItem) =>
                        cartItem.id === item.id
                            ? { ...cartItem, quantity: cartItem.quantity + 1 }
                            : cartItem
                    );
                } else {
                    return [...prevCart, { ...item, quantity: 1 }];
                }
            });
        }
    };

    const removeFromCart = (itemToRemove) => {
        setCart((prevCart) =>
            prevCart.filter((item) => item.id !== itemToRemove.id)
        );
    };

    const handleCheckout = () => {
        console.log("Table ID:", tableId);
        console.log("Cart Items:", cart);

        fetch("http://localhost:5000/api/orders/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tableId,
                items: cart.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
                paymentStatus, // ส่งสถานะการชำระเงิน
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Order Response:", data);
                setCart([]);
                setPaymentStatus('Pending');  // ตั้งสถานะการชำระเงินหลังจากการสั่งซื้อ
            })
            .catch((error) => console.error("Error during checkout:", error));
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Table Number: {tableId}</h2>

                <h2 className="text-lg font-semibold mb-3">Menu</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {menu.length > 0 ? (
                        menu.map((item) => (
                            <div
                                className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center"
                                key={item.id}
                            >
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-24 h-24 object-cover rounded-md mb-2"
                                />
                                <h3 className="text-lg font-semibold">{item.name}</h3>
                                <p className="text-sm text-gray-600">{item.description || "No description"}</p>
                                <p className="font-bold text-blue-600">Price: ${item.price}</p>
                                
                                {item.available ? (
                                    <button
                                        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                                        onClick={() => addToCart(item)}
                                    >
                                        Add to Cart
                                    </button>
                                ) : (
                                    <div className="mt-2 text-red-500 font-bold">Out of Stock</div> // กรณีที่ไม่สามารถเลือกเมนูได้
                                )}
                            </div>
                        ))
                    ) : (
                        <p>Loading menu...</p>
                    )}
                </div>

                <h3 className="text-lg font-semibold mt-6">Cart</h3>
                <div className="mt-2">
                    {cart.length > 0 ? (
                        cart.map((item) => (
                            <div
                                className="flex justify-between items-center bg-gray-50 p-3 rounded-md mb-2 shadow-sm"
                                key={item.id}
                            >
                                <div>
                                    <h4 className="font-semibold">{item.name}</h4>
                                    <p className="text-sm">
                                        Price: ${item.price} x {item.quantity}
                                    </p>
                                </div>
                                <button
                                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                                    onClick={() => removeFromCart(item)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>Your cart is empty.</p>
                    )}
                </div>

                {cart.length > 0 && (
                    <button
                        className="w-full bg-green-500 text-white p-3 rounded-md mt-4 hover:bg-green-600 transition"
                        onClick={handleCheckout}
                    >
                        Confirm Order
                    </button>
                )}
                
                {paymentStatus && (
                    <div className="mt-4 text-center">
                        <p className="font-semibold text-lg">Payment Status: {paymentStatus}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Customer;
