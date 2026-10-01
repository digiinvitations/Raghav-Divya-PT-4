import React from 'react';

const generateArray = (length: number) => Array.from({ length });

export function FloatingLanterns() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {generateArray(8).map((_, i) => {
        const left = Math.random() * 100;
        const durationRise = Math.random() * 20 + 25; // 25s - 45s
        const durationSway = Math.random() * 4 + 4; // 4s - 8s
        const delay = Math.random() * 20;
        const size = Math.random() * 10 + 20; // 20px - 30px

        return (
          <div
            key={`lantern-${i}`}
            className="absolute drop-shadow-md opacity-70"
            style={{
              left: `${left}%`,
              top: '110%',
              animation: `lantern-rise ${durationRise}s linear infinite`,
              animationDelay: `${delay}s`,
            }}
          >
            <div
              style={{
                animation: `lantern-sway ${durationSway}s ease-in-out infinite alternate`,
                fontSize: `${size}px`,
              }}
            >
              🏮
            </div>
          </div>
        );
      })}
    </div>
  );
}
