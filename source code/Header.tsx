'use client';

import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Header() {
  // Placeholder for admin name (replace with actual auth data)
  const adminName = 'Admin User';

  const handleLogout = () => {
    // Implement logout logic (e.g., clear token, redirect to login)
    console.log('Logout clicked');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
        Medical Support System
      </h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {adminName}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Logout"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </header>
  );
}