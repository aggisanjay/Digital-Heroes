import React from 'react';
import Link from 'next/link';
import { Shield, Heart, Trophy, Award, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#FAFAF8] border-t border-gray-200/70 pt-20 pb-14 text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#11382B]/5 border border-[#11382B]/15 flex items-center justify-center p-1">
                <img
                  src="/logo-icon.png"
                  alt="Digital Heroes Mascot"
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-gray-900">
                DIGITAL<span className="text-[#11382B]">HEROES</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
              A transparent, audited consumer platform bridging golf performance tracking, algorithmic monthly jackpot draws, and certified charity disbursements.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200/60">
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              <span>PCI-Compliant via Stripe • Supabase RLS Protected</span>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div>
            <h4 className="text-gray-900 text-xs font-bold uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/how-it-works" className="hover:text-gray-900 transition-colors flex items-center gap-1 group">
                  <span>How the Draw Works</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/charities" className="hover:text-gray-900 transition-colors flex items-center gap-1 group">
                  <span>Verified Charities</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-gray-900 transition-colors flex items-center gap-1 group">
                  <span>Rolling 5-Score Rules</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/subscribe" className="hover:text-gray-900 transition-colors flex items-center gap-1 group">
                  <span>Membership & Pricing</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Causes */}
          <div>
            <h4 className="text-gray-900 text-xs font-bold uppercase tracking-wider mb-4">Certified Causes</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/charities/fairway-foundation" className="hover:text-gray-900 transition-colors">Youth Leadership in Golf</Link></li>
              <li><Link href="/charities/veterans-on-the-green" className="hover:text-gray-900 transition-colors">Veterans On The Green</Link></li>
              <li><Link href="/charities/green-links-trust" className="hover:text-gray-900 transition-colors">Eco-Course Sanctuary</Link></li>
              <li><Link href="/charities" className="hover:text-gray-900 transition-colors">Partner Giving Directory</Link></li>
            </ul>
          </div>

          {/* Col 4: Trust & Transparency */}
          <div>
            <h4 className="text-gray-900 text-xs font-bold uppercase tracking-wider mb-4">Integrity & Governance</h4>
            <div className="space-y-3 text-xs text-gray-500">
              <p>Every monthly subscription automatically directs a minimum of 10% to your selected partner organization.</p>
              <p>Draw calculations scale algorithmically with subscriber counts and feature verified 40% rollover jackpots.</p>
              <div className="pt-2 flex items-center gap-3 text-gray-400">
                <Trophy className="w-4 h-4 hover:text-emerald-700 transition-colors" />
                <Heart className="w-4 h-4 hover:text-rose-600 transition-colors" />
                <Award className="w-4 h-4 hover:text-amber-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Digital Heroes. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Play</Link>
            <Link href="/rules" className="hover:text-gray-900 transition-colors">Official Draw Rules</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
