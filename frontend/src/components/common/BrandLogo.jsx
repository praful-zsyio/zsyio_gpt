import React from 'react';
import heroLogo from '../../assets/hero.png';

export default function BrandLogo({ size = 'md', className = '', withText = false }) {
  const sizeMap = {
    xs: { box: 'w-5 h-5 rounded-md', dot: 'w-1.5 h-1.5', text: 'text-[11px]' },
    sm: { box: 'w-6 h-6 rounded-lg', dot: 'w-2 h-2', text: 'text-xs' },
    md: { box: 'w-8 h-8 rounded-xl', dot: 'w-2.5 h-2.5', text: 'text-sm' },
    lg: { box: 'w-10 h-10 rounded-2xl', dot: 'w-3 h-3', text: 'text-base' },
    xl: { box: 'w-14 h-14 rounded-2xl', dot: 'w-3.5 h-3.5', text: 'text-xl' },
  };

  const s = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`relative ${s.box} overflow-hidden rounded-xl bg-gradient-to-tr from-sky-400/20 via-blue-500/20 to-white/20 border border-sky-400/40 shadow-lg shadow-sky-500/25 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform p-0.5`}
      >
        <img
          src={heroLogo}
          alt="ZsyioGPT Company Logo"
          className="w-full h-full object-contain rounded-lg"
          onError={(e) => {
            if (e.currentTarget.src !== window.location.origin + '/hero.png') {
              e.currentTarget.src = '/hero.png';
            }
          }}
        />
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${s.dot} bg-emerald-400 border-2 border-slate-900 rounded-full shadow-sm`}
        />
      </div>
      {withText && (
        <span className={`font-extrabold tracking-tight text-adaptive ${s.text}`}>
          Zsyio<span className="text-cyber-gradient font-black">GPT</span>
        </span>
      )}
    </div>
  );
}
