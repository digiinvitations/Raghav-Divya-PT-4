import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EventDetails } from "../types";
import { Clock, CalendarHeart, Sparkles, MapPin } from "lucide-react";
import confetti from "canvas-confetti";
import { formatIndianDate } from "../utils/dateFormat";

interface TimelineProps {
  events: EventDetails[];
}

// Map styles to requested accent colors
const accentColors = {
  haldi: { 
    light: "bg-amber-50", 
    border: "border-amber-200", 
    text: "text-amber-800",
    dot: "bg-amber-400"
  },
  mehndi: { 
    light: "bg-emerald-50", 
    border: "border-emerald-200", 
    text: "text-emerald-800",
    dot: "bg-emerald-400"
  },
  sangeet: { 
    light: "bg-indigo-50", 
    border: "border-indigo-200", 
    text: "text-indigo-800",
    dot: "bg-indigo-400"
  },
  wedding: { 
    light: "bg-rose-50", 
    border: "border-rose-200", 
    text: "text-rose-800",
    dot: "bg-rose-500"
  },
  none: { 
    light: "bg-[#faf9f7]", 
    border: "border-[#e8e2d9]", 
    text: "text-[#5a4838]",
    dot: "bg-[#c6b6a6]"
  }
};

// Celebration elements that fly in from left and right
const celebrationItems = [
  // Left incoming elements
  { id: 1, side: "left", icon: "🌸", startY: 20, targetX: 25, duration: 1.8, delay: 0.1 },
  { id: 2, side: "left", icon: "✨", startY: 35, targetX: 38, duration: 1.6, delay: 0.3 },
  { id: 3, side: "left", icon: "🌺", startY: 55, targetX: 30, duration: 2.1, delay: 0.2 },
  { id: 4, side: "left", icon: "💖", startY: 70, targetX: 42, duration: 1.9, delay: 0.4 },
  { id: 5, side: "left", icon: "⭐", startY: 82, targetX: 22, duration: 1.7, delay: 0.5 },
  { id: 6, side: "left", icon: "💫", startY: 45, targetX: 35, duration: 2.0, delay: 0.6 },

  // Right incoming elements
  { id: 7, side: "right", icon: "🌸", startY: 25, targetX: 75, duration: 1.8, delay: 0.15 },
  { id: 8, side: "right", icon: "✨", startY: 40, targetX: 62, duration: 1.5, delay: 0.35 },
  { id: 9, side: "right", icon: "🌹", startY: 60, targetX: 70, duration: 2.2, delay: 0.25 },
  { id: 10, side: "right", icon: "💖", startY: 75, targetX: 58, duration: 1.9, delay: 0.45 },
  { id: 11, side: "right", icon: "⭐", startY: 85, targetX: 78, duration: 1.7, delay: 0.55 },
  { id: 12, side: "right", icon: "💫", startY: 50, targetX: 65, duration: 2.0, delay: 0.65 },
];

function TimelineFlower({ progress, isCelebrating }: { progress: number; isCelebrating: boolean }) {
  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Radiant Aura */}
      <div 
        className={`absolute rounded-full filter blur-md transition-all duration-500 ${
          isCelebrating 
            ? "w-14 h-14 bg-amber-400/60 animate-pulse scale-150" 
            : "w-10 h-10 bg-rose-400/35 scale-110"
        }`} 
      />

      {/* Ripple ring during celebration */}
      {isCelebrating && (
        <span className="absolute w-12 h-12 rounded-full border-2 border-amber-400/80 animate-ping" />
      )}

      {/* Luxury Royal SVG Flower */}
      <svg
        viewBox="0 0 100 100"
        className={`w-9 h-9 md:w-11 md:h-11 drop-shadow-[0_4px_10px_rgba(143,23,54,0.45)] transition-transform duration-300 ${
          isCelebrating ? "scale-125" : "scale-100"
        }`}
        style={{
          transform: `rotate(${progress * 720}deg)`,
        }}
      >
        <defs>
          <linearGradient id="tfPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="50%" stopColor="#A91F3D" />
            <stop offset="100%" stopColor="#8F1736" />
          </linearGradient>
          <linearGradient id="tfInnerPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEE2E2" />
            <stop offset="60%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#DB2777" />
          </linearGradient>
          <radialGradient id="tfCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>
        </defs>

        {/* 8 Outer Petals */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <ellipse
            key={`outer-${i}`}
            cx="50"
            cy="24"
            rx="11"
            ry="20"
            fill="url(#tfPetalGrad)"
            stroke="#FDE68A"
            strokeWidth="1.2"
            transform={`rotate(${angle} 50 50)`}
            opacity="0.95"
          />
        ))}

        {/* 8 Inner Petals with offset */}
        {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle, i) => (
          <ellipse
            key={`inner-${i}`}
            cx="50"
            cy="33"
            rx="7.5"
            ry="14"
            fill="url(#tfInnerPetalGrad)"
            stroke="#F59E0B"
            strokeWidth="1"
            transform={`rotate(${angle} 50 50)`}
            opacity="0.9"
          />
        ))}

        {/* Glowing Center Core */}
        <circle cx="50" cy="50" r="13" fill="url(#tfCenterGlow)" stroke="#FDE68A" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="7" fill="#FFFBEB" />
        {/* Shimmering Center Diamond Star */}
        <path d="M50 42 L52.5 50 L50 58 L47.5 50 Z" fill="#B45309" />
        <path d="M42 50 L50 47.5 L58 50 L50 52.5 Z" fill="#B45309" />
      </svg>
    </div>
  );
}

export function Timeline({ events }: TimelineProps) {
  if (!events || events.length === 0) return null;

  // Memoize sorted events to guarantee a stable reference across renders, preserving sequence
  const sortedEvents = useMemo(() => {
    return [...events]
      .map((event, index) => ({ event, index }))
      .sort((a, b) => {
        if (a.event.date && b.event.date && a.event.date !== b.event.date) {
          return a.event.date.localeCompare(b.event.date);
        }
        return a.index - b.index;
      })
      .map(item => item.event);
  }, [events]);

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const eventListRef = useRef<HTMLDivElement>(null);
  const firstDotRef = useRef<HTMLDivElement>(null);
  const lastDotRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [trackMetrics, setTrackMetrics] = useState({ top: 24, height: 400 });
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Refs to allow the scroll listener to inspect and update celebration state without re-triggering useEffect
  const isCelebratingRef = useRef(false);
  const hasCelebratedRef = useRef(false);

  const celebrationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const celebrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Measure precise line height between first and last event dots
  const updateTrackMetrics = useCallback(() => {
    if (firstDotRef.current && lastDotRef.current && eventListRef.current) {
      const listRect = eventListRef.current.getBoundingClientRect();
      const firstDotRect = firstDotRef.current.getBoundingClientRect();
      const lastDotRect = lastDotRef.current.getBoundingClientRect();

      const top = (firstDotRect.top - listRect.top) + firstDotRect.height / 2;
      const bottom = (lastDotRect.top - listRect.top) + lastDotRect.height / 2;
      const height = Math.max(0, bottom - top);
      
      setTrackMetrics(prev => {
        if (Math.abs(prev.top - top) < 1 && Math.abs(prev.height - height) < 1) {
          return prev;
        }
        return { top, height };
      });
    }
  }, []);

  // Confetti cannon helper: blasts bursts from left and right edges
  const fireLeftAndRightConfetti = useCallback(() => {
    confetti({
      particleCount: 16,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: Math.random() * 0.35 + 0.45 },
      colors: ['#A91F3D', '#F43F5E', '#FBBF24', '#FDE047', '#FFFFFF', '#D995A5', '#8F1736'],
      zIndex: 99999,
      disableForReducedMotion: true
    });

    confetti({
      particleCount: 16,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: Math.random() * 0.35 + 0.45 },
      colors: ['#A91F3D', '#F43F5E', '#FBBF24', '#FDE047', '#FFFFFF', '#D995A5', '#8F1736'],
      zIndex: 99999,
      disableForReducedMotion: true
    });
  }, []);

  const startCelebration = useCallback(() => {
    if (isCelebratingRef.current) return;
    isCelebratingRef.current = true;
    hasCelebratedRef.current = true;
    setIsCelebrating(true);
    setHasCelebrated(true);

    if (celebrationIntervalRef.current) clearInterval(celebrationIntervalRef.current);
    if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current);

    // Initial instant cannon blast
    fireLeftAndRightConfetti();

    // Rhythmic cannon blasts from left and right for 5 seconds
    celebrationIntervalRef.current = setInterval(() => {
      fireLeftAndRightConfetti();
    }, 350);

    // Stop after exactly 5 seconds
    celebrationTimeoutRef.current = setTimeout(() => {
      if (celebrationIntervalRef.current) clearInterval(celebrationIntervalRef.current);
      isCelebratingRef.current = false;
      setIsCelebrating(false);
    }, 5000);
  }, [fireLeftAndRightConfetti]);

  // Scroll listener to update the flower position automatically
  useEffect(() => {
    updateTrackMetrics();

    const handleScroll = () => {
      if (!eventListRef.current) return;
      const rect = eventListRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start flower scroll when top of events enters viewport (at ~70% from top)
      const startTrigger = windowHeight * 0.70;
      // Complete flower journey when bottom of events reaches ~55% of viewport
      const endTrigger = windowHeight * 0.55;

      const totalDistance = rect.height;
      if (totalDistance <= 0) return;

      const currentScroll = startTrigger - rect.top;
      const scrollRange = totalDistance + (startTrigger - endTrigger);

      let p = currentScroll / scrollRange;
      p = Math.max(0, Math.min(1, p));

      setProgress(prev => (Math.abs(prev - p) < 0.002 ? prev : p));

      // Trigger celebration when flower arrives at the last event
      if (p >= 0.96) {
        if (!hasCelebratedRef.current && !isCelebratingRef.current) {
          startCelebration();
        }
      } else if (p < 0.6) {
        // Reset celebration trigger when user scrolls back up
        hasCelebratedRef.current = false;
        setHasCelebrated(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    const handleResize = () => {
      updateTrackMetrics();
      handleScroll();
    };
    window.addEventListener("resize", handleResize);

    handleScroll();
    const timer = setTimeout(() => {
      updateTrackMetrics();
      handleScroll();
    }, 500);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (celebrationIntervalRef.current) clearInterval(celebrationIntervalRef.current);
      if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current);
      clearTimeout(timer);
    };
  }, [sortedEvents, updateTrackMetrics, startCelebration]);

  return (
    <section 
      ref={timelineContainerRef}
      className="py-20 px-4 md:px-6 bg-[#fffaf5] flex flex-col items-center overflow-hidden relative"
    >
      {/* Subtle Floral Flourish Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/floral-flourish.png')]"></div>

      {/* Screen-Wide Celebration Overlay (5 seconds duration) */}
      <AnimatePresence>
        {isCelebrating && (
          <div className="fixed inset-0 pointer-events-none z-[99998] overflow-hidden">
            {celebrationItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{
                  x: item.side === "left" ? "-10vw" : "110vw",
                  y: `${item.startY}vh`,
                  opacity: 0,
                  scale: 0.4,
                  rotate: 0,
                }}
                animate={{
                  x: item.side === "left" ? [`-10vw`, `${item.targetX}vw`, `${item.targetX + 5}vw`] : [`110vw`, `${item.targetX}vw`, `${item.targetX - 5}vw`],
                  y: [`${item.startY}vh`, `${item.startY - 12}vh`, `${item.startY - 25}vh`],
                  opacity: [0, 1, 1, 0],
                  scale: [0.4, 1.4, 1.1, 0.6],
                  rotate: item.side === "left" ? [0, 180, 360] : [0, -180, -360],
                }}
                transition={{
                  duration: item.duration,
                  delay: item.delay,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
                className="absolute text-3xl md:text-4xl filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.7)]"
              >
                {item.icon}
              </motion.div>
            ))}

            {/* Glowing screen border accents during celebration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 border-4 border-amber-300/40 pointer-events-none"
            />
          </div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg flex flex-col items-center relative z-10"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-burgundy opacity-80" />
          <span className="font-serif text-xs uppercase tracking-[0.25em] text-wine-dark font-bold">
            Journey of Celebrations
          </span>
          <Sparkles className="w-5 h-5 text-burgundy opacity-80" />
        </div>

        <h2 className="font-serif text-4xl md:text-5xl uppercase tracking-widest text-wine-dark font-bold text-center drop-shadow-sm mb-12">
          Event Schedule
        </h2>

        <div className="w-full relative" ref={eventListRef}>
          {/* Base Inactive Track Line */}
          <div 
            className="absolute left-8 md:left-12 w-1 -translate-x-1/2 bg-[#ecdcd5]/70 rounded-full"
            style={{ 
              top: `${trackMetrics.top}px`, 
              height: `${trackMetrics.height}px` 
            }}
          />

          {/* Active Gradient Progress Line (Fills down smoothly as user scrolls) */}
          <div 
            className="absolute left-8 md:left-12 w-1 -translate-x-1/2 bg-gradient-to-b from-[#A91F3D] via-[#D995A5] to-[#F59E0B] rounded-full shadow-[0_0_8px_rgba(169,31,61,0.5)] transition-all duration-75"
            style={{ 
              top: `${trackMetrics.top}px`, 
              height: `${progress * trackMetrics.height}px` 
            }}
          />

          {/* Scrolling Flower on the timeline line */}
          <div 
            className="absolute left-8 md:left-12 -translate-x-1/2 -translate-y-1/2 z-30 transition-transform duration-75 ease-out pointer-events-none"
            style={{ 
              top: `${trackMetrics.top + progress * trackMetrics.height}px` 
            }}
          >
            <TimelineFlower progress={progress} isCelebrating={isCelebrating} />
          </div>

          {sortedEvents.map((event, index) => {
            const isFirst = index === 0;
            const isLast = index === sortedEvents.length - 1;
            const styleKey = event.decorativeStyle || "none";
            const colors = accentColors[styleKey as keyof typeof accentColors] || accentColors.none;
            const isPassed = progress >= (index / Math.max(1, sortedEvents.length - 1)) - 0.03;

            return (
              <motion.div 
                key={event.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, type: "spring", bounce: 0.3 }}
                className={`relative w-full flex flex-row items-stretch pl-16 md:pl-24 pr-2 ${
                  isLast ? "mb-0" : "mb-10"
                }`}
              >
                {/* Timeline Dot with ref for measurement */}
                <div 
                  ref={isFirst ? firstDotRef : isLast ? lastDotRef : undefined}
                  className={`absolute left-8 md:left-12 top-6 transform -translate-x-1/2 flex items-center justify-center w-5 h-5 rounded-full ${colors.dot} ring-4 ring-[#fffaf5] shadow-sm z-10 transition-all duration-300 ${
                    isPassed ? "scale-110 ring-pink-100 shadow-[0_0_10px_rgba(244,63,94,0.4)]" : "opacity-80"
                  }`} 
                >
                  {isPassed && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  )}
                </div>
                
                {/* Content Card */}
                <div className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all duration-300 relative w-full flex flex-col gap-3.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-md ${
                  isLast && isCelebrating 
                    ? "border-amber-300 ring-2 ring-amber-200/80 shadow-[0_4px_25px_rgba(245,158,11,0.25)]" 
                    : "border-[#e8e2d9]"
                }`}>
                  
                  {/* Top row: Circle Image & Title/Tagline */}
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    {/* Circular Image */}
                    {event.circularImageUrl ? (
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full border-2 ${colors.border} overflow-hidden shadow-sm ring-2 ring-white`}>
                        <img 
                          src={event.circularImageUrl} 
                          alt={event.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full border-2 ${colors.border} ${colors.light} flex items-center justify-center shadow-sm ring-2 ring-white`}>
                         <CalendarHeart className={`w-6 h-6 ${colors.text} opacity-60`} />
                      </div>
                    )}
                    
                    {/* Title & Subtitle */}
                    <div className="flex flex-col min-w-0 flex-1">
                      {event.hashtag && (
                        <span className={`font-serif text-[10px] sm:text-[11px] font-bold tracking-widest ${colors.text} opacity-85 uppercase truncate mb-0.5`}>
                          {event.hashtag}
                        </span>
                      )}
                      <h3 className={`font-serif text-base sm:text-lg md:text-xl font-extrabold uppercase tracking-wider ${colors.text} leading-tight`}>
                        {event.title}
                      </h3>
                      {event.subtitle && (
                        <span className="font-serif text-[11px] sm:text-xs text-[#8a7664] font-medium tracking-wide mt-0.5 leading-snug">
                          {event.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Clean, Mannerly Schedule Badges: Date, Time & Location (Description removed) */}
                  <div className={`rounded-xl p-3 sm:p-3.5 border ${colors.border} ${colors.light} flex flex-col gap-2.5`}>
                    {/* Date & Time Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {/* Date */}
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg bg-white border ${colors.border} flex items-center justify-center shadow-xs shrink-0`}>
                          <CalendarHeart className={`w-3.5 h-3.5 ${colors.text}`} />
                        </div>
                        <span className={`font-serif text-xs sm:text-sm font-bold tracking-wide ${colors.text}`}>
                          {formatIndianDate(event.date)}
                        </span>
                      </div>

                      {/* Time */}
                      {event.time && (
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-[#e8e2d9] shadow-xs shrink-0">
                          <Clock className={`w-3.5 h-3.5 ${colors.text}`} />
                          <span className={`font-serif text-xs sm:text-sm font-bold tracking-wide ${colors.text}`}>
                            {event.time}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Location if present */}
                    {event.location && (
                      <div className="flex items-center gap-2 pt-2 border-t border-[#e8e2d9]/60">
                        <MapPin className={`w-3.5 h-3.5 ${colors.text} shrink-0 opacity-80`} />
                        <span className="font-serif text-[11px] sm:text-xs font-semibold text-[#5a4838] leading-tight">
                          {event.location}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Celebration Highlight for the final event */}
                  {isLast && (
                    <div className="mt-1 flex flex-col items-center">
                      <AnimatePresence>
                        {isCelebrating ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full bg-gradient-to-r from-amber-500 via-rose-600 to-amber-500 text-white p-3 rounded-xl shadow-lg flex items-center justify-center gap-2 text-center"
                          >
                            <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
                            <span className="font-serif uppercase tracking-widest text-xs font-bold drop-shadow-sm">
                              Celebration Time! (5s ✨)
                            </span>
                            <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
                          </motion.div>
                        ) : hasCelebrated ? (
                          <button
                            onClick={startCelebration}
                            className="text-[11px] font-serif uppercase tracking-widest text-wine-dark/80 hover:text-burgundy font-bold flex items-center gap-1.5 py-1 px-3 rounded-full bg-blush-light hover:bg-blush-main transition-colors border border-pink-border/60"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            Celebrate Again ✨
                          </button>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  )}

                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

