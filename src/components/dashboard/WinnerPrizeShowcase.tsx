'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ShieldCheck, 
  ExternalLink,
  RefreshCw,
  X,
  Camera,
  ArrowRight,
  Info,
  DollarSign,
  Receipt,
  ChevronDown,
  ChevronUp,
  Eye,
  Check,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Winner, Profile, Draw, Score } from '@/lib/types';
import { store } from '@/lib/data/mock-db';

interface Props {
  user: Profile;
  winnings: Winner[];
  draws: Draw[];
  scores?: Score[];
  onRefresh: () => void;
}

const SAMPLE_SCORECARD_URL = 'https://images.unsplash.com/photo-1592919505780-303950717480?w=1200&auto=format&fit=crop&q=80';

export default function WinnerPrizeShowcase({ user, winnings, draws, scores = [], onRefresh }: Props) {
  const [selectedWinnerForProof, setSelectedWinnerForProof] = useState<Winner | null>(null);
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPaidLedger, setShowPaidLedger] = useState(true);

  // Separate active pending winnings vs finalized paid winnings
  const pendingWinnings = winnings.filter(w => w.payout_status !== 'paid');
  const paidWinnings = winnings.filter(w => w.payout_status === 'paid');

  // Compute active user rolling 5 ticket numbers
  const userRollingScores = scores.length >= 5 
    ? scores.slice(0, 5).map(s => s.score)
    : scores.length > 0
    ? scores.map(s => s.score)
    : [12, 24, 31, 38, 42]; // Fallback demonstration scores

  const isFullTicket = scores.length >= 5;
  const latestDraw = draws[0];
  const activePeriod = latestDraw?.period || new Date().toISOString().substring(0, 7);
  const currentPoolTotal = latestDraw?.pool_total || 12450;
  const rolloverBalance = latestDraw?.jackpot_rollover_out || 3200;

  // Open proof upload modal
  const handleOpenUploadModal = (winner: Winner) => {
    setSelectedWinnerForProof(winner);
    setPreviewImage(winner.proof_url || null);
    setErrorMsg(null);
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 5MB.');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit proof
  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWinnerForProof || !previewImage) {
      setErrorMsg('Please choose an image file or sample scorecard.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Send to API
      await fetch('/api/winners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winnerId: selectedWinnerForProof.id,
          proofUrl: previewImage,
        }),
      });

      // 2. Also save to store
      try {
        store.submitWinnerProof(selectedWinnerForProof.id, previewImage);
      } catch {}

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F29D', '#00D2FF'],
      });

      setSuccessToast('Scorecard proof submitted! Queued for Administrator review.');
      setSelectedWinnerForProof(null);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit proof.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-[#00F29D]/15 border border-[#00F29D]/40 text-white text-xs flex items-center justify-between gap-3 shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2 text-[#00F29D]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold text-white">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-white/60 hover:text-white text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 1: ACTION REQUIRED — PENDING PRIZE CLAIMS                    */}
      {/* ==================================================================== */}
      {pendingWinnings.length > 0 && (
        <div className="space-y-6">
          {pendingWinnings.map((win) => {
            const draw = draws.find(d => d.id === win.draw_id) || draws[0];
            const isApproved = win.proof_status === 'approved';
            const isSubmitted = win.proof_status === 'submitted';
            const isRejected = win.proof_status === 'rejected';

            return (
              <div 
                key={win.id}
                className="relative overflow-hidden rounded-3xl border border-[#00F29D]/40 bg-gradient-to-br from-[#00F29D]/15 via-[#0A101D] to-[#00D2FF]/10 p-6 sm:p-8 shadow-2xl shadow-[#00F29D]/10"
              >
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00F29D]/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#00D2FF]/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 space-y-6">
                  {/* Top Badge & Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00F29D] to-[#00D2FF] flex items-center justify-center text-[#06080F] shadow-lg shadow-[#00F29D]/30 shrink-0">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00F29D]/20 text-[#00F29D] border border-[#00F29D]/30">
                            Draw Winner #{win.draw_id?.substring(0, 7) || '2026-09'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            Tier {win.tier} Match
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                          Congratulations! You Won ${Number(win.amount).toLocaleString()} USD
                        </h2>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Prize Claim Status</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase mt-1 ${
                        isApproved
                          ? 'bg-[#00F29D]/20 text-[#00F29D] border border-[#00F29D]/40'
                          : isSubmitted
                          ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                          : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      }`}>
                        {isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        <span>
                          {isApproved 
                            ? 'Approved — Payout Queued' 
                            : isSubmitted 
                            ? 'Scorecard Under Audit' 
                            : 'Scorecard Upload Required'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Winning Draw Numbers Visual */}
                  {draw && (
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#00F29D]" />
                          <span>Winning Target Numbers ({draw.period}):</span>
                        </p>
                        <p className="text-[11px] text-[#94A3B8]">Your rolling 5-score ticket matched {win.tier} numbers in this cycle.</p>
                      </div>
                      <div className="flex gap-2">
                        {draw.target_numbers.map((num, i) => (
                          <div 
                            key={i} 
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs transition-all ${
                              i < win.tier 
                                ? 'bg-gradient-to-br from-[#00F29D] to-[#00D2FF] text-[#06080F] shadow-md shadow-[#00F29D]/30 scale-105 ring-2 ring-[#00F29D]'
                                : 'bg-white/10 text-white/70 border border-white/15'
                            }`}
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4-Step Verification Stepper */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
                      Winner Verification & Payout Lifecycle
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {/* Step 1 */}
                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#00F29D]/20 text-[#00F29D] flex items-center justify-center font-bold text-xs shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">1. Win Confirmed</p>
                          <p className="text-[10px] text-[#00F29D]">Numbers matched</p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                        isApproved || isSubmitted
                          ? 'bg-[#00F29D]/10 border-[#00F29D]/30'
                          : 'bg-white/5 border-white/10'
                      }`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isApproved || isSubmitted ? 'bg-[#00F29D] text-[#06080F]' : 'bg-white/10 text-white'
                        }`}>
                          {isApproved ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">2. Proof Scorecard</p>
                          <p className={`text-[10px] font-semibold ${
                            isApproved ? 'text-[#00F29D]' : isSubmitted ? 'text-cyan-300' : 'text-amber-400'
                          }`}>
                            {isApproved ? 'Verified' : isSubmitted ? 'Under Review' : 'Upload Needed'}
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                        isApproved
                          ? 'bg-[#00F29D]/10 border-[#00F29D]/30'
                          : 'bg-white/5 border-white/10'
                      }`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isApproved ? 'bg-[#00F29D] text-[#06080F]' : 'bg-white/10 text-white'
                        }`}>
                          {isApproved ? <CheckCircle2 className="w-4 h-4" /> : '3'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">3. Admin Sanction</p>
                          <p className="text-[10px] text-[#94A3B8]">
                            {isApproved ? 'Approved by Admin' : 'Awaiting Review'}
                          </p>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="p-3.5 rounded-2xl border bg-white/5 border-white/10 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 bg-white/10 text-white">
                          4
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">4. Direct Transfer</p>
                          <p className="text-[10px] text-[#94A3B8]">
                            {isApproved ? 'Disbursement In Transit' : 'Pending Verification'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Proof Card & Action Button */}
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {win.proof_url ? (
                        <div 
                          onClick={() => setViewingProofUrl(win.proof_url || null)}
                          className="relative group w-20 h-20 rounded-xl overflow-hidden border border-white/20 shrink-0 bg-black cursor-pointer"
                        >
                          <img 
                            src={win.proof_url} 
                            alt="Uploaded Scorecard Proof" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-[#94A3B8] shrink-0">
                          <Camera className="w-6 h-6" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">Scorecard Verification Photo</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            isApproved
                              ? 'bg-[#00F29D]/20 text-[#00F29D]'
                              : isSubmitted
                              ? 'bg-[#00D2FF]/20 text-[#00D2FF]'
                              : isRejected
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-400/20 text-amber-300'
                          }`}>
                            {win.proof_status || 'unsubmitted'}
                          </span>
                        </div>
                        <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                          {isApproved
                            ? 'Your official scorecard screenshot has been verified by the administrator. Payout is sanctioned and being disbursed.'
                            : isSubmitted
                            ? 'Proof screenshot uploaded! The Digital Heroes audit committee is verifying your tournament card.'
                            : isRejected
                            ? `Verification note: ${win.proof_rejection_reason || 'Scorecard details could not be matched. Please upload a clearer photo.'}`
                            : 'Upload a screenshot or photo of your physical scorecard or golf app to claim your payout.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      {isApproved ? (
                        <div className="px-4 py-3 rounded-xl bg-[#00F29D]/15 border border-[#00F29D]/40 text-[#00F29D] font-bold text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approved for Payout</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenUploadModal(win)}
                          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#00F29D] to-[#00D2FF] text-[#06080F] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00F29D]/20 hover:opacity-95 transition-opacity"
                        >
                          <Upload className="w-4 h-4" />
                          <span>{win.proof_url ? 'Update Scorecard' : 'Claim & Upload Proof'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 2: ALWAYS SHOWN — ACTIVE DRAW POOL & YOUR ROLLING TICKET     */}
      {/* ==================================================================== */}
      <div className="rounded-3xl glass-panel-elevated border border-white/10 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00F29D]/20 to-[#00D2FF]/20 border border-[#00F29D]/30 flex items-center justify-center text-[#00F29D] shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-white">
                  Monthly Cycle: {activePeriod}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00F29D]/15 text-[#00F29D] border border-[#00F29D]/30">
                  Automated Engine
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                Current Monthly Prize Draw & Active Ticket
              </h3>
            </div>
          </div>

          {/* Active Ticket Status Badge */}
          <div className="flex items-center gap-2">
            {isFullTicket ? (
              <div className="px-3.5 py-1.5 rounded-xl bg-[#00F29D]/15 border border-[#00F29D]/40 text-[#00F29D] font-bold text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Ticket Active In Monthly Draw</span>
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold text-xs flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{scores.length}/5 Rounds Logged</span>
              </div>
            )}
          </div>
        </div>

        {/* Jackpot Pool & Your Active Ticket Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Your Rolling 5-Score Ticket */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Your Rolling 5-Score Draw Ticket</span>
                  <span className="text-[10px] font-mono text-[#00F29D] bg-[#00F29D]/10 px-2 py-0.5 rounded">
                    Auto-Locked
                  </span>
                </h4>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Derived from your latest 5 Stableford scores. Match against drawn numbers to win.
                </p>
              </div>
            </div>

            {/* The 5 Number Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {userRollingScores.map((scoreVal, idx) => (
                <div 
                  key={idx}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-b from-white/15 to-white/5 border border-white/20 flex flex-col items-center justify-center font-mono text-base font-black text-white shadow-lg hover:border-[#00F29D]/50 transition-colors"
                >
                  <span>{scoreVal}</span>
                  <span className="text-[8px] text-[#00F29D] font-sans font-bold uppercase tracking-wider">
                    R{idx + 1}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Every round you play continuously rotates into your 5-score ticket. On the last day of each month, the official algorithm runs and compares these numbers to the target draw numbers.
            </p>
          </div>

          {/* Right Column: Pool & Rollover Breakdown */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                Estimated Draw Prize Pool
              </span>
              <span className="text-[10px] font-bold text-[#FF6E40] bg-[#FF6E40]/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3" /> Rollover Boosted
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                ${currentPoolTotal.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-[#00F29D]">
                +${rolloverBalance.toLocaleString()} Roll
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
              <div className="flex justify-between text-[#94A3B8]">
                <span>Tier 5 Match (40% + Roll):</span>
                <span className="font-mono font-bold text-white">
                  ${((currentPoolTotal * 0.4) + rolloverBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Tier 4 Match (30%):</span>
                <span className="font-mono font-bold text-white">
                  ${(currentPoolTotal * 0.3).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Tier 3 Match (20%):</span>
                <span className="font-mono font-bold text-white">
                  ${(currentPoolTotal * 0.2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Charity Passthrough (10%):</span>
                <span className="font-mono font-bold text-[#FF6E40]">
                  ${(currentPoolTotal * 0.1).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step PRD Lifecycle Explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="w-7 h-7 rounded-xl bg-[#00F29D]/15 text-[#00F29D] flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h4 className="text-xs font-bold text-white">1. Automatic Entry</h4>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Your 5 latest verified Stableford scores automatically form your entry ticket each month.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="w-7 h-7 rounded-xl bg-[#00D2FF]/15 text-[#00D2FF] flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h4 className="text-xs font-bold text-white">2. Monthly Draw</h4>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              5 target numbers are generated. Match 3, 4, or 5 numbers to win guaranteed tier prize money.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="w-7 h-7 rounded-xl bg-amber-400/15 text-amber-300 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h4 className="text-xs font-bold text-white">3. Rollover & Payout</h4>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Unwon jackpots roll over into the next month. Winners upload scorecard proof for fast disbursement.
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 3: CLAIMED & DISBURSED PRIZES LEDGER (HISTORICAL RECEIPTS)   */}
      {/* ==================================================================== */}
      {paidWinnings.length > 0 && (
        <div className="rounded-3xl glass-panel-elevated border border-white/10 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00F29D]/15 border border-[#00F29D]/30 flex items-center justify-center text-[#00F29D]">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Disbursed Prizes & Claim Ledger</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#00F29D]/20 text-[#00F29D] font-mono font-bold">
                    {paidWinnings.length} Disbursed
                  </span>
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Official record of completed prize payouts, electronic disbursement, and audited scorecards.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPaidLedger(!showPaidLedger)}
              className="text-xs font-bold text-[#94A3B8] hover:text-white flex items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <span>{showPaidLedger ? 'Collapse' : 'Expand'}</span>
              {showPaidLedger ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showPaidLedger && (
            <div className="space-y-4">
              {paidWinnings.map((win) => {
                const draw = draws.find(d => d.id === win.draw_id);

                return (
                  <div
                    key={win.id}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#00F29D]/15 text-[#00F29D] flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            Draw #{win.draw_id?.substring(0, 7) || '2026-09'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#00F29D]/20 text-[#00F29D]">
                            Paid & Disbursed
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/10 text-white">
                            Tier {win.tier} Match
                          </span>
                        </div>
                        <p className="text-xs text-[#94A3B8]">
                          Disbursed via Direct Electronic Transfer • Verification Sanctioned by Platform Compliance
                        </p>
                        {draw && (
                          <p className="text-[11px] font-mono text-[#64748B]">
                            Draw Target Numbers: [{draw.target_numbers.join(', ')}]
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right font-mono">
                        <span className="text-lg font-black text-[#00F29D] block">
                          +${Number(win.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-[#64748B] block">USD Funds Cleared</span>
                      </div>

                      {win.proof_url && (
                        <button
                          onClick={() => setViewingProofUrl(win.proof_url || null)}
                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#00D2FF]" />
                          <span>View Scorecard</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="p-4 rounded-2xl bg-[#00F29D]/5 border border-[#00F29D]/20 text-[11px] text-[#94A3B8] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#00F29D] shrink-0" />
                <span>
                  All finalized prize payouts are permanently archived in your ledger. Your active subscription guarantees entry in all upcoming monthly jackpot draws.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: UPLOAD SCORECARD PROOF MODAL                                */}
      {/* ==================================================================== */}
      {selectedWinnerForProof && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0D1322] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00F29D]/20 text-[#00F29D] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Upload Scorecard Proof</h3>
                  <p className="text-xs text-[#94A3B8]">
                    Claim Payout of <strong className="text-[#00F29D] font-mono">${Number(selectedWinnerForProof.amount).toLocaleString()}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedWinnerForProof(null)} 
                className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProof} className="space-y-5">
              {/* File Upload Area */}
              <div>
                <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wider">
                  Select Scorecard Photo or Screenshot (PNG, JPG, WEBP)
                </label>
                <div className="relative border-2 border-dashed border-white/20 hover:border-[#00F29D]/50 rounded-2xl p-6 text-center transition-colors bg-white/5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Camera className="w-8 h-8 text-[#00F29D]" />
                    <p className="text-xs font-semibold text-white">
                      Click to browse or drag and drop scorecard image
                    </p>
                    <p className="text-[10px] text-[#94A3B8]">
                      Supports PNG, JPG, or WEBP up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Scorecard One-Click Option */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs text-[#94A3B8]">Don&apos;t have a photo right now?</span>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(SAMPLE_SCORECARD_URL);
                    setErrorMsg(null);
                  }}
                  className="text-xs text-[#00F29D] font-bold hover:underline"
                >
                  Use Sample Tournament Scorecard
                </button>
              </div>

              {/* Image Preview Box */}
              {previewImage && (
                <div className="p-3 rounded-2xl bg-black/60 border border-[#00F29D]/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5 text-[#00F29D]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready to Upload</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewImage(null)}
                      className="text-[#94A3B8] hover:text-rose-400 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="h-44 w-full rounded-xl overflow-hidden border border-white/15 bg-black">
                    <img 
                      src={previewImage} 
                      alt="Scorecard preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedWinnerForProof(null)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#94A3B8] hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !previewImage}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    previewImage && !isSubmitting
                      ? 'bg-gradient-to-r from-[#00F29D] to-[#00D2FF] text-[#06080F] shadow-lg shadow-[#00F29D]/20 hover:opacity-95'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Submit for Verification</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: HIGH-RESOLUTION SCORECARD PROOF VIEWER                      */}
      {/* ==================================================================== */}
      {viewingProofUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0D1322] border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-white">
                <ShieldCheck className="w-5 h-5 text-[#00F29D]" />
                <h3 className="font-bold text-sm">Verified Scorecard Audit Image</h3>
              </div>
              <button 
                onClick={() => setViewingProofUrl(null)}
                className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-96 w-full rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center">
              <img 
                src={viewingProofUrl} 
                alt="Audited Scorecard Proof" 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-2">
              <span>Verified and archived for payout compliance audit.</span>
              <button
                onClick={() => setViewingProofUrl(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
