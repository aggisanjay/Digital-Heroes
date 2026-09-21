'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Eye, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  X
} from 'lucide-react';
import { Winner } from '@/lib/types';

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [inspectingWinner, setInspectingWinner] = useState<Winner | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [manualProofUrl, setManualProofUrl] = useState('');
  const [actionFeedbackToast, setActionFeedbackToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadWinners = async () => {
    try {
      const res = await fetch('/api/winners');
      const data = await res.json();
      if (data.winners) setWinners(data.winners);
    } catch (e) {
      console.warn('Failed to load winners:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWinners();
  }, []);

  const handleApproveProof = async (winnerId: string) => {
    try {
      await fetch('/api/winners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'review_proof', winnerId, approved: true }),
      });
      setInspectingWinner(null);
      setActionFeedbackToast('Proof approved and payout authorized in database!');
      setTimeout(() => setActionFeedbackToast(null), 3000);
      await loadWinners();
    } catch (e: any) {
      alert(e.message || 'Approval failed');
    }
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
        }),
      });
      setInspectingWinner(null);
      setRejectionReason('');
      setActionFeedbackToast('Scorecard proof marked as rejected.');
      setTimeout(() => setActionFeedbackToast(null), 3000);
      await loadWinners();
    } catch (e: any) {
      alert(e.message || 'Rejection failed');
    }
  };

  const handleMarkPaid = async (winnerId: string) => {
    try {
      await fetch('/api/winners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_paid', winnerId }),
      });
      setActionFeedbackToast('Payout marked as paid with electronic disbursement timestamp.');
      setTimeout(() => setActionFeedbackToast(null), 3000);
      await loadWinners();
    } catch (e: any) {
      alert(e.message || 'Mark paid failed');
    }
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
        }),
      });
      setInspectingWinner(null);
      setManualProofUrl('');
      setActionFeedbackToast(`Direct sanction approved for ${winner.profile?.full_name || winner.user_id}!`);
      setTimeout(() => setActionFeedbackToast(null), 3000);
      await loadWinners();
    } catch (e: any) {
      alert(e.message || 'Sanction failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-6 h-6 text-[#00F29D] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Award className="w-7 h-7 text-amber-400" />
            <span>Winner Verification & Payout Queue</span>
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Audit player scorecard proofs, approve or reject claims, and sanction electronic cash prize payouts.
          </p>
        </div>

        {actionFeedbackToast && (
          <div className="px-4 py-2 rounded-xl bg-[#00F29D]/15 border border-[#00F29D]/40 text-[#00F29D] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionFeedbackToast}</span>
          </div>
        )}
      </div>

      {/* Table */}
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
            {winners.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#64748B]">
                  No winners recorded in database. Run and publish a draw in the Draw Room.
                </td>
              </tr>
            ) : (
              winners.map(w => (
                <tr key={w.id} className="text-white hover:bg-white/5">
                  <td className="py-4">
                    <span className="font-bold block">{w.profile?.full_name || w.user_id}</span>
                    <span className="text-[10px] text-[#64748B] block">{w.profile?.email}</span>
                  </td>
                  <td className="py-4 font-mono text-[#00D2FF]">{w.draw_id?.substring(0, 8)}...</td>
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
                    {w.proof_status === 'submitted' && (
                      <button
                        onClick={() => {
                          setInspectingWinner(w);
                          setRejectionReason('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold inline-flex items-center gap-1.5 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & Audit</span>
                      </button>
                    )}

                    {w.proof_status === 'approved' && w.payout_status !== 'paid' && (
                      <button
                        onClick={() => handleMarkPaid(w.id)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00F29D] to-[#00D2FF] text-[#06080F] font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-[#00F29D]/20 hover:opacity-90"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Disburse Payout</span>
                      </button>
                    )}

                    {w.proof_status === 'unsubmitted' && w.payout_status !== 'paid' && (
                      <button
                        onClick={() => {
                          setInspectingWinner(w);
                          setManualProofUrl('https://images.unsplash.com/photo-1592919505780-303950717480?w=1200&auto=format&fit=crop&q=80');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <span>Audit / Sanction</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Proof Inspection Modal */}
      {inspectingWinner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0D1322] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Scorecard Audit & Verification</span>
              </h3>
              <button
                onClick={() => setInspectingWinner(null)}
                className="text-[#94A3B8] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm block">
                    {inspectingWinner.profile?.full_name || inspectingWinner.user_id}
                  </span>
                  <span className="text-xs text-[#94A3B8]">{inspectingWinner.profile?.email}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-bold text-[#00F29D] block">
                    ${Number(inspectingWinner.amount).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-amber-300">Tier {inspectingWinner.tier} Match</span>
                </div>
              </div>

              {/* Image Preview */}
              {(inspectingWinner.proof_url || manualProofUrl) ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Submitted Scorecard Photo
                  </span>
                  <div className="h-60 w-full rounded-2xl overflow-hidden bg-black border border-white/15 relative">
                    <img
                      src={inspectingWinner.proof_url || manualProofUrl}
                      alt="Scorecard Proof"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30 text-xs text-amber-200">
                  Player has not uploaded a scorecard yet. You can apply verified sample proof to sanction directly.
                </div>
              )}

              {/* Rejection input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Rejection Reason (If Disapproving)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Score numbers on photo do not match round date"
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-400"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleRejectProof(inspectingWinner.id)}
                  className="flex-1 py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Proof</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApproveProof(inspectingWinner.id)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00F29D] to-[#00D2FF] text-[#06080F] text-xs font-black uppercase tracking-wider shadow-lg shadow-[#00F29D]/20 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Authorize</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
