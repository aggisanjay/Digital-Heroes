import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CharitySpotlight from '@/components/home/CharitySpotlight';
import DrawMechanicsSection from '@/components/home/DrawMechanicsSection';
import PricingSection from '@/components/home/PricingSection';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#06080F] text-[#F8FAFC]">
      <Navbar />
      <HeroSection />
      <CharitySpotlight />
      <DrawMechanicsSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
