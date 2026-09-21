'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Trophy, Heart, Award, BarChart3, ShieldCheck, 
  CheckCircle2, XCircle, DollarSign, Play, RefreshCw, Edit2, 
  Trash2, Plus, Eye, ArrowRight, TrendingUp, AlertCircle 
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { store } from '@/lib/data/mock-db';
import { Profile, Charity, Draw, Winner, Score } from '@/lib/types';
import { generateDrawNumbers } from '@/lib/draw/engine';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'draws' | 'charities' | 'winners' | 'analytics'>('draws');
  
  // Data state
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  
  // User Management State
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userScores, setUserScores] = useState<Score[]>([]);
  const [editingScore, setEditingScore] = useState<Score | null>(null);
  const [newScoreVal, setNewScoreVal] = useState<number>(36);

  // Draw Management State
  const [drawMode, setDrawMode] = useState<'random' | 'algorithmic'>('algorithmic');
  const [targetNumbers, setTargetNumbers] = useState<number[]>([12, 24, 31, 38, 42]);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Charity CMS State
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);
  const [isNewCharity, setIsNewCharity] = useState(false);
  const [charityForm, setCharityForm] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    logo_url: '',
    cover_image_url: '',
    featured: false,
  });

  // Winner Proof Inspection State
  const [inspectingWinner, setInspectingWinner] = useState<Winner | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [manualProofUrl, setManualProofUrl] = useState('');
  const [actionFeedbackToast, setActionFeedbackToast] = useState<string | null>(null);

  const loadData = async () => {
    setCurrentUser(store.getCurrentUser());
    // 1. Fetch real winners from /api/winners (backed by Supabase)
    try {
      const res = await fetch('/api/winners');
      const data = await res.json();
      if (data.winners && data.winners.length > 0) {
        setWinners(data.winners);
      } else {
        setWinners(store.getWinners());
      }
    } catch {
      setWinners(store.getWinners());
    }

    // 2. Fetch real users from /api/admin/users (backed by Supabase)
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users && data.users.length > 0) {
        setUsers(data.users);
      } else {
        setUsers(store.getAllUsers());
      }
    } catch {
      setUsers(store.getAllUsers());
    }

    // 3. Fetch real draws from /api/draws (backed by Supabase)
    try {
      const res = await fetch('/api/draws?all=true');
      const data = await res.json();
      if (data.draws && data.draws.length > 0) {
        setDraws(data.draws);
      } else {
        setDraws(store.getDraws());
      }
    } catch {
      setDraws(store.getDraws());
    }

    setCharities(store.getCharities());
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- User Surface Handlers ---
  const handleSelectUser = (u: Profile) => {
    setSelectedUser(u);
    setUserScores(store.getUserScores(u.id));
    setEditingScore(null);
  };

  const handleUpdateSubscriptionStatus = async (status: any) => {
    if (!selectedUser) return;
    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, subscription_status: status }),
      });
    } catch (err) {
      console.warn(err);
    }
    store.updateProfile(selectedUser.id, { subscription_status: status });
    setSelectedUser({ ...selectedUser, subscription_status: status });
    setActionFeedbackToast(`Updated ${selectedUser.full_name || selectedUser.email} status to ${status}.`);
    setTimeout(() => setActionFeedbackToast(null), 3000);
    loadData();
  };

  const handleSaveScoreOverride = (scoreId: string) => {
    if (!selectedUser) return;
    store.updateScore(scoreId, newScoreVal, editingScore?.date || '2026-09-01');
    setUserScores(store.getUserScores(selectedUser.id));
    setEditingScore(null);
  };

  // --- Draw Surface Handlers ---
  const handleGenerateRandomTargets = () => {
    const numbers = generateDrawNumbers();
    setTargetNumbers(numbers);
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setPublishSuccess(null);
    try {
      const res = await fetch('/api/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulate', mode: drawMode, targetNumbers }),
      });
      const data = await res.json();
      if (data.simulation) {
        setSimulationResult(data.simulation);
      } else {
        const sim = store.simulateDraw(drawMode, targetNumbers);
        setSimulationResult(sim);
      }
    } catch (e) {
      console.error(e);
      const sim = store.simulateDraw(drawMode, targetNumbers);
      setSimulationResult(sim);
    } finally {
      setIsSimulating(false);
    }
  };

  const handlePublishDraw = async () => {
    if (!confirm('Are you sure you want to publish this draw? This will lock in winner records and snapshot rollover balances in the database.')) {
      return;
    }
    try {
      const res = await fetch('/api/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', mode: drawMode, targetNumbers }),
      });
      const data = await res.json();
      if (data.draw) {
        setPublishSuccess(`Draw ${data.draw.period} published to database with ${data.winnersCount ?? 0} verified subscriber winners!`);
      } else {
        const newDraw = store.publishDraw(drawMode, targetNumbers);
        setPublishSuccess(`Draw ${newDraw.period} published successfully! Winners notified and jackpot rollover updated.`);
      }
      setSimulationResult(null);
      await loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteDraw = async (drawId?: string) => {
    const isAll = !drawId;
    const msg = isAll 
      ? 'Are you sure you want to reset all test draws and winners from the database? This returns the draw room to a fresh slate.' 
      : 'Are you sure you want to delete this draw and its associated winner records?';
    if (!confirm(msg)) return;

    try {
      const url = drawId ? `/api/draws?id=${encodeURIComponent(drawId)}` : '/api/draws';
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        if (!drawId) {
          (store as any).draws = [];
          (store as any).winners = [];
        }
        setActionFeedbackToast(data.message || 'Draws cleared successfully.');
        setTimeout(() => setActionFeedbackToast(null), 3000);
        await loadData();
      } else {
        alert(data.error || 'Failed to delete draw');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete draw');
    }
  };

  // --- Charity CMS Handlers ---
  const handleSaveCharity = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNewCharity) {
      store.createCharity({
        ...charityForm,
        events: [],
      });
    } else if (editingCharity) {
      store.updateCharity(editingCharity.id, charityForm);
    }
    setEditingCharity(null);
    setIsNewCharity(false);
    loadData();
  };

  const handleDeleteCharity = (id: string) => {
    if (confirm('Delete this charity organization?')) {
      store.deleteCharity(id);
      loadData();
    }
  };

  // --- Winner Verification Handlers ---
  const handleApproveProof = async (winnerId: string) => {
    try {
      await fetch('/api/winners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review_proof',
          winnerId,
          approved: true,
          adminId: currentUser?.id,
        }),
      });
    } catch (e) {
      console.warn(e);
    }
    try {
      store.reviewWinnerProof(winnerId, currentUser?.id || 'admin-001', true);
    } catch {}
    setInspectingWinner(null);
    setActionFeedbackToast('Proof approved and payout authorized in database!');
    setTimeout(() => setActionFeedbackToast(null), 3000);
    loadData();
  };

  const handleRejectProof = async (winnerId: string) => {
    try {
      await fetch('/api/winners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review_proof',
          winnerId,
          approved: false,
          rejectionReason: rejectionReason || 'Score verification rejected by administrator.',
          adminId: currentUser?.id,
        }),
      });
    } catch (e) {
      console.warn(e);
    }
    try {
      store.reviewWinnerProof(winnerId, currentUser?.id || 'admin-001', false, rejectionReason || 'Score verification rejected by administrator.');
    } catch {}
    setInspectingWinner(null);
    setRejectionReason('');
    setActionFeedbackToast('Scorecard proof marked as rejected.');
    setTimeout(() => setActionFeedbackToast(null), 3000);
    loadData();
  };

  const handleMarkPaid = async (winnerId: string) => {
    try {
      await fetch('/api/winners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_paid',
          winnerId,
          adminId: currentUser?.id,
        }),
      });
    } catch (e) {
      console.warn(e);
    }
    try {
      store.markWinnerPaid(winnerId, currentUser?.id || 'admin-001');
    } catch {}
    setActionFeedbackToast('Payout marked as paid with electronic disbursement audit timestamp.');
    setTimeout(() => setActionFeedbackToast(null), 3000);
    loadData();
  };

  const handleDirectSanction = async (winner: Winner, customProofUrl?: string) => {
    const verifiedProof = customProofUrl || manualProofUrl || winner.proof_url || 'https://images.unsplash.com/photo-1592919505780-303950717480?w=1200&auto=format&fit=crop&q=80';
    try {
      await fetch('/api/winners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'direct_sanction',
          winnerId: winner.id,
          proofUrl: verifiedProof,
          adminId: currentUser?.id,
        }),
      });
    } catch (e) {
      console.warn(e);
    }
    try {
      store.submitWinnerProof(winner.id, verifiedProof);
      store.reviewWinnerProof(winner.id, currentUser?.id || 'admin-001', true);
    } catch {}
    setInspectingWinner(null);
    setManualProofUrl('');
    setActionFeedbackToast(`Direct sanction approved for ${winner.profile?.full_name || winner.user_id}!`);
    setTimeout(() => setActionFeedbackToast(null), 3000);
    loadData();
  };

  // Analytics Chart Datasets
  const growthData = [
    { month: 'Apr', subscribers: 520, pool: 5200, charity: 1040 },
    { month: 'May', subscribers: 780, pool: 7800, charity: 1560 },
    { month: 'Jun', subscribers: 940, pool: 9400, charity: 1880 },
    { month: 'Jul', subscribers: 1150, pool: 11500, charity: 2300 },
    { month: 'Aug', subscribers: 1245, pool: 12450, charity: 2490 },
    { month: 'Sep', subscribers: 1425, pool: 14250, charity: 2850 },
  ];

  const charityDistribution = charities.map(c => ({
    name: c.name.split(' ')[0],
    value: Number(c.total_raised),
  }));

  const COLORS = ['#00F29D', '#00D2FF', '#FF6E40', '#FFA000'];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111827] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header & Surface Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6E40]/10 border border-[#FF6E40]/30 text-[#FF6E40] text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Administrative Master Control
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Platform Administration
            </h1>
          </div>

          {actionFeedbackToast && (
            <div className="p-3 px-5 rounded-2xl bg-[#00F29D]/15 border border-[#00F29D]/40 text-[#00F29D] text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#00F29D]/10 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionFeedbackToast}</span>
            </div>
          )}

          {/* 5 Surface Selector Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => setActiveTab('draws')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'draws'
                  ? 'bg-[#00F29D] text-[#06080F] shadow-lg shadow-[#00F29D]/20'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>1. Draws & Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('winners')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'winners'
                  ? 'bg-[#00F29D] text-[#06080F] shadow-lg shadow-[#00F29D]/20'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>2. Winners & Proofs</span>
              {winners.some(w => w.proof_status === 'submitted') && (
                <span className="w-2 h-2 rounded-full bg-[#FF6E40] animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'users'
                  ? 'bg-[#00F29D] text-[#06080F] shadow-lg shadow-[#00F29D]/20'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>3. User Management</span>
            </button>

            <button
              onClick={() => setActiveTab('charities')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'charities'
                  ? 'bg-[#00F29D] text-[#06080F] shadow-lg shadow-[#00F29D]/20'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>4. Charity CMS</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'analytics'
                  ? 'bg-[#00F29D] text-[#06080F] shadow-lg shadow-[#00F29D]/20'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>5. Reports & Analytics</span>
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SURFACE 1: DRAW MANAGEMENT & SIMULATOR                                */}
        {/* ==================================================================== */}
        {activeTab === 'draws' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Configuration Terminal */}
              <div className="lg:col-span-1 glass-panel-elevated rounded-3xl p-6 border border-white/10 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#00F29D]" /> Configure Monthly Draw
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Select algorithmic vs random mode, specify target numbers, and simulate dry-run.
                  </p>
                </div>

                {/* Mode Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
                    Draw Calculation Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDrawMode('algorithmic')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        drawMode === 'algorithmic'
                          ? 'bg-[#00F29D]/20 border-[#00F29D] text-[#00F29D]'
                          : 'bg-white/5 border-white/10 text-[#94A3B8]'
                      }`}
                    >
                      Algorithmic
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawMode('random')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        drawMode === 'random'
                          ? 'bg-[#00D2FF]/20 border-[#00D2FF] text-[#00D2FF]'
                          : 'bg-white/5 border-white/10 text-[#94A3B8]'
                      }`}
                    >
                      Random Lottery
                    </button>
                  </div>
                </div>

                {/* 5 Target Numbers */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                      5 Winning Target Numbers
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTargetNumbers([12, 24, 31, 38, 42])}
                        className="text-[11px] text-[#00D2FF] hover:underline"
                        title="Load verified scores of active subscriber aggisanjay1234@gmail.com"
                      >
                        Match Sanjay [12, 24, 31, 38, 42]
                      </button>
                      <span className="text-white/20">|</span>
                      <button
                        type="button"
                        onClick={handleGenerateRandomTargets}
                        className="text-[11px] text-[#00F29D] hover:underline"
                      >
                        Roll Random 5
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {targetNumbers.map((n, i) => (
                      <input
                        key={i}
                        type="number"
                        min={1}
                        max={45}
                        value={n}
                        onChange={e => {
                          const updated = [...targetNumbers];
                          updated[i] = Number(e.target.value);
                          setTargetNumbers(updated);
                        }}
                        className="w-full py-2.5 text-center font-mono font-bold text-base rounded-xl bg-[#06080F] border border-white/10 text-white focus:outline-none focus:border-[#00F29D]"
                      />
                    ))}
                  </div>
                </div>

                {/* Current Rollover Balance Display */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1 text-xs">
                  <div className="text-[#94A3B8]">Incoming Jackpot Rollover:</div>
                  <div className="text-xl font-mono font-bold text-amber-400">
                    ${store.getLatestJackpotRollover().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                    className="w-full py-3.5 rounded-xl btn-primary text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>{isSimulating ? 'Simulating Dry-Run...' : 'Run Dry-Run Simulation'}</span>
                  </button>

                  <button
                    onClick={handlePublishDraw}
                    className="w-full py-3.5 rounded-xl glass-panel border border-[#FF6E40]/30 hover:border-[#FF6E40] text-xs font-bold text-[#FF6E40] flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Officially Publish & Lock Draw</span>
                  </button>
                </div>

                {publishSuccess && (
                  <div className="p-3.5 rounded-xl bg-[#00F29D]/10 border border-[#00F29D]/30 text-xs text-[#00F29D]">
                    {publishSuccess}
                  </div>
                )}
              </div>

              {/* Simulation Result Presentation */}
              <div className="lg:col-span-2 glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Simulation & Tier Math Inspector
                  </h3>
                  <p className="text-xs text-[#94A3B8] mb-6">
                    Dry-run calculates exact tier allocations, splits among multiple winners, and jackpot rollover with zero state alteration.
                  </p>

                  {simulationResult ? (
                    <div className="space-y-6">
                      {/* Summary Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] text-[#94A3B8] uppercase block">Subscribers</span>
                          <span className="text-lg font-mono font-bold text-white">
                            {simulationResult.activeSubscriberCount}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] text-[#94A3B8] uppercase block">Cycle Pool</span>
                          <span className="text-lg font-mono font-bold text-white">
                            ${simulationResult.totalCyclePool.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] text-[#94A3B8] uppercase block">Prizes Won</span>
                          <span className="text-lg font-mono font-bold text-[#00F29D]">
                            ${simulationResult.totalPrizeDistributed.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] text-[#94A3B8] uppercase block">Next Rollover</span>
                          <span className="text-lg font-mono font-bold text-amber-400">
                            ${simulationResult.nextJackpotRolloverOut.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Tier Split Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-white/10 text-[#64748B]">
                              <th className="pb-2">Tier</th>
                              <th className="pb-2">Pool Split</th>
                              <th className="pb-2">Total Pool</th>
                              <th className="pb-2">Winners</th>
                              <th className="pb-2">Prize Per Winner</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            <tr className="text-white">
                              <td className="py-2.5 font-bold text-[#00F29D]">Tier 1 (5-Match)</td>
                              <td className="py-2.5">40% + Rollover</td>
                              <td className="py-2.5 font-mono">
                                ${simulationResult.tiers.tier5.totalPool.toFixed(2)}
                              </td>
                              <td className="py-2.5 font-bold">{simulationResult.tiers.tier5.winnersCount}</td>
                              <td className="py-2.5 font-mono font-bold text-[#00F29D]">
                                ${simulationResult.tiers.tier5.prizePerWinner.toFixed(2)}
                              </td>
                            </tr>
                            <tr className="text-white">
                              <td className="py-2.5 font-bold text-[#00D2FF]">Tier 2 (4-Match)</td>
                              <td className="py-2.5">35%</td>
                              <td className="py-2.5 font-mono">
                                ${simulationResult.tiers.tier4.totalPool.toFixed(2)}
                              </td>
                              <td className="py-2.5 font-bold">{simulationResult.tiers.tier4.winnersCount}</td>
                              <td className="py-2.5 font-mono font-bold text-[#00D2FF]">
                                ${simulationResult.tiers.tier4.prizePerWinner.toFixed(2)}
                              </td>
                            </tr>
                            <tr className="text-white">
                              <td className="py-2.5 font-bold text-[#FF6E40]">Tier 3 (3-Match)</td>
                              <td className="py-2.5">25%</td>
                              <td className="py-2.5 font-mono">
                                ${simulationResult.tiers.tier3.totalPool.toFixed(2)}
                              </td>
                              <td className="py-2.5 font-bold">{simulationResult.tiers.tier3.winnersCount}</td>
                              <td className="py-2.5 font-mono font-bold text-[#FF6E40]">
                                ${simulationResult.tiers.tier3.prizePerWinner.toFixed(2)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Simulated Winners List */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
                          Projected Winners ({simulationResult.winners.length})
                        </h4>
                        <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                          {simulationResult.winners.length === 0 ? (
                            <p className="text-xs text-[#64748B]">No winning matches in this simulation run.</p>
                          ) : (
                            simulationResult.winners.map((w: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-bold text-white">{w.userName || w.userId}</span>
                                  <span className="text-[10px] text-[#64748B] ml-2 font-mono">
                                    Matched: [{w.matchedNumbers.join(', ')}]
                                  </span>
                                </div>
                                <span className="font-mono font-bold text-[#00F29D]">
                                  +${w.prizeAmount.toFixed(2)}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-[#64748B] text-xs">
                      Click &ldquo;Run Dry-Run Simulation&rdquo; to project payouts across the active subscriber base.
                    </div>
                  )}
                </div>

                {/* Published Draw History */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                      Recent Published Draws ({draws.length})
                    </h4>
                    {draws.length > 0 && (
                      <button
                        onClick={() => handleDeleteDraw()}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="Clear all test draws and winner records"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Reset All Test Draws</span>
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {draws.length === 0 ? (
                      <p className="text-xs text-[#64748B] italic p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                        No published draws in ledger. Use the simulator above to dry-run and publish an official draw.
                      </p>
                    ) : (
                      draws.map(d => (
                        <div
                          key={d.id}
                          className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-white">{d.period}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#00F29D] font-bold ml-2">
                              {d.mode}
                            </span>
                            <span className="text-slate-400 ml-2">
                              Numbers: [{d.target_numbers.join(', ')}]
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right font-mono">
                              <span className="text-white font-bold">${d.pool_total.toLocaleString()}</span>
                              <span className="text-[10px] text-amber-400 block">
                                Rollover Out: ${d.jackpot_rollover_out.toLocaleString()}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteDraw(d.id)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                              title="Delete this draw"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SURFACE 2: WINNERS MANAGEMENT & PROOF VERIFICATION                    */}
        {/* ==================================================================== */}
        {activeTab === 'winners' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" /> Winner Verification & Payout Queue
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Inspect scorecard proofs, audit dates against draw records, approve/reject, and mark payouts as completed.
                </p>
              </div>
            </div>

            <div className="glass-panel-elevated rounded-3xl p-6 border border-white/10 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#64748B]">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Draw</th>
                    <th className="pb-3 font-semibold">Tier</th>
                    <th className="pb-3 font-semibold">Prize</th>
                    <th className="pb-3 font-semibold">Proof Status</th>
                    <th className="pb-3 font-semibold">Payout</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {winners.map(w => (
                    <tr key={w.id} className="text-white hover:bg-white/5">
                      <td className="py-4">
                        <span className="font-bold">{w.profile?.full_name || w.user_id}</span>
                        <span className="text-[10px] text-[#64748B] block">{w.profile?.email}</span>
                      </td>
                      <td className="py-4 font-mono text-[#00D2FF]">{w.draw_id}</td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded bg-white/5 font-semibold">
                          Tier {w.tier} ({w.tier}-Match)
                        </span>
                      </td>
                      <td className="py-4 font-mono font-bold text-[#00F29D] text-sm">
                        ${Number(w.amount).toFixed(2)}
                      </td>
                      <td className="py-4">
                        {w.proof_status === 'approved' && (
                          <span className="px-2 py-1 rounded bg-[#00F29D]/10 text-[#00F29D] font-bold">
                            Verified & Approved
                          </span>
                        )}
                        {w.proof_status === 'submitted' && (
                          <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-300 font-bold flex items-center gap-1 w-fit">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            Proof Uploaded (Pending Review)
                          </span>
                        )}
                        {w.proof_status === 'unsubmitted' && (
                          <span className="px-2 py-1 rounded bg-white/5 text-[#64748B]">
                            Awaiting Player Upload
                          </span>
                        )}
                        {w.proof_status === 'rejected' && (
                          <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 font-bold">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        {w.payout_status === 'paid' ? (
                          <span className="px-2 py-1 rounded bg-[#00F29D]/10 text-[#00F29D] font-bold">
                            Paid
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-white/5 text-[#94A3B8]">Pending</span>
                        )}
                      </td>
                      <td className="py-4 text-right space-x-2 whitespace-nowrap">
                        {/* 1. If proof uploaded (submitted): Inspect & Review */}
                        {w.proof_status === 'submitted' && (
                          <button
                            onClick={() => {
                              setInspectingWinner(w);
                              setRejectionReason('');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold inline-flex items-center gap-1.5 transition-all active:scale-95"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            Inspect & Review
                          </button>
                        )}

                        {/* 2. If awaiting player upload: Admin can Direct Sanction or Attach Proof */}
                        {w.proof_status === 'unsubmitted' && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleDirectSanction(w)}
                              className="px-3 py-1.5 rounded-lg bg-[#00F29D]/15 hover:bg-[#00F29D]/25 text-[#00F29D] border border-[#00F29D]/30 text-xs font-bold transition-all active:scale-95"
                              title="Directly authorize payout with tournament official verification"
                            >
                              Direct Sanction
                            </button>
                            <button
                              onClick={() => {
                                setInspectingWinner(w);
                                setRejectionReason('');
                                setManualProofUrl('');
                              }}
                              className="px-2.5 py-1.5 rounded-lg glass-panel text-xs text-[#94A3B8] hover:text-white"
                            >
                              Attach Proof
                            </button>
                          </div>
                        )}

                        {/* 3. If approved and pending payout: Disburse Payout */}
                        {w.proof_status === 'approved' && w.payout_status !== 'paid' && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setInspectingWinner(w)}
                              className="px-2.5 py-1.5 rounded-lg glass-panel text-xs text-[#94A3B8] hover:text-white"
                            >
                              View Proof
                            </button>
                            <button
                              onClick={() => handleMarkPaid(w.id)}
                              className="px-3 py-1.5 rounded-lg btn-primary text-xs font-bold transition-all active:scale-95"
                            >
                              Disburse Payout
                            </button>
                          </div>
                        )}

                        {/* 4. If already paid: View Audit Receipt */}
                        {w.payout_status === 'paid' && (
                          <button
                            onClick={() => setInspectingWinner(w)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#00F29D] hover:bg-white/10 font-bold"
                          >
                            Audit Receipt
                          </button>
                        )}

                        {/* 5. If rejected: Allow Re-evaluation */}
                        {w.proof_status === 'rejected' && (
                          <button
                            onClick={() => handleDirectSanction(w)}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs hover:bg-rose-500/25 font-bold"
                          >
                            Re-evaluate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Proof Review Modal */}
            {inspectingWinner && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">Inspect Scorecard Proof</h3>
                      <p className="text-xs text-[#94A3B8]">
                        Winner: {inspectingWinner.profile?.full_name} • Prize: ${Number(inspectingWinner.amount).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => setInspectingWinner(null)}
                      className="text-[#94A3B8] hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Proof Image / Upload Box */}
                  <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/50 min-h-64 max-h-96 flex flex-col items-center justify-center p-4">
                    {inspectingWinner.proof_url ? (
                      <img
                        src={inspectingWinner.proof_url}
                        alt="Winner Scorecard Proof"
                        className="w-full h-auto object-contain max-h-80 rounded-xl"
                      />
                    ) : (
                      <div className="text-center space-y-3 py-8">
                        <Award className="w-12 h-12 text-[#94A3B8] mx-auto opacity-50" />
                        <div>
                          <p className="text-sm font-bold text-white">Player Has Not Yet Uploaded Scorecard</p>
                          <p className="text-xs text-[#94A3B8] mt-1">
                            As Administrator, you can attach a tournament official verified scorecard or sanction directly.
                          </p>
                        </div>
                        <div className="pt-2 max-w-sm mx-auto">
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/... or paste image URL"
                            value={manualProofUrl}
                            onChange={e => setManualProofUrl(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#00F29D]"
                          />
                          <button
                            type="button"
                            onClick={() => setManualProofUrl('https://images.unsplash.com/photo-1592919505780-303950717480?w=1200&auto=format&fit=crop&q=80')}
                            className="text-[11px] text-[#00F29D] hover:underline mt-1.5 block mx-auto"
                          >
                            Use Sample Verified Tournament Card
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">
                      Rejection Reason (only required if rejecting):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Scorecard date does not match round record"
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/20"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleRejectProof(inspectingWinner.id)}
                      className="px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs font-bold transition-colors"
                    >
                      Reject Proof
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInspectingWinner(null);
                          setManualProofUrl('');
                        }}
                        className="px-4 py-2.5 rounded-xl glass-panel text-xs text-[#94A3B8] hover:text-white"
                      >
                        Cancel
                      </button>
                      {inspectingWinner.proof_url ? (
                        <button
                          type="button"
                          onClick={() => handleApproveProof(inspectingWinner.id)}
                          className="px-6 py-2.5 rounded-xl btn-primary text-xs font-bold"
                        >
                          Approve Proof & Authorize Payout
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDirectSanction(inspectingWinner, manualProofUrl)}
                          className="px-6 py-2.5 rounded-xl btn-primary text-xs font-bold"
                        >
                          Sanction & Authorize Payout
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* SURFACE 3: USER MANAGEMENT & SCORE OVERRIDES                          */}
        {/* ==================================================================== */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 glass-panel-elevated rounded-3xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00F29D]" /> Subscriber Accounts ({users.length})
              </h3>
              <div className="space-y-2">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedUser?.id === u.id
                        ? 'bg-[#00F29D]/10 border-[#00F29D] shadow-md'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{u.full_name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          u.subscription_status === 'active'
                            ? 'bg-[#00F29D]/20 text-[#00F29D]'
                            : 'bg-amber-400/20 text-amber-300'
                        }`}
                      >
                        {u.subscription_status}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">{u.email}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10">
              {selectedUser ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedUser.full_name}</h3>
                      <p className="text-xs text-[#94A3B8]">{selectedUser.email}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#94A3B8]">Status:</span>
                      <select
                        value={selectedUser.subscription_status}
                        onChange={e => handleUpdateSubscriptionStatus(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-black border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="active">active</option>
                        <option value="trialing">trialing</option>
                        <option value="past_due">past_due</option>
                        <option value="canceled">canceled</option>
                        <option value="lapsed">lapsed</option>
                      </select>
                    </div>
                  </div>

                  {/* Billing & Subscription Metadata Card */}
                  {(() => {
                    const sub = store.getUserSubscription(selectedUser.id);
                    return (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                            Stripe Subscription Details
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-[10px] text-[#00D2FF]">
                            {sub?.stripe_customer_id || 'cus_unlinked'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase">Plan Tier</span>
                            <span className="font-bold text-white uppercase font-mono">
                              {sub?.plan_type || 'monthly'} ($
                              {sub?.plan_type === 'yearly' ? '190/yr' : '19/mo'})
                            </span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase">Renewal Date</span>
                            <span className="font-mono text-white">
                              {sub?.current_period_end
                                ? new Date(sub.current_period_end).toLocaleDateString()
                                : 'Next Cycle'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase">Charity Cut</span>
                            <span className="font-mono text-[#FF6E40] font-bold">
                              {selectedUser.charity_contribution_pct || 10}%
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              const newPlan = sub?.plan_type === 'yearly' ? 'monthly' : 'yearly';
                              store.createOrUpdateSubscription(selectedUser.id, newPlan, selectedUser.subscription_status);
                              loadData();
                            }}
                            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] text-white"
                          >
                            Toggle Plan (Currently: {sub?.plan_type || 'monthly'})
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* User Scores Editor */}
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3">
                      User Golf Scores (Rolling 5 Window)
                    </h4>
                    {userScores.length === 0 ? (
                      <p className="text-xs text-[#64748B]">No scores logged yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {userScores.map(sc => (
                          <div
                            key={sc.id}
                            className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-mono font-bold text-white text-sm mr-3">
                                {sc.score} pts
                              </span>
                              <span className="text-slate-400 mr-2">{sc.date}</span>
                              <span className="text-[#64748B]">({sc.course_name})</span>
                            </div>

                            {editingScore?.id === sc.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={1}
                                  max={45}
                                  value={newScoreVal}
                                  onChange={e => setNewScoreVal(Number(e.target.value))}
                                  className="w-16 px-2 py-1 bg-black border border-white/20 text-white rounded text-center"
                                />
                                <button
                                  onClick={() => handleSaveScoreOverride(sc.id)}
                                  className="px-2 py-1 rounded bg-[#00F29D] text-black font-bold text-[11px]"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingScore(null)}
                                  className="text-[#64748B] hover:text-white"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingScore(sc);
                                  setNewScoreVal(sc.score);
                                }}
                                className="px-2.5 py-1 rounded bg-white/10 text-white text-[11px] hover:bg-white/20"
                              >
                                Edit Score
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-[#64748B] text-xs">
                  Select a user account on the left to inspect their rolling scores and manage subscription states.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SURFACE 4: CHARITY CMS                                               */}
        {/* ==================================================================== */}
        {activeTab === 'charities' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#FF6E40]" /> Partner Charity CMS
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Manage causes, update branding and imagery, track funds raised, and organize tournaments.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsNewCharity(true);
                  setEditingCharity(null);
                  setCharityForm({
                    name: '',
                    slug: '',
                    tagline: '',
                    description: '',
                    logo_url: '',
                    cover_image_url: '',
                    featured: false,
                  });
                }}
                className="px-4 py-2 rounded-xl btn-charity text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Partner Charity
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {charities.map(c => (
                <div
                  key={c.id}
                  className="glass-panel-elevated rounded-3xl p-6 border border-white/10 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.logo_url || ''}
                          alt={c.name}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10"
                        />
                        <div>
                          <h4 className="text-base font-bold text-white">{c.name}</h4>
                          <p className="text-xs text-[#FF6E40]">{c.tagline}</p>
                        </div>
                      </div>
                      {c.featured && (
                        <span className="px-2 py-0.5 rounded bg-[#FF6E40]/20 text-[#FF6E40] text-[10px] font-bold">
                          Featured
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8]">Total Raised:</span>
                      <span className="font-mono font-bold text-white">
                        ${Number(c.total_raised).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCharity(c);
                          setIsNewCharity(false);
                          setCharityForm({
                            name: c.name,
                            slug: c.slug,
                            tagline: c.tagline || '',
                            description: c.description,
                            logo_url: c.logo_url || '',
                            cover_image_url: c.cover_image_url || '',
                            featured: c.featured,
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg glass-panel text-xs text-[#00F29D] font-semibold hover:border-white/30"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={() => handleDeleteCharity(c.id)}
                        className="px-3 py-1.5 rounded-lg glass-panel text-xs text-rose-400 font-semibold hover:border-rose-400/30"
                      >
                        Delete
                      </button>
                    </div>

                    <Link
                      href={`/charities/${c.slug}`}
                      className="text-xs text-[#94A3B8] hover:text-white flex items-center gap-1"
                    >
                      <span>Public Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit / Add Charity Modal */}
            {(editingCharity || isNewCharity) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">
                      {isNewCharity ? 'Create New Charity' : 'Edit Charity'}
                    </h3>
                    <button
                      onClick={() => {
                        setEditingCharity(null);
                        setIsNewCharity(false);
                      }}
                      className="text-[#94A3B8] hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveCharity} className="space-y-4">
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">Organization Name</label>
                      <input
                        type="text"
                        required
                        value={charityForm.name}
                        onChange={e => setCharityForm({ ...charityForm, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">Short Tagline</label>
                      <input
                        type="text"
                        value={charityForm.tagline}
                        onChange={e => setCharityForm({ ...charityForm, tagline: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">Description</label>
                      <textarea
                        required
                        rows={3}
                        value={charityForm.description}
                        onChange={e => setCharityForm({ ...charityForm, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[#94A3B8] mb-1">Logo URL</label>
                        <input
                          type="url"
                          value={charityForm.logo_url}
                          onChange={e => setCharityForm({ ...charityForm, logo_url: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#94A3B8] mb-1">Cover Image URL</label>
                        <input
                          type="url"
                          value={charityForm.cover_image_url}
                          onChange={e => setCharityForm({ ...charityForm, cover_image_url: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={charityForm.featured}
                        onChange={e => setCharityForm({ ...charityForm, featured: e.target.checked })}
                        className="accent-[#FF6E40]"
                      />
                      <label htmlFor="featured" className="text-xs text-white">
                        Feature on Homepage Spotlight
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCharity(null);
                          setIsNewCharity(false);
                        }}
                        className="px-4 py-2 rounded-xl glass-panel text-xs text-[#94A3B8]"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="px-6 py-2 rounded-xl btn-charity text-xs font-bold">
                        Save Charity
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* SURFACE 5: REPORTS & ANALYTICS (RECHARTS)                             */}
        {/* ==================================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#00F29D]" /> Financial & Operational Analytics
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Real-time subscriber velocity, prize pool trends, and charitable disbursement breakdowns.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart 1: Subscriber Growth & Prize Pool Scaling */}
              <div className="glass-panel-elevated rounded-3xl p-6 border border-white/10">
                <h4 className="text-sm font-bold text-white mb-1">Subscriber & Prize Pool Growth</h4>
                <p className="text-xs text-[#94A3B8] mb-6">Active monthly members and accumulated prize pool</p>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <defs>
                        <linearGradient id="colorSubscribers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00F29D" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#00F29D" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPool" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00D2FF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00D2FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0D1322',
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                        }}
                      />
                      <Area type="monotone" dataKey="subscribers" stroke="#00F29D" fillOpacity={1} fill="url(#colorSubscribers)" />
                      <Area type="monotone" dataKey="pool" stroke="#00D2FF" fillOpacity={1} fill="url(#colorPool)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Direct Charity Funding by Partner */}
              <div className="glass-panel-elevated rounded-3xl p-6 border border-white/10">
                <h4 className="text-sm font-bold text-white mb-1">Charity Contributions by Partner</h4>
                <p className="text-xs text-[#94A3B8] mb-6">Total funds directed across the 4 verified organizations</p>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charityDistribution}>
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0D1322',
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="value" fill="#FF6E40" radius={[8, 8, 0, 0]}>
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
        )}
      </div>
    </div>
  );
}
