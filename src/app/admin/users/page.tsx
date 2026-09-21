'use client';

import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, CreditCard, RefreshCw, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { Profile, Score, Subscription } from '@/lib/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userScores, setUserScores] = useState<Score[]>([]);
  const [userSub, setUserSub] = useState<Subscription | null>(null);
  const [editingScore, setEditingScore] = useState<Score | null>(null);
  const [newScoreVal, setNewScoreVal] = useState<number>(36);
  const [loading, setLoading] = useState(true);
  const [actionFeedbackToast, setActionFeedbackToast] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users && Array.isArray(data.users)) {
        setUsers(data.users);
        if (!selectedUser && data.users.length > 0) {
          handleSelectUser(data.users[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (u: Profile) => {
    setSelectedUser(u);
    setEditingScore(null);
    try {
      const res = await fetch(`/api/scores?userId=${encodeURIComponent(u.id)}`);
      const data = await res.json();
      if (data.scores) {
        setUserScores(data.scores);
      } else {
        setUserScores([]);
      }
    } catch (err) {
      console.error('Failed to load scores for user:', err);
      setUserScores([]);
    }
  };

  const handleUpdateSubscriptionStatus = async (status: string) => {
    if (!selectedUser) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, subscription_status: status }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedUser(prev => prev ? { ...prev, subscription_status: status as any } : null);
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, subscription_status: status as any } : u));
        setActionFeedbackToast(`Updated ${selectedUser.full_name || selectedUser.email} status to ${status}.`);
        setTimeout(() => setActionFeedbackToast(null), 3000);
      } else {
        alert(data.error || 'Failed to update subscription status');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveScoreOverride = async (scoreId: string) => {
    if (!selectedUser) return;
    try {
      const res = await fetch('/api/scores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scoreId,
          score: newScoreVal,
          date: editingScore?.date || new Date().toISOString().substring(0, 10),
          courseName: editingScore?.course_name || 'Tournament Course',
          userId: selectedUser.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionFeedbackToast('Score override saved successfully.');
        setTimeout(() => setActionFeedbackToast(null), 3000);
        // Refresh scores
        handleSelectUser(selectedUser);
        setEditingScore(null);
      } else {
        alert(data.error || 'Failed to update score');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving score override');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {actionFeedbackToast && (
        <div className="p-4 rounded-2xl bg-[#00F29D]/10 border border-[#00F29D]/30 text-xs text-[#00F29D] font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionFeedbackToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#00F29D]" /> Subscriber Accounts Directory
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Review user profiles, inspect rolling 5 golf scores, and manage subscription statuses directly in database.
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="px-4 py-2 rounded-xl glass-panel text-xs font-bold text-white hover:border-[#00F29D]/40 flex items-center gap-2 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User List */}
        <div className="lg:col-span-1 glass-panel-elevated rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
              Registered Profiles ({users.length})
            </h3>
            {loading && <span className="text-[10px] text-[#94A3B8] animate-pulse">Syncing...</span>}
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {users.length === 0 && !loading ? (
              <p className="text-xs text-[#64748B] italic p-4 text-center">No users found in database.</p>
            ) : (
              users.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    selectedUser?.id === u.id
                      ? 'bg-[#00F29D]/10 border-[#00F29D] shadow-lg shadow-[#00F29D]/5'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white truncate max-w-[150px]">
                      {u.full_name || 'Member'}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
                        u.subscription_status === 'active'
                          ? 'bg-[#00F29D]/20 text-[#00F29D]'
                          : u.subscription_status === 'past_due'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-400/20 text-amber-300'
                      }`}
                    >
                      {u.subscription_status}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1 truncate">{u.email}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#94A3B8]">
                    <span className="capitalize font-mono px-1.5 py-0.5 rounded bg-white/5">Role: {u.role}</span>
                    <span>{u.charity_contribution_pct || 10}% charity</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Selected User Inspector */}
        <div className="lg:col-span-2 glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10">
          {selectedUser ? (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{selectedUser.full_name || 'No Name Set'}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white font-mono">
                      {selectedUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8] font-mono mt-1">{selectedUser.email}</p>
                  <p className="text-[10px] text-[#64748B] font-mono mt-0.5">ID: {selectedUser.id}</p>
                </div>

                {/* Subscription Status Control */}
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                  <span className="text-xs text-[#94A3B8] pl-2 font-medium">Status:</span>
                  <select
                    value={selectedUser.subscription_status}
                    disabled={updatingStatus}
                    onChange={e => handleUpdateSubscriptionStatus(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-black border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-[#00F29D]"
                  >
                    <option value="active">active</option>
                    <option value="trialing">trialing</option>
                    <option value="past_due">past_due</option>
                    <option value="canceled">canceled</option>
                    <option value="lapsed">lapsed</option>
                  </select>
                </div>
              </div>

              {/* Membership & Subscription Metadata */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#00D2FF]" /> Subscription Metadata
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#00D2FF]/10 text-[#00D2FF] font-mono text-[11px]">
                    Database Profile
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold">Subscription Status</span>
                    <span className={`font-mono font-bold uppercase ${
                      selectedUser.subscription_status === 'active' ? 'text-[#00F29D]' : 'text-amber-400'
                    }`}>
                      {selectedUser.subscription_status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold">Charity Allocation</span>
                    <span className="font-mono text-[#FF6E40] font-bold">
                      {selectedUser.charity_contribution_pct || 10}% of fee
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold">Designated Charity</span>
                    <span className="font-mono text-white">
                      {selectedUser.charity_id || 'Default General Cause'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scores Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#00F29D]" /> Rolling 5 Golf Scores Window
                  </h4>
                  <span className="text-xs text-[#94A3B8]">
                    {userScores.length} of 5 scores recorded
                  </span>
                </div>

                {userScores.length === 0 ? (
                  <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 text-xs text-[#64748B]">
                    No scores logged for this player yet. When the player enters Stableford rounds, they will appear here.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userScores.map(sc => (
                      <div
                        key={sc.id}
                        className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs hover:border-white/20 transition-all"
                      >
                        <div>
                          <span className="font-mono font-bold text-white text-base mr-3 text-[#00F29D]">
                            {sc.score} pts
                          </span>
                          <span className="text-slate-400 mr-2">{sc.date}</span>
                          <span className="text-[#64748B]">({sc.course_name || 'Standard Course'})</span>
                        </div>

                        {editingScore?.id === sc.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              max={45}
                              value={newScoreVal}
                              onChange={e => setNewScoreVal(Number(e.target.value))}
                              className="w-16 px-2 py-1 bg-black border border-white/20 text-white rounded text-center font-mono font-bold"
                            />
                            <button
                              onClick={() => handleSaveScoreOverride(sc.id)}
                              className="px-3 py-1 rounded bg-[#00F29D] text-black font-bold text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingScore(null)}
                              className="px-2 py-1 text-[#64748B] hover:text-white"
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
                            className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition-colors font-medium"
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
            <div className="p-16 text-center text-[#64748B] text-xs">
              Select a member account on the left to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
