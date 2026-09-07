import React from 'react';
import { Sparkles } from 'lucide-react';

export default function BrandLogo({ size = 'md', className = '', withText = false }) {
  const sizeMap = {
    sm: { box: 'w-6 h-6 rounded-lg', icon: 'w-3 h-3', dot: 'w-2 h-2', text: 'text-xs' },
    md: { box: 'w-8 h-8 rounded-xl', icon: 'w-4 h-4', dot: 'w-2.5 h-2.5', text: 'text-sm' },
    lg: { box: 'w-10 h-10 rounded-2xl', icon: 'w-5 h-5', dot: 'w-3 h-3', text: 'text-base' },
    xl: { box: 'w-14 h-14 rounded-2xl', icon: 'w-7 h-7', dot: 'w-3.5 h-3.5', text: 'text-xl' },
  };

  const s = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`relative ${s.box} bg-gradient-to-tr from-sky-400 via-blue-500 to-white flex items-center justify-center shadow-lg shadow-sky-500/25 flex-shrink-0`}>
        <Sparkles className={`${s.icon} text-slate-900 animate-pulse`} />
        <span className={`absolute -bottom-0.5 -right-0.5 ${s.dot} bg-emerald-400 border-2 border-slate-900 rounded-full`} />
      </div>
      {withText && (
        <span className={`font-extrabold tracking-tight text-adaptive ${s.text}`}>
          Zsyio<span className="text-cyber-gradient font-black">GPT</span>
        </span>
      )}
    </div>
  );
}
