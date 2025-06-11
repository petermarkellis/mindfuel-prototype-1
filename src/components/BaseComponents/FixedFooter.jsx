import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function FixedFooter() {
  const footerRef = useRef(null);

  useEffect(() => {
    if (footerRef.current) {
      gsap.fromTo(
        footerRef.current,
        { y: '100%' },
        { y: '0%', duration: 0.6, delay: 0.5, ease: 'power3.out' }
      );
    }
  }, []);

  return (
    <div
      ref={footerRef}
      className="fixed bottom-0 h-10 bg-white/80 border-t border-slate-300 flex items-center justify-between px-8 z-30 font-jetbrains text-slate-600 text-sm transition-all"
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        left: 384,
        width: 'calc(100vw - 384px)',
      }}
    >
      <span>Prototype and Data shown and for demo purposes</span>
      <span>version 1.6</span>
    </div>
  );
} 