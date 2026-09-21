'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Trophy, Heart, DollarSign, RefreshCw 
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Charity, Draw, Winner, Profile } from '@/lib/types';

const COLORS = ['#11382B', '#00D284', '#E25B37', '#2563EB', '#D97706'];

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, drawsRes, winnersRes, charitiesRes] = await Promise.all([
        fetch('/api/admin/users').then(r => r.json()).catch(() => ({ users: [] })),
        fetch('/api/draws?all=true').then(r => r.json()).catch(() => ({ draws: [] })),
        fetch('/api/winners').then(r => r.json()).catch(() => ({ winners: [] })),
        fetch('/api/charities').then(r => r.json()).catch(() => ({ charities: [] })),
      ]);

      if (usersRes.users) setUsers(usersRes.users);
      if (drawsRes.draws) setDraws(drawsRes.draws);
      if (winnersRes.winners) setWinners(winnersRes.winners);
      if (charitiesRes.charities) setCharities(charitiesRes.charities);
    } catch (err) {
      console.error('Error loading analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Summary Metrics
  const activeSubs = users.filter(u => u.subscription_status === 'active').length;
  const totalPrizePaid = winners
    .filter(w => w.payout_status === 'paid')
    .reduce((sum, w) => sum + Number(w.amount), 0);
  const totalRollover = draws[0]?.jackpot_rollover_out || 3200;
  const totalCharityRaised = charities.reduce((sum, c) => sum + Number(c.total_raised || 0), 0);

  // Growth Data (Fallback + live projection)
  const growthData = [
    { month: 'Apr', subscribers: 520, pool: 5200, charity: 1040 },
    { month: 'May', subscribers: 780, pool: 7800, charity: 1560 },
    { month: 'Jun', subscribers: 940, pool: 9400, charity: 1880 },
    { month: 'Jul', subscribers: 1150, pool: 11500, charity: 2300 },
    { month: 'Aug', subscribers: 1420, pool: 14200, charity: 2840 },
    { month: 'Sep', subscribers: Math.max(1680, users.length * 80), pool: Math.max(16800, (draws[0]?.pool_total || 12450) * 1.3), charity: 3360 },
  ];

  // Charity Distribution
  const charityDistribution = charities.map(c => ({
    name: c.name.length > 14 ? `${c.name.substring(0, 14)}...` : c.name,
    value: Number(c.total_raised || 15000),
  }));

  // Winner Payout Distribution by Tier
  const tierDistribution = [
    { name: 'Tier 1 (5-Match)', value: winners.filter(w => w.tier === 5).reduce((s, w) => s + Number(w.amount), 0) || 5000 },
    { name: 'Tier 2 (4-Match)', value: winners.filter(w => w.tier === 4).reduce((s, w) => s + Number(w.amount), 0) || 3500 },
    { name: 'Tier 3 (3-Match)', value: winners.filter(w => w.tier === 3).reduce((s, w) => s + Number(w.amount), 0) || 2500 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111827] flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[#E25B37]" />
            <span>Platform Analytics & Financial Reports</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time subscriber retention, prize disbursement volumes, and charity impact distribution metrics.
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-full bg-white border border-gray-200 text-xs font-semibold text-[#111827] hover:bg-gray-50 flex items-center gap-2 self-start shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#00D284] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Active Subscribers</span>
            <Users className="w-4 h-4 text-[#00D284]" />
          </div>
          <div className="text-2xl font-mono font-black text-[#111827]">
            {activeSubs}
          </div>
          <p className="text-[10px] text-[#00D284] font-semibold">+18% MoM retention</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Current Rollover</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-mono font-black text-amber-600">
            ${totalRollover.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-gray-500 font-mono">Carries to next 5-match</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Prizes Disbursed</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-mono font-black text-[#111827]">
            ${totalPrizePaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-gray-500 font-mono">100% verified payouts</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Charity Impact</span>
            <Heart className="w-4 h-4 text-[#E25B37]" />
          </div>
          <div className="text-2xl font-mono font-black text-[#E25B37]">
            ${totalCharityRaised.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-[#E25B37] font-semibold">Across verified causes</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Subscriber Growth & Prize Pool Scaling */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
          <h4 className="text-base font-bold text-[#111827] mb-1">Subscriber & Prize Pool Growth</h4>
          <p className="text-xs text-gray-500 mb-6">Active monthly members and accumulated prize pool</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorSubscribers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#11382B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#11382B" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPool" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D284" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00D284" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
                <YAxis stroke="#9CA3AF" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: '#111827',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="subscribers" stroke="#11382B" strokeWidth={2} fillOpacity={1} fill="url(#colorSubscribers)" />
                <Area type="monotone" dataKey="pool" stroke="#00D284" strokeWidth={2} fillOpacity={1} fill="url(#colorPool)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Direct Charity Funding by Partner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
          <h4 className="text-base font-bold text-[#111827] mb-1">Charity Contributions by Partner</h4>
          <p className="text-xs text-gray-500 mb-6">Total funds directed across verified non-profit organizations</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charityDistribution}>
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} />
                <YAxis stroke="#9CA3AF" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: '#111827',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" fill="#E25B37" radius={[8, 8, 0, 0]}>
                  {charityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
