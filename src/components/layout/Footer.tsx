import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Heart, Trophy, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#04060A] border-t border-white/10 pt-16 pb-12 text-[#94A3B8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00F29D] to-[#00D2FF] p-[1.5px]">
                <div className="w-full h-full bg-[#06080F] rounded-[7px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#00F29D]" />
                </div>
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                DIGITAL<span className="text-[#00F29D]">HEROES</span>
              </span>
            </div>
            <p className="text-sm text-[#64748B] leading-relaxed">
              A high-impact consumer platform bridging golf performance tracking, algorithmic monthly jackpot draws, and transparent charity funding.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#00F29D] font-medium">
              <Shield className="w-4 h-4" />
              <span>PCI-Compliant via Stripe • Supabase RLS Protected</span>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/how-it-works" className="hover:text-[#00F29D] transition-colors">How the Draw Works</Link></li>
              <li><Link href="/charities" className="hover:text-[#00F29D] transition-colors">Verified Charities</Link></li>
              <li><Link href="/dashboard/scores" className="hover:text-[#00F29D] transition-colors">Rolling 5-Score Tracker</Link></li>
              <li><Link href="/subscribe" className="hover:text-[#00F29D] transition-colors">Membership & Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Charity & Impact</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/charities/fairway-foundation" className="hover:text-[#00F29D] transition-colors">Youth Leadership In Golf</Link></li>
              <li><Link href="/charities/veterans-on-the-green" className="hover:text-[#00F29D] transition-colors">Veterans On The Green</Link></li>
              <li><Link href="/charities/green-links-trust" className="hover:text-[#00F29D] transition-colors">Eco-Course Sanctuary</Link></li>
              <li><Link href="/charities" className="hover:text-[#00F29D] transition-colors">One-Off Giving Directory</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Integrity & Governance</h4>
            <div className="space-y-3 text-xs text-[#64748B]">
              <p>Every subscription automatically directs a minimum of 10% to your selected partner charity.</p>
              <p>Draw pools scale algorithmically based on active subscriber counts and feature verified rollover jackpot pools.</p>
              <div className="pt-2 flex items-center gap-3 text-white/40">
                <Trophy className="w-5 h-5 hover:text-[#00F29D] transition-colors cursor-pointer" />
                <Heart className="w-5 h-5 hover:text-[#FF6E40] transition-colors cursor-pointer" />
                <Award className="w-5 h-5 hover:text-[#00D2FF] transition-colors cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <p>© {new Date().getFullYear()} Digital Heroes. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#94A3B8] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#94A3B8] transition-colors">Terms of Play</Link>
            <Link href="/rules" className="hover:text-[#94A3B8] transition-colors">Official Draw Rules</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
