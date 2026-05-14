'use client';

import { ReactNode } from 'react';
import Sidebar from './components/Sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-blue-50"> {/* Light blue background */}
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-blue-50">
          {children}
        </main>
      </div>
    </div>
  );
}