import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import UserDashboard from '@/components/dashboard/UserDashboard';

export default function DashboardPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#06080F]">
      <Navbar />
      <UserDashboard />
      <Footer />
    </main>
  );
}
