import React from 'react';

// Generates an array of numbers
const generateArray = (length: number) => Array.from({ length });

// Petal Component
const Petal: React.FC<{ index: number }> = ({ index }) => {
  // Very slow fall speed: 25s - 45s
  const durationFall = Math.random() * 20 + 25; 
  const durationSway = Math.random() * 4 + 4; // 4s - 8s
  const delay = Math.random() * 20;
  const startLeft = Math.random() * 100; // 0% - 100%
  const size = Math.random() * 6 + 10; // 10px - 16px (slightly smaller for elegance)

  return (
    <div 
      className="fixed z-[9000] pointer-events-none select-none drop-shadow-sm opacity-80"
      style={{
        left: `${startLeft}%`,
        animation: `petal-fall ${durationFall}s linear infinite`,
        animationDelay: `${delay}s`,
        top: '-10%',
      }}
    >
      <div
        style={{
          animation: `petal-sway ${durationSway}s ease-in-out infinite alternate`,
          fontSize: `${size}px`,
        }}
      >
        🌸
      </div>
    </div>
  );
};

export function EnvironmentEffects() {
  return (
    <div className="fixed inset-0 z-[9000] pointer-events-none overflow-hidden" aria-hidden="true">
      {/* 15 slow drifting petals */}
      {generateArray(15).map((_, i) => <Petal key={`petal-${i}`} index={i} />)}
    </div>
  );
}
