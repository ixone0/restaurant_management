"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function SalesDashboard() {
  const [salesData, setSalesData] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(""); // For hourly graph
  const [selectedMonth, setSelectedMonth] = useState(""); // For daily graph
  const [selectedYear, setSelectedYear] = useState(""); // For daily graph

  useEffect(() => {
    fetch("http://localhost:5000/api/sales/")
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map(item => ({
          menuName: item.name,
          price: item.price,
          cost: item.cost,
          profit: item.profit,
          quantity: item.quantity,
          paidAt: new Date(item.paidAt),
        }));
        console.log("Fetched sales data:", formattedData);
        setSalesData(formattedData);
      })
      .catch((error) => console.error("Error fetching sales data:", error));
  }, []);

  const getDailyRevenue = () => {
    return salesData.reduce((acc, item) => {
      const date = item.paidAt.toISOString().split("T")[0]; // YYYY-MM-DD
      const month = item.paidAt.getMonth() + 1; // Month 1-12
      const year = item.paidAt.getFullYear();

      if (
        (selectedMonth === "" || month === parseInt(selectedMonth)) &&
        (selectedYear === "" || year === parseInt(selectedYear))
      ) {
        if (!acc[date]) {
          acc[date] = { revenue: 0, profit: 0 }; // Initialize revenue and profit
        }
        acc[date].revenue += item.price * item.quantity;
        acc[date].profit += item.profit * item.quantity; // Adding profit
      }
      return acc;
    }, {});
  };

  const getMonthlyRevenue = () => {
    return salesData.reduce((acc, item) => {
      const month = item.paidAt.toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { revenue: 0, profit: 0 }; // Initialize revenue and profit
      }
      acc[month].revenue += item.price * item.quantity;
      acc[month].profit += item.profit * item.quantity; // Adding profit
      return acc;
    }, {});
  };

  const getYearlyRevenue = () => {
    return salesData.reduce((acc, item) => {
      const year = item.paidAt.getFullYear();
      if (!acc[year]) {
        acc[year] = { revenue: 0, profit: 0 }; // Initialize revenue and profit
      }
      acc[year].revenue += item.price * item.quantity;
      acc[year].profit += item.profit * item.quantity; // Adding profit
      return acc;
    }, {});
  };

  const formatDataForChart = (data) => {
    return Object.entries(data)
      .map(([key, value]) => ({
        name: key,
        revenue: value.revenue,
        profit: value.profit,
      }))
      .sort((a, b) => new Date(a.name) - new Date(b.name)); // Sort by date
  };

  const renderChart = () => {
    let revenueData;
    switch (selectedGraph) {
      case "monthly":
        revenueData = formatDataForChart(getMonthlyRevenue());
        break;
      case "yearly":
        revenueData = formatDataForChart(getYearlyRevenue());
        break;
      default:
        revenueData = formatDataForChart(getDailyRevenue());
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={revenueData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#4A5568" name="Total Revenue" />
          <Line type="monotone" dataKey="profit" stroke="#48BB78" name="Total Profit" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Graph information in restaurant</h2>
      <select
        onChange={(e) => setSelectedGraph(e.target.value)}
        value={selectedGraph}
        className="border rounded-md p-2 mb-4"
      >
        <option value="daily">Daily</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
        <option value="hourly">Hourly</option>
      </select>

      {selectedGraph === "daily" && (
        <>
          <div className="flex space-x-4 mb-4">
            <select
              onChange={(e) => setSelectedMonth(e.target.value)}
              value={selectedMonth}
              className="border rounded-md p-2"
            >
              <option value="">Select Month</option>
              {[...Array(12)].map((_, index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>

            <select
              onChange={(e) => setSelectedYear(e.target.value)}
              value={selectedYear}
              className="border rounded-md p-2"
            >
              <option value="">Select Year</option>
              {[2023, 2024, 2025].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {selectedGraph === "hourly" && (
        <>
          <h3 className="text-lg font-medium mb-2">Select Date</h3>
          <input
            type="date"
            onChange={(e) => setSelectedDate(e.target.value)}
            value={selectedDate}
            className="border rounded-md p-2 mb-4"
          />
        </>
      )}

      {renderChart()}
    </div>
  );
}