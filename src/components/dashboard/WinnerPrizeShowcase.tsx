'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  ShieldCheck, 
  X, 
  Camera, 
  Sparkles, 
  RefreshCw,
  Award,
  Receipt,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Draw, Profile, Winner, Score } from '@/lib/types';

interface Props {
  user: Profile | null;
  winnings: Winner[];
  draws: Draw[];
  scores?: Score[] | number[];
  onRefresh?: () => void;
}

const SAMPLE_SCORECARD_URL = 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=1200&auto=format&fit=crop';

export default function WinnerPrizeShowcase({ user, winnings, draws, scores = [], onRefresh }: Props) {
  const [selectedWinnerForProof, setSelectedWinnerForProof] = useState<Winner | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);
  const [showPaidLedger, setShowPaidLedger] = useState(true);

  // Normalize scores to number[]
  const rawScores: number[] = scores.map(s => typeof s === 'number' ? s : s.score);

  // Active draw calculations
  const activePeriod = '2026-09';
  const activeDraw = draws.find(d => d.period === activePeriod && d.status === 'published') || draws[0];
  const userRollingScores = rawScores.length >= 5 ? rawScores.slice(-5) : rawScores;
  const isFullTicket = userRollingScores.length === 5;

  const currentPoolTotal = activeDraw?.pool_total || 32500;
  const rolloverBalance = activeDraw?.jackpot_rollover_in || 12400;

  // Filter pending vs paid prizes
  const pendingWinnings = winnings.filter(w => w.payout_status !== 'paid');
  const paidWinnings = winnings.filter(w => w.payout_status === 'paid');

  const handleOpenUploadModal = (win: Winner) => {
    setSelectedWinnerForProof(win);
    setPreviewImage(win.proof_url || null);
    setErrorMsg(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit. Please upload a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWinnerForProof) return;

    if (!previewImage) {
      setErrorMsg('Please select or drag an image of your physical scorecard.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/draws/verify-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winningId: selectedWinnerForProof.id,
          proofUrl: previewImage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit proof scorecard.');
      }

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      setSelectedWinnerForProof(null);
      setPreviewImage(null);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading scorecard. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ==================================================================== */}
      {/* SECTION 1: PROMINENT WINNER ANNOUNCEMENT & VERIFICATION WORKFLOW     */}
      {/* ==================================================================== */}
      {pendingWinnings.length > 0 && (
        <div className="space-y-6">
          {pendingWinnings.map((win) => {
            const isApproved = win.proof_status === 'approved';
            const isSubmitted = win.proof_status === 'submitted';
            const isRejected = win.proof_status === 'rejected';
            const draw = draws.find(d => d.id === win.draw_id);

            return (
              <div 
                key={win.id}
                className="relative overflow-hidden rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-mint-50/20 p-6 sm:p-8 shadow-xl shadow-emerald-500/5 text-[#111827]"
              >
                <div className="relative z-10 space-y-6">
                  {/* Top Badge & Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#11382B] flex items-center justify-center text-white shadow-md shadow-[#11382B]/20 shrink-0">
                        <Trophy className="w-6 h-6 text-[#00D284]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#11382B]">
                            Draw Winner #{win.draw_id?.substring(0, 7) || '2026-09'}
                          </span>
                          <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                            Tier {win.tier} Match
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-[#111827] mt-1">
                          Congratulations! You Won ${Number(win.amount).toLocaleString()} USD
                        </h2>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Prize Claim Status</p>
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase mt-1 ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isSubmitted
                          ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {isApproved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5" />}
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
                    <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Winning Target Numbers ({draw.period}):</span>
                        </p>
                        <p className="text-[11px] text-gray-500">Your rolling 5-score ticket matched {win.tier} numbers in this cycle.</p>
                      </div>
                      <div className="flex gap-2">
                        {draw.target_numbers.map((num, i) => (
                          <div 
                            key={i} 
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs transition-all ${
                              i < win.tier 
                                ? 'bg-[#11382B] text-white shadow-sm ring-2 ring-[#00D284]'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
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
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                      Winner Verification & Payout Lifecycle
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {/* Step 1 */}
                      <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#11382B] flex items-center justify-center font-bold text-xs shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#111827]">1. Win Confirmed</p>
                          <p className="text-[10px] text-emerald-700 font-medium">Numbers matched</p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className={`p-3.5 rounded-2xl border shadow-xs flex items-center gap-3 ${
                        isApproved || isSubmitted
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-white border-gray-200/80'
                      }`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isApproved || isSubmitted ? 'bg-[#11382B] text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isApproved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : '2'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#111827]">2. Proof Scorecard</p>
                          <p className={`text-[10px] font-semibold ${
                            isApproved ? 'text-emerald-700' : isSubmitted ? 'text-cyan-700' : 'text-amber-700'
                          }`}>
                            {isApproved ? 'Verified' : isSubmitted ? 'Under Review' : 'Upload Needed'}
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className={`p-3.5 rounded-2xl border shadow-xs flex items-center gap-3 ${
                        isApproved
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-white border-gray-200/80'
                      }`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isApproved ? 'bg-[#11382B] text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isApproved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : '3'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#111827]">3. Admin Sanction</p>
                          <p className="text-[10px] text-gray-500">
                            {isApproved ? 'Approved by Admin' : 'Awaiting Review'}
                          </p>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="p-3.5 rounded-2xl border bg-white border-gray-200/80 shadow-xs flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 bg-gray-100 text-gray-600">
                          4
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#111827]">4. Direct Transfer</p>
                          <p className="text-[10px] text-gray-500">
                            {isApproved ? 'Disbursement Queued' : 'Pending Verification'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Proof Card & Action Button */}
                  <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {win.proof_url ? (
                        <div 
                          onClick={() => setViewingProofUrl(win.proof_url || null)}
                          className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-50 cursor-pointer shadow-xs"
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
                        <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                          <Camera className="w-6 h-6" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#111827]">Scorecard Verification Photo</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isSubmitted
                              ? 'bg-cyan-100 text-cyan-800'
                              : isRejected
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {win.proof_status || 'unsubmitted'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
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
                        <div className="px-4 py-3 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Approved for Payout</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenUploadModal(win)}
                          className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#11382B] hover:bg-[#0c281e] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
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
      <div className="rounded-3xl bg-white border border-gray-200/90 p-6 sm:p-8 space-y-6 shadow-sm text-[#111827]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#11382B]/10 text-[#11382B] flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-700">
                  Monthly Cycle: {activePeriod}
                </span>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-[#11382B] border border-emerald-100">
                  Automated Engine
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#111827] mt-1">
                Current Monthly Prize Draw & Active Ticket
              </h3>
            </div>
          </div>

          {/* Active Ticket Status Badge */}
          <div className="flex items-center gap-2">
            {isFullTicket ? (
              <div className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-[#11382B] font-bold text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Ticket Active In Monthly Draw</span>
              </div>
            ) : (
              <div className="px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{userRollingScores.length}/5 Rounds Logged</span>
              </div>
            )}
          </div>
        </div>

        {/* Jackpot Pool & Your Active Ticket Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Your Rolling 5-Score Ticket */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  <span>Your Rolling 5-Score Draw Ticket</span>
                  <span className="text-[10px] font-mono font-bold text-[#11382B] bg-emerald-100 px-2 py-0.5 rounded-full">
                    Auto-Locked
                  </span>
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Derived from your latest 5 Stableford scores. Match against drawn numbers to win.
                </p>
              </div>
            </div>

            {/* The 5 Number Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {userRollingScores.map((scoreVal, idx) => (
                <div 
                  key={idx}
                  className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col items-center justify-center font-mono text-base font-black text-[#111827] hover:border-[#11382B] transition-colors"
                >
                  <span>{scoreVal}</span>
                  <span className="text-[8px] text-[#11382B] font-sans font-bold uppercase tracking-wider">
                    R{idx + 1}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              Every round you play continuously rotates into your 5-score ticket. On the last day of each month, the official algorithm runs and compares these numbers to the target draw numbers.
            </p>
          </div>

          {/* Right Column: Pool & Rollover Breakdown */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Estimated Draw Prize Pool
              </span>
              <span className="text-[10px] font-bold text-[#E25B37] bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3" /> Rollover Boosted
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black font-mono text-[#111827] tracking-tight">
                ${currentPoolTotal.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                +${rolloverBalance.toLocaleString()} Roll
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-200 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Tier 5 Match (40% + Roll):</span>
                <span className="font-mono font-bold text-[#111827]">
                  ${((currentPoolTotal * 0.4) + rolloverBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tier 4 Match (30%):</span>
                <span className="font-mono font-bold text-[#111827]">
                  ${(currentPoolTotal * 0.3).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tier 3 Match (20%):</span>
                <span className="font-mono font-bold text-[#111827]">
                  ${(currentPoolTotal * 0.2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Charity Passthrough (10%):</span>
                <span className="font-mono font-bold text-[#E25B37]">
                  ${(currentPoolTotal * 0.1).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step Lifecycle Explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-[#11382B] flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h4 className="text-xs font-bold text-[#111827]">1. Automatic Entry</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Your 5 latest verified Stableford scores automatically form your entry ticket each month.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
            <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h4 className="text-xs font-bold text-[#111827]">2. Monthly Draw</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              5 target numbers are generated. Match 3, 4, or 5 numbers to win guaranteed tier prize money.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h4 className="text-xs font-bold text-[#111827]">3. Rollover & Payout</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Unwon jackpots roll over into the next month. Winners upload scorecard proof for fast disbursement.
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 3: CLAIMED & DISBURSED PRIZES LEDGER (HISTORICAL RECEIPTS)   */}
      {/* ==================================================================== */}
      {paidWinnings.length > 0 && (
        <div className="rounded-3xl bg-white border border-gray-200/90 p-6 sm:p-8 space-y-6 shadow-sm text-[#111827]">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#11382B] flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <span>Disbursed Prizes & Claim Ledger</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold">
                    {paidWinnings.length} Disbursed
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  Official record of completed prize payouts, electronic disbursement, and audited scorecards.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPaidLedger(!showPaidLedger)}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1 p-2 rounded-xl hover:bg-gray-50 transition-colors"
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
                    className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#111827] text-sm">
                            Draw #{win.draw_id?.substring(0, 7) || '2026-09'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            Paid & Disbursed
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-200 text-gray-700">
                            Tier {win.tier} Match
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Disbursed via Direct Electronic Transfer • Verification Sanctioned by Platform Compliance
                        </p>
                        {draw && (
                          <p className="text-[11px] font-mono text-gray-400">
                            Draw Target Numbers: [{draw.target_numbers.join(', ')}]
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right font-mono">
                        <span className="text-lg font-black text-emerald-700 block">
                          +${Number(win.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-gray-400 block">USD Funds Cleared</span>
                      </div>

                      {win.proof_url && (
                        <button
                          onClick={() => setViewingProofUrl(win.proof_url || null)}
                          className="px-3.5 py-2 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#11382B]" />
                          <span>View Scorecard</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-[11px] text-gray-600 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0" />
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 text-[#111827]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#11382B]/10 text-[#11382B] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111827]">Upload Scorecard Proof</h3>
                  <p className="text-xs text-gray-500">
                    Claim Payout of <strong className="text-emerald-700 font-mono">${Number(selectedWinnerForProof.amount).toLocaleString()}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedWinnerForProof(null)} 
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProof} className="space-y-5">
              {/* File Upload Area */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Select Scorecard Photo or Screenshot (PNG, JPG, WEBP)
                </label>
                <div className="relative border-2 border-dashed border-gray-300 hover:border-[#11382B] rounded-2xl p-6 text-center transition-colors bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Camera className="w-8 h-8 text-[#11382B]" />
                    <p className="text-xs font-bold text-[#111827]">
                      Click to browse or drag and drop scorecard image
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Supports PNG, JPG, or WEBP up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Scorecard One-Click Option */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-xs text-gray-600">Don&apos;t have a photo right now?</span>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(SAMPLE_SCORECARD_URL);
                    setErrorMsg(null);
                  }}
                  className="text-xs text-[#11382B] font-bold hover:underline"
                >
                  Use Sample Tournament Card
                </button>
              </div>

              {/* Image Preview Box */}
              {previewImage && (
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-emerald-300 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ready to Upload</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewImage(null)}
                      className="text-gray-500 hover:text-rose-600 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="h-44 w-full rounded-xl overflow-hidden border border-gray-200 bg-white">
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
                  className="flex-1 py-3.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !previewImage}
                  className={`flex-1 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    previewImage && !isSubmitting
                      ? 'bg-[#11382B] hover:bg-[#0c281e] text-white shadow-md active:scale-[0.99]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-[#111827]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-[#111827]">Verified Scorecard Audit Image</h3>
              </div>
              <button 
                onClick={() => setViewingProofUrl(null)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-96 w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 flex items-center justify-center">
              <img 
                src={viewingProofUrl} 
                alt="Audited Scorecard Proof" 
                className="w-full h-full object-contain" 
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
              <span>Verified and archived for payout compliance audit.</span>
              <button
                onClick={() => setViewingProofUrl(null)}
                className="px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
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
