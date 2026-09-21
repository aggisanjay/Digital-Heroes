'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, 
  Trophy, 
  Heart, 
  Award, 
  BarChart3, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import RoleBadge from '@/components/shared/RoleBadge';
import { store } from '@/lib/data/mock-db';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>('admin@digitalheroes.com');

  useEffect(() => {
    async function loadAdminSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user?.email) setAdminEmail(data.user.email);
        }
      } catch (e) {}
    }
    loadAdminSession();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Admin logout request failed:', e);
    }
    store.logout();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Draw Management', href: '/admin/draws', icon: Trophy },
    { label: 'Winner Proofs Queue', href: '/admin/winners', icon: Award },
    { label: 'Subscriber Directory', href: '/admin/users', icon: Users },
    { label: 'Charities CMS', href: '/admin/charities', icon: Heart },
    { label: 'Analytics & Reports', href: '/admin/reports', icon: BarChart3 },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200/80 text-gray-900 w-64 lg:w-72 select-none shadow-sm">
      {/* 1. Brand & Admin Tag */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <Link href="/admin/draws" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#11382B] p-2 flex items-center justify-center shadow-md shadow-[#11382B]/10 group-hover:scale-105 transition-transform">
            <img
              src="/logo-icon.png"
              alt="Digital Heroes Mascot"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-[#111827] leading-none">
              DIGITAL<span className="text-[#E25B37]">ADMIN</span>
            </span>
            <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-0.5">
              Control Station
            </span>
          </div>
        </Link>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Admin Badge Card */}
      <div className="p-4 m-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">
            System Administrator
          </span>
          <RoleBadge variant="admin" size="sm" />
        </div>
        <p className="text-xs text-[#111827] font-bold truncate">{adminEmail}</p>
        <p className="text-[10px] text-gray-500">Full platform database & draw sanctions active.</p>
      </div>

      {/* 3. Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#11382B] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#111827] hover:bg-gray-100 border border-transparent'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-[#00D284]' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-gray-100">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-bold text-[#11382B] bg-[#00D284]/15 hover:bg-[#00D284]/25 border border-[#00D284]/30 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Player Dashboard</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* 4. Sign Out */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-rose-50 hover:text-rose-600 border border-gray-200 text-xs font-semibold text-gray-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between text-[#111827]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-full bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-sm tracking-tight text-[#111827]">
            DIGITAL<span className="text-[#E25B37]">ADMIN</span>
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          Administrator
        </span>
      </div>

      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative flex-1 max-w-xs w-full bg-white z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
