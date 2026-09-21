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
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const navItems = [
    { label: 'Draw Management', href: '/admin/draws', icon: Trophy },
    { label: 'Winner Proofs Queue', href: '/admin/winners', icon: Award },
    { label: 'Subscriber Directory', href: '/admin/users', icon: Users },
    { label: 'Charities CMS', href: '/admin/charities', icon: Heart },
    { label: 'Analytics & Reports', href: '/admin/reports', icon: BarChart3 },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#080D18] border-r border-white/10 text-white w-64 lg:w-72 select-none">
      {/* 1. Brand & Admin Tag */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <Link href="/admin/draws" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-[#FF6E40] p-[2px] shadow-lg shadow-amber-400/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#06080F] rounded-[9px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight text-white leading-none">
              DIGITAL<span className="text-amber-400">ADMIN</span>
            </span>
            <span className="text-[10px] text-amber-300 font-bold tracking-widest uppercase mt-0.5">
              Control Station
            </span>
          </div>
        </Link>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Admin Badge Card */}
      <div className="p-4 m-4 rounded-2xl bg-amber-400/10 border border-amber-400/25 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
            System Administrator
          </span>
          <RoleBadge variant="admin" size="sm" />
        </div>
        <p className="text-xs text-white font-bold truncate">{adminEmail}</p>
        <p className="text-[10px] text-slate-400">Full platform database & draw sanctions active.</p>
      </div>

      {/* 3. Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400/20 to-[#FF6E40]/10 text-amber-300 border border-amber-400/30 shadow-lg shadow-amber-400/10'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-white/10">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#00F29D] bg-[#00F29D]/10 hover:bg-[#00F29D]/20 border border-[#00F29D]/30 transition-colors"
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
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/15 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-bold text-[#94A3B8] transition-colors"
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
      <div className="lg:hidden sticky top-0 z-40 bg-[#080D18]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-black text-sm tracking-tight text-white">
            DIGITAL<span className="text-amber-400">ADMIN</span>
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300">
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative flex-1 max-w-xs w-full bg-[#080D18] z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
