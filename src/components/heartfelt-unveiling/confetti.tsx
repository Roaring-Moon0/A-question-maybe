'use client';

import React from 'react';

export function Confetti() {
  const confettiCount = 100;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {Array.from({ length: confettiCount }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={
            {
              '--x': `${Math.random() * 100}vw`,
              '--y': `${Math.random() * -100 - 100}px`,
              '--r': `${Math.random() * 360}deg`,
              '--d': `${Math.random() * 1.5 + 0.5}s`,
              '--s': `${Math.random() * 0.5 + 0.5}`,
              '--bg': `hsl(${Math.random() * 60 + 320}, 100%, 80%)`
            } as React.CSSProperties
          }
        />
      ))}
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translate(var(--x), 100vh) rotate(var(--r));
            opacity: 0;
          }
        }
        .confetti-piece {
          position: absolute;
          top: 0;
          left: 0;
          width: 10px;
          height: 10px;
          background-color: var(--bg);
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
          opacity: 1;
          animation: fall linear forwards;
          animation-duration: var(--d);
          transform: scale(var(--s));
        }
      `}</style>
    </div>
  );
}
