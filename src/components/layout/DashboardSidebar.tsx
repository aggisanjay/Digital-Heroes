'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Target, 
  Trophy, 
  Heart, 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  ChevronRight,
  RefreshCw,
  Clock
} from 'lucide-react';
import RoleBadge from '@/components/shared/RoleBadge';

interface UserData {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  subscription_status: string;
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.warn('Failed to load current session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [pathname]);

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
    { label: 'Overview', href: '/dashboard', icon: BarChart3, exact: true },
    { label: 'Tactile Scores', href: '/dashboard/scores', icon: Target },
    { label: 'Draws & Winnings', href: '/dashboard/draws', icon: Trophy },
    { label: 'Charity Impact', href: '/dashboard/charity', icon: Heart },
    { label: 'Billing & Plan', href: '/dashboard/billing', icon: CreditCard },
  ];

  const subStatus = user?.subscription_status || 'inactive';
  const isPastDue = subStatus === 'past_due';
  const isActive = subStatus === 'active';
  const isAdmin = user?.role === 'admin';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0A101D] border-r border-white/10 text-white w-64 lg:w-72 select-none">
      {/* 1. Brand Logo */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F29D] via-[#00D2FF] to-[#FF6E40] p-[2px] shadow-lg shadow-[#00F29D]/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#06080F] rounded-[9px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#00F29D]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight text-white leading-none">
              DIGITAL<span className="text-[#00F29D]">HEROES</span>
            </span>
            <span className="text-[10px] text-[#94A3B8] font-bold tracking-widest uppercase mt-0.5">
              Player Portal
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

      {/* 2. Persistent User Profile & Status Card */}
      <div className="p-4 m-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="font-bold text-sm text-white truncate">
              {user?.full_name || user?.email?.split('@')[0] || 'Subscriber'}
            </p>
            <p className="text-[11px] text-[#94A3B8] truncate">{user?.email || 'Loading...'}</p>
          </div>
          <RoleBadge variant={isAdmin ? 'admin' : isActive ? 'active' : 'lapsed'} size="sm" />
        </div>

        {/* Live Payment Status Pill */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]">
              Membership
            </span>
            {isActive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00F29D]/15 text-[#00F29D] border border-[#00F29D]/30">
                <ShieldCheck className="w-3 h-3" />
                <span>Active</span>
              </span>
            ) : isPastDue ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                <span>Past Due</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-slate-300 border border-white/15">
                <Clock className="w-3 h-3" />
                <span>Inactive</span>
              </span>
            )}
          </div>

          {/* Action CTA for Past Due / Inactive */}
          {isPastDue && (
            <Link
              href="/dashboard/billing"
              className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center justify-between transition-colors"
            >
              <span>Retry Payment</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {!isActive && !isPastDue && (
            <Link
              href="/subscribe"
              className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-[#00F29D]/15 hover:bg-[#00F29D]/25 border border-[#00F29D]/30 text-[#00F29D] text-xs font-bold flex items-center justify-between transition-colors"
            >
              <span>Activate Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* 3. Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActiveLink = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                isActiveLink
                  ? 'bg-gradient-to-r from-[#00F29D]/20 to-[#00D2FF]/10 text-[#00F29D] border border-[#00F29D]/30 shadow-lg shadow-[#00F29D]/10'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActiveLink ? 'text-[#00F29D]' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Admin Console shortcut if user is admin */}
        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-white/10">
            <Link
              href="/admin/draws"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Console</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </nav>

      {/* 4. Sign Out Footer */}
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
      {/* Mobile Top Header Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#0A101D]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-black text-sm tracking-tight">
            DIGITAL<span className="text-[#00F29D]">HEROES</span>
          </span>
        </div>

        {/* Mobile Status Indicator */}
        <div className="flex items-center gap-2">
          {isActive ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00F29D]/15 text-[#00F29D]">Active</span>
          ) : isPastDue ? (
            <Link href="/dashboard/billing" className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 animate-pulse">
              Retry Payment
            </Link>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-400">Inactive</span>
          )}
        </div>
      </div>

      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative flex-1 max-w-xs w-full bg-[#0A101D] z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
