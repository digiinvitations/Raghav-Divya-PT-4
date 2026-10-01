import React from "react";
import { motion } from "motion/react";
import { HeartDivider } from "./HeartDivider";
import { EventDetails } from "../types";
import { Calendar, MapPin } from "lucide-react";
import { FloatingLanterns } from "./FloatingLanterns";

interface EventsProps {
  events: EventDetails[];
  globalLogo?: string;
}

// Map decorative styles to specific colors for particles/overlays
const themeMap = {
  haldi: { particle: "#FBBF24", text: "text-amber-950", border: "border-amber-900/40" },
  mehndi: { particle: "#34D399", text: "text-emerald-950", border: "border-emerald-900/40" },
  sangeet: { particle: "#818CF8", text: "text-indigo-950", border: "border-indigo-900/40" },
  wedding: { particle: "#F43F5E", text: "text-rose-950", border: "border-rose-900/40" },
  none: { particle: "#FFFFFF", text: "text-wine-dark", border: "border-wine-dark/30" }
};

function EventCard({ event, index, globalLogo }: { event: EventDetails; index: number; globalLogo?: string }) {
  const theme = themeMap[event.decorativeStyle || "none"] || themeMap.none;
  const isEvening = event.time?.toLowerCase().includes("pm") || event.decorativeStyle === "sangeet" || event.title.toLowerCase().includes("night") || event.title.toLowerCase().includes("evening");

  return (
    <div className="w-full max-w-md aspect-[4/5] relative flex flex-col items-center justify-center overflow-hidden rounded-2xl shadow-2xl mx-auto">
      {/* Background Image - HD & 100% visible (no dark overlays) */}
      {event.backgroundUrl ? (
        <img 
          src={event.backgroundUrl} 
          alt={event.title} 
          className="absolute inset-0 w-full h-full object-cover z-0" 
        />
      ) : (
        <div className="absolute inset-0 bg-blush-main z-0" />
      )}

      {isEvening && <FloatingLanterns />}

      {/* Animated Subtle Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              backgroundColor: theme.particle,
              width: Math.random() * 4 + 2 + "px",
              height: Math.random() * 4 + 2 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.2
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: Math.random() * 3 + 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 bottom-[13rem] sm:bottom-[15rem] z-10 px-3 py-3 flex flex-col items-center justify-center text-center bg-white/20 backdrop-blur-md rounded-lg border border-white/40 shadow-inner overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {/* Logo - Universal and smaller */}
        {event.showLogo !== false && globalLogo && (
          <motion.img 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            src={globalLogo} 
            alt="Logo" 
            className="w-10 h-10 shrink-0 object-contain mb-2 drop-shadow-md rounded-full bg-white/30 backdrop-blur-md p-1.5 border border-white/40" 
          />
        )}

        {/* Text Details */}
        <div className="flex flex-col items-center justify-center w-full max-w-[280px]">
          {event.showHashtag !== false && event.hashtag && (
            <p className={`font-serif text-[8px] sm:text-[9px] tracking-[0.3em] uppercase ${theme.text} mb-1.5 drop-shadow-sm font-extrabold opacity-100`}>
              {event.hashtag}
            </p>
          )}
          
          {event.showSubtitle !== false && event.subtitle && (
            <p className={`font-serif text-[9px] sm:text-[10px] tracking-[0.2em] uppercase ${theme.text} mb-1.5 drop-shadow-sm opacity-100 font-bold`}>
              {event.subtitle}
            </p>
          )}

          {event.showDescription !== false && event.description && (
            <p className={`font-serif text-[9px] sm:text-[10px] leading-snug ${theme.text} drop-shadow-sm italic whitespace-pre-line mb-3 font-semibold`}>
              {event.description}
            </p>
          )}
          
          {event.showTitle !== false && (
            <h3 className={`font-serif text-xl sm:text-2xl font-extrabold uppercase tracking-widest ${theme.text} mb-3 drop-shadow-lg leading-tight w-full`}>
              {event.title}
            </h3>
          )}

          {(event.showDate !== false || event.showTime !== false || event.location) && (
             <div className={`border ${theme.border} rounded-lg px-3 py-1.5 bg-white/30 backdrop-blur-md shadow-sm flex flex-col items-center justify-center gap-0.5 min-w-[120px] shrink-0 w-full`}>
               {(event.showDate !== false || event.showTime !== false) && (
                 <p className={`font-serif text-[9px] sm:text-[10px] tracking-widest ${theme.text} drop-shadow-sm font-extrabold text-center`}>
                   {[event.showDate !== false ? event.date : null, event.showTime !== false ? event.time : null].filter(Boolean).join(" • ")}
                 </p>
               )}
               {event.location && (
                 <p className={`font-serif text-[8px] sm:text-[9px] tracking-[0.15em] ${theme.text} drop-shadow-sm opacity-100 font-bold mt-1 border-t ${theme.border} pt-1 text-center w-full`}>
                   {event.location}
                 </p>
               )}
             </div>
          )}
        </div>
      </motion.div>

      {/* Caricature */}
      {event.showCaricature !== false && event.caricatureUrl && (
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-4 z-20 pointer-events-none"
        >
          <img 
            src={event.caricatureUrl} 
            alt="Caricature" 
            className="w-48 h-48 object-contain drop-shadow-2xl" 
          />
        </motion.div>
      )}
    </div>
  );
}

export function Events({ events, globalLogo }: EventsProps) {
  if (!events || events.length === 0) return null;

  // Sort events automatically by date/time
  const sortedEvents = [...events].sort((a, b) => {
    // Attempt to parse dates, if they fail, fallback to 0 to maintain original order
    const dateA = new Date(`${a.date} 2026 ${a.time || '12:00 PM'}`).getTime();
    const dateB = new Date(`${b.date} 2026 ${b.time || '12:00 PM'}`).getTime();
    if (!isNaN(dateA) && !isNaN(dateB)) return dateA - dateB;
    // simple string compare fallback if it's YYYY-MM-DD
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.time || "").localeCompare(b.time || "");
  });

  // Smart Logo Cascading: If the Hero global logo is missing, look for any logo uploaded to ANY event and use it everywhere.
  const universalLogo = globalLogo || events.find(e => e.logoUrl)?.logoUrl;

  return (
    <section className="bg-[#f5e3e6] py-24 px-4 md:px-8 flex flex-col items-center">
      <h2 className="font-serif text-3xl md:text-4xl uppercase tracking-widest text-wine-dark text-center drop-shadow-sm font-bold mb-4">
        Event Schedule
      </h2>
      <div className="mb-14">
        <HeartDivider />
      </div>
      <div className="w-full flex flex-col gap-16 md:gap-24">
        {sortedEvents.map((event, index) => (
          <div key={event.id || index}>
            <EventCard event={event} index={index} globalLogo={universalLogo} />
          </div>
        ))}
      </div>
    </section>
  );
}
