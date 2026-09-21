import React from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#06080F] flex flex-col lg:flex-row text-white">
      {/* Persistent Left Navigation Sidebar */}
      <AdminSidebar />

      {/* Main Routed Content Stage */}
      <main className="flex-1 lg:pl-64 xl:pl-72 min-w-0 flex flex-col">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
