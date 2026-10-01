import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { HeartDivider } from "./HeartDivider";
import { generateIcsFile } from "../utils";
import { WeddingData } from "../types";
import { Calendar, Heart } from "lucide-react";
import confetti from "canvas-confetti";

interface ScratchCardProps {
  data: WeddingData;
  onReveal?: () => void;
}

const heartMaskStyle = {
  WebkitMaskImage: `url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDIxLjM1bC0xLjQ1LTEuMzJDNS40IDE1LjM2IDIgMTIuMjggMiA4LjUgMiA1LjQyIDQuNDIgMyA3LjUgM2MxLjc0IDAgMy40MS44MSA0LjUgMi4wOUMxMy4wOSAzLjgxIDE0Ljc2IDMgMTYuNSAzIDE5LjU4IDMgMjIgNS40MiAyMiA4LjVjMCAzLjc4LTMuNCA2Ljg2LTguNTUgMTEuNTRMMTIgMjEuMzV6IiBmaWxsPSJibGFjayIvPjwvc3ZnPg==")`,
  WebkitMaskSize: "contain",
  WebkitMaskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskImage: `url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDIxLjM1bC0xLjQ1LTEuMzJDNS40IDE1LjM2IDIgMTIuMjggMiA4LjUgMiA1LjQyIDQuNDIgMyA3LjUgM2MxLjc0IDAgMy40MS44MSA0LjUgMi4wOUMxMy4wOSAzLjgxIDE0Ljc2IDMgMTYuNSAzIDE5LjU4IDMgMjIgNS40MiAyMiA4LjVjMCAzLjc4LTMuNCA2Ljg2LTguNTUgMTEuNTRMMTIgMjEuMzV6IiBmaWxsPSJibGFjayIvPjwvc3ZnPg==")`,
  maskSize: "contain",
  maskPosition: "center",
  maskRepeat: "no-repeat"
};

export function ScratchCardSection({ data, onReveal }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    setContext(ctx);

    // Setup canvas size (made slightly larger as requested)
    const width = 320;
    const height = 320;
    canvas.width = width;
    canvas.height = height;

    drawScratchLayer(ctx, width, height);
  }, []);

  const drawScratchLayer = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    // Fill entire canvas with rich pink/burgundy gradient - the CSS mask will clip it into a perfect heart
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#E5A9B8"); // Rich dusty blush
    gradient.addColorStop(0.4, "#C9788D"); // Muted dusty rose
    gradient.addColorStop(1, "#8F1736"); // Deep burgundy/rose
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add fine sparkling glitter effect across the entire heart uniformly
    for (let i = 0; i < 15000; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255, 255, 255, 0.95)" : "rgba(244, 221, 226, 0.85)";
      ctx.fillRect(rx, ry, Math.random() * 1.5 + 0.5, Math.random() * 1.5 + 0.5);
    }
    
    // Add slightly larger distinct sparkles
    for (let i = 0; i < 300; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.beginPath();
      ctx.arc(rx, ry, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isRevealed) return;
    setIsDrawing(true);
    scratch(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    checkReveal();
  };

  const scratch = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !context || !canvasRef.current || isRevealed) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(x, y, 28, 0, Math.PI * 2); // slightly larger brush for the larger heart
    context.fill();
  };

  const checkReveal = () => {
    if (!context || !canvasRef.current || isRevealed) return;
    const canvas = canvasRef.current;
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentCount = 0;
    
    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] === 0) {
        transparentCount++;
      }
    }
    
    const totalPixelsChecked = pixels.length / 16;
    // The mask covers ~50% of the canvas area.
    // If ~25% of the total canvas is scratched, that's half the heart.
    const scratchedPercentage = transparentCount / totalPixelsChecked;

    if (scratchedPercentage > 0.25) {
      // Clear entire canvas to fully reveal
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fire celebration confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#A92543', '#D9A6B2', '#F4DDE2', '#ffffff'],
        disableForReducedMotion: true,
        zIndex: 9999
      });
      
      if (onReveal) {
        onReveal();
      }
      setIsRevealed(true);
    }
  };

  return (
    <section className="py-16 px-4 bg-blush-main flex flex-col items-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md flex flex-col items-center"
      >
        <h2 className="font-script text-4xl text-burgundy text-center">
          Scratch to Reveal
        </h2>
        
        <div className="flex items-center justify-center w-full gap-4 mt-6">
          <div className="h-[1px] w-16 bg-pink-border opacity-60"></div>
          <Heart className="w-4 h-4 text-burgundy fill-burgundy opacity-80" />
          <div className="h-[1px] w-16 bg-pink-border opacity-60"></div>
        </div>

        {/* The Mask Container ensures both the scratch layer and the content underneath are perfect hearts */}
        <div 
          className="relative mt-8 mb-12 w-[320px] h-[320px]" 
          ref={containerRef}
          style={heartMaskStyle}
        >
          {/* Revealed Content (underneath) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-blush-light">
            <div className="flex flex-col items-center justify-center mt-4">
              <p className="font-script text-[1.75rem] text-burgundy mb-3">You're Invited!</p>
              <p className="font-serif font-bold text-xl text-burgundy tracking-wide">
                {data.weddingDateFormatted}
              </p>
              <p className="font-serif text-[0.95rem] text-wine-dark mt-2 opacity-95">
                {data.weddingDayFormatted}
              </p>
              <p className="font-serif text-xs text-wine-dark mt-3 opacity-80">
                {data.weddingTimeFormatted}
              </p>
            </div>
          </div>

          {/* Scratch Layer */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full z-10 cursor-crosshair transition-opacity duration-1000 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            onMouseDown={startDrawing}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onMouseMove={scratch}
            onTouchStart={startDrawing}
            onTouchEnd={endDrawing}
            onTouchMove={scratch}
            style={{ touchAction: 'none' }} // Prevent scrolling while scratching on mobile
          />
        </div>

        <motion.div 
          animate={{ opacity: isRevealed ? 1 : 0.5 }}
          className="flex flex-col items-center"
        >
          <button
            onClick={() => isRevealed && generateIcsFile(data)}
            disabled={!isRevealed}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-serif uppercase tracking-widest text-xs transition-all
              ${isRevealed 
                ? 'bg-burgundy text-white shadow-md hover:bg-wine-dark active:scale-95' 
                : 'bg-blush-light text-wine-dark/50 cursor-not-allowed'}`}
          >
            <Calendar className="w-4 h-4" />
            Save The Date
          </button>
          <p className="text-[10px] uppercase tracking-widest text-wine-dark opacity-60 mt-4">
            Add this event to your calendar
          </p>
        </motion.div>

      </motion.div>
    </section>
  );
}
