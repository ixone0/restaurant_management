"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome to the Home Page</h1>
      <Link
        href="/login"
        className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
      >
        Login
      </Link>
    </div>
  );
}
