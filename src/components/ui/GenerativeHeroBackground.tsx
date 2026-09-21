'use client';

import React, { useEffect, useRef } from 'react';

export default function GenerativeHeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Draw static soft gradient frame once
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const grad = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.3, 10,
        canvas.width * 0.5, canvas.height * 0.3, canvas.width * 0.6
      );
      grad.addColorStop(0, 'rgba(0, 210, 132, 0.08)');
      grad.addColorStop(0.5, 'rgba(17, 56, 43, 0.04)');
      grad.addColorStop(1, 'rgba(250, 250, 248, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let animationFrameId: number;
    let isVisible = true;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 2. Performance: Pause when not visible in viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // 3. Orbs / Particle Data
    // Mobile throttles particle count
    const isMobile = width < 768;
    const orbCount = isMobile ? 5 : 9;

    const orbs = Array.from({ length: orbCount }, (_, i) => {
      const colors = [
        'rgba(0, 210, 132, ',   // Mint
        'rgba(17, 56, 43, ',    // Deep Emerald
        'rgba(226, 91, 55, ',   // Coral
        'rgba(245, 158, 11, ',  // Gold
      ];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: (isMobile ? 120 : 220) + Math.random() * (isMobile ? 80 : 180),
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        baseAlpha: 0.04 + Math.random() * 0.07,
        colorPrefix: colors[i % colors.length],
      };
    });

    // 4. Animation Loop
    let t = 0;
    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Render floating soft mesh orbs
      for (const orb of orbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -orb.radius) orb.x = width + orb.radius;
        if (orb.x > width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = height + orb.radius;
        if (orb.y > height + orb.radius) orb.y = -orb.radius;

        // Subtle breathing radius
        const breathingRadius = orb.radius + Math.sin(t * 0.01 + orb.x) * 15;

        const gradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, Math.max(10, breathingRadius)
        );
        gradient.addColorStop(0, `${orb.colorPrefix}${orb.baseAlpha})`);
        gradient.addColorStop(0.6, `${orb.colorPrefix}${orb.baseAlpha * 0.4})`);
        gradient.addColorStop(1, `${orb.colorPrefix}0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, Math.max(10, breathingRadius), 0, Math.PI * 2);
        ctx.fill();
      }

      t += 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-90 block"
      />
      {/* Light Blur & Diffuse Layer */}
      <div className="absolute inset-0 bg-[#FAFAF8]/50 backdrop-blur-[40px] pointer-events-none" />
    </div>
  );
}
