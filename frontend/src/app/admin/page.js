'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";

const Admin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('CHEF');
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState('');
    const [token, setToken] = useState(null);
    const router = useRouter();

    // Fetch token from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
        if (!storedToken) {
          router.push('/login'); // เปลี่ยนเส้นทางไปยังหน้า Login ถ้าไม่มี token
          return;
        }
        console.log('Token:', storedToken); // แสดง token ใน console
    }, []);

    useEffect(() => {
        if (!token) return; // ถ้าไม่มี token ให้ไม่ทำอะไร
        const fetchEmployees = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/users/getEmployees', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setEmployees(data);
                } else {
                    setError(data.error);
                }
            } catch (error) {
                setError('Error fetching employees');
            }
        };
        fetchEmployees();
    }, [token]);

    const handleRegister = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users/registerEmployee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role }),
            });

            const data = await response.json();

            if (response.ok) {
                setEmployees((prev) => [...prev, data]);
                setUsername('');
                setPassword('');
                setRole('CHEF');
            } else {
                setError(data.error || 'Failed to register employee');
            }
        } catch (error) {
            setError('Error registering employee');
        }
    };

    const handleEditRole = async (employeeId, newRole) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/editRole/${employeeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // ส่ง token ใน header
                },
                body: JSON.stringify({ role: newRole }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                setError(data.error || 'Failed to update role');
                return;
            }
    
            setEmployees((prev) =>
                prev.map((emp) => (emp.id === employeeId ? data : emp))
            );
        } catch (error) {
            setError('Error updating role');
        }
    };
    

    const handleDeleteEmployee = async (employeeId) => {
        const confirmed = window.confirm('Are you sure you want to delete this employee?');
        if (!confirmed) return;

        try {
            const response = await fetch(`http://localhost:5000/api/users/deleteEmployee/${employeeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`, // ส่ง token ใน header
                },
            });

            if (response.ok) {
                setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
            } else {
                setError('Failed to delete employee');
            }
        } catch (error) {
            setError('Error deleting employee');
        }
    };
    
    const handleLogout = () => {
        localStorage.removeItem('token'); // ลบ token
        router.push('/login'); // เปลี่ยนเส้นทางไปยังหน้า Login
      };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
            <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-lg border border-gray-200">
                <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Admin Management</h2>
                <div className="flex justify-between mb-4">
                    <button
                        onClick={() => router.push("/cashier")}
                        className="bg-black text-white py-2 px-4 rounded hover:bg-gray-700 mb-4"
                        >
                        To Cashier
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 mb-4"
                        >
                        Log Out
                    </button>
                    <button
                        onClick={() => router.push("/kitchen")}
                        className="bg-black text-white py-2 px-4 rounded hover:bg-gray-700 mb-4"
                        >
                        To Kitchen
                    </button>
                    
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-3">Register Employee</h3>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="CHEF">Chef</option>
                        <option value="CASHIER">Cashier</option>
                    </select>
                    <button
                        onClick={handleRegister}
                        className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition"
                    >
                        Register
                    </button>
                </div>

                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

                <h3 className="text-xl font-medium text-gray-700 mt-6">Registered Employees</h3>
                <ul className="mt-3 divide-y divide-gray-200">
                    {employees.map((employee) => (
                        <li key={employee.id} className="flex justify-between items-center p-3">
                            <div className="text-gray-700 font-medium">
                                {employee.username} - {employee.role}
                            </div>
                            <div className="flex items-center">
                                <select
                                    value={employee.role}
                                    onChange={(e) => handleEditRole(employee.id, e.target.value)}
                                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="CHEF">Chef</option>
                                    <option value="CASHIER">Cashier</option>
                                </select>
                                <button
                                    onClick={() => handleDeleteEmployee(employee.id)}
                                    className="ml-4 text-red-600 hover:text-red-700 font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Admin;
