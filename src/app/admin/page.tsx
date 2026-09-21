'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminPanel from '@/components/admin/AdminPanel';
import { store } from '@/lib/data/mock-db';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(store.getCurrentUser());
  }, []);

  if (!currentUser) return null;

  if (currentUser.role !== 'admin') {
    return (
      <main className="min-h-screen flex flex-col bg-[#06080F]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="glass-panel-elevated rounded-3xl p-8 max-w-md w-full text-center space-y-4 border border-rose-500/30">
            <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-xl font-bold text-white">Administrator Role Required</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              This route is protected by administrative role validation. You are currently logged in as{' '}
              <strong className="text-white">{currentUser.full_name}</strong> ({currentUser.role}).
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  store.login('admin@digitalheroes.org');
                  window.location.reload();
                }}
                className="w-full py-3 rounded-xl btn-primary text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Switch to Admin Persona (Marcus Vance)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#06080F]">
      <Navbar />
      <AdminPanel />
      <Footer />
    </main>
  );
}
