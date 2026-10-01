import { useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import confetti from "canvas-confetti";
import { WeddingData } from "../types";

interface ClosingMessageProps {
  data: WeddingData;
}

export function ClosingMessage({ data }: ClosingMessageProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isInView]);

  return (
    <section ref={ref} className="py-24 px-6 bg-[#F9E8EC] relative overflow-hidden flex flex-col items-center justify-center text-center">
      
      {/* Top Decorative Wavy Line */}
      <div className="w-full max-w-sm mx-auto mb-10 flex justify-center opacity-80">
        <svg width="200" height="30" viewBox="0 0 200 30" preserveAspectRatio="none">
          <path d="M 0 15 Q 50 15 100 25 T 200 15" fill="none" stroke="#D995A5" strokeWidth="0.8" />
          <circle cx="100" cy="18" r="1.5" fill="#D995A5" />
          <circle cx="92" cy="22" r="1" fill="#D995A5" />
          <circle cx="108" cy="22" r="1" fill="#D995A5" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="max-w-md mx-auto flex flex-col items-center relative z-10"
      >
        <p className="font-serif text-lg md:text-xl text-[#9E263D] leading-relaxed drop-shadow-sm mb-8 whitespace-pre-line px-4">
          {data.closingMessage}
        </p>
        
        <h3 className="font-script text-4xl md:text-5xl text-[#9E263D] mt-4 tracking-wide">
          {data.groom.name} &amp; {data.bride.name}
        </h3>
      </motion.div>

      {/* Bottom Decorative Wavy Line */}
      <div className="w-full max-w-sm mx-auto mt-12 flex justify-center opacity-80">
        <svg width="200" height="30" viewBox="0 0 200 30" preserveAspectRatio="none">
          <path d="M 0 15 Q 50 15 100 5 T 200 15" fill="none" stroke="#D995A5" strokeWidth="0.8" />
          <circle cx="100" cy="12" r="1.5" fill="#D995A5" />
          <circle cx="92" cy="8" r="1" fill="#D995A5" />
          <circle cx="108" cy="8" r="1" fill="#D995A5" />
        </svg>
      </div>
    </section>
  );
}
