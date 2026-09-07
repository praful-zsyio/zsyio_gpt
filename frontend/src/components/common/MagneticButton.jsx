import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function MagneticButton({ children, className = '', onClick, strength = 0.35, ...props }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);

      gsap.to(el, {
        x: relX * strength,
        y: relY * strength,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1.2, 0.4)',
      });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center transition-shadow ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
