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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {actionFeedbackToast && (
        <div className="p-4 rounded-2xl bg-[#00D284]/15 border border-[#00D284]/40 text-[#11382B] text-xs font-semibold flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00D284]" />
            <span>{actionFeedbackToast}</span>
          </div>
          <button onClick={() => setActionFeedbackToast(null)} className="text-gray-500 hover:text-gray-700 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111827] flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#E25B37]" />
            <span>Subscriber Accounts Directory</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review user profiles, inspect rolling 5 golf scores, and manage subscription statuses directly in database.
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="px-4 py-2 rounded-full bg-white border border-gray-200 text-xs font-semibold text-[#111827] hover:bg-gray-50 flex items-center gap-2 self-start shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#00D284] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User List */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Registered Profiles ({users.length})
            </h3>
            {loading && <span className="text-[10px] text-gray-400 animate-pulse">Syncing...</span>}
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {users.length === 0 && !loading ? (
              <p className="text-xs text-gray-400 italic p-4 text-center">No users found in database.</p>
            ) : (
              users.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    selectedUser?.id === u.id
                      ? 'bg-[#00D284]/10 border-[#00D284] shadow-xs ring-1 ring-[#00D284]/30'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#111827] truncate max-w-[150px]">
                      {u.full_name || 'Member'}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase font-mono ${
                        u.subscription_status === 'active'
                          ? 'bg-[#00D284]/15 text-[#11382B] border border-[#00D284]/30'
                          : u.subscription_status === 'past_due'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {u.subscription_status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{u.email}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
                    <span className="capitalize font-mono px-2 py-0.5 rounded-full bg-white border border-gray-200">Role: {u.role}</span>
                    <span className="font-semibold text-[#E25B37]">{u.charity_contribution_pct || 10}% charity</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Selected User Inspector */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
          {selectedUser ? (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#111827]">{selectedUser.full_name || 'No Name Set'}</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-mono font-semibold">
                      {selectedUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-1">{selectedUser.email}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {selectedUser.id}</p>
                </div>

                {/* Subscription Status Control */}
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200">
                  <span className="text-xs text-gray-500 pl-2 font-medium">Status:</span>
                  <select
                    value={selectedUser.subscription_status}
                    disabled={updatingStatus}
                    onChange={e => handleUpdateSubscriptionStatus(e.target.value)}
                    className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-[#111827] focus:outline-none focus:border-[#11382B]"
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
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#111827] uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#11382B]" /> Subscription Metadata
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00D284]/15 text-[#11382B] border border-[#00D284]/30 font-mono text-[11px] font-bold">
                    Database Profile
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-bold">Subscription Status</span>
                    <span className={`font-mono font-bold uppercase ${
                      selectedUser.subscription_status === 'active' ? 'text-[#11382B]' : 'text-amber-600'
                    }`}>
                      {selectedUser.subscription_status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-bold">Charity Allocation</span>
                    <span className="font-mono text-[#E25B37] font-bold">
                      {selectedUser.charity_contribution_pct || 10}% of fee
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-bold">Designated Charity</span>
                    <span className="font-mono text-[#111827]">
                      {selectedUser.charity_id || 'Default General Cause'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scores Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#00D284]" /> Rolling 5 Golf Scores Window
                  </h4>
                  <span className="text-xs text-gray-500">
                    {userScores.length} of 5 scores recorded
                  </span>
                </div>

                {userScores.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-400">
                    No scores logged for this player yet. When the player enters Stableford rounds, they will appear here.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userScores.map(sc => (
                      <div
                        key={sc.id}
                        className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs hover:border-gray-300 transition-all"
                      >
                        <div>
                          <span className="font-mono font-black text-base mr-3 text-[#111827]">
                            {sc.score} pts
                          </span>
                          <span className="text-gray-500 mr-2">{sc.date}</span>
                          <span className="text-gray-400">({sc.course_name || 'Standard Course'})</span>
                        </div>

                        {editingScore?.id === sc.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              max={45}
                              value={newScoreVal}
                              onChange={e => setNewScoreVal(Number(e.target.value))}
                              className="w-16 px-2 py-1 bg-white border border-gray-200 text-[#111827] rounded-lg text-center font-mono font-bold"
                            />
                            <button
                              onClick={() => handleSaveScoreOverride(sc.id)}
                              className="px-3 py-1 rounded-full bg-[#11382B] text-white font-bold text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingScore(null)}
                              className="px-2 py-1 text-gray-400 hover:text-gray-700"
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
                            className="px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-[#111827] text-xs hover:bg-gray-100 transition-colors font-semibold"
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
            <div className="p-16 text-center text-gray-400 text-xs">
              Select a member account on the left to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
