import { motion } from "motion/react";
import { HeartDivider } from "./HeartDivider";
import { VenueDetails, Person } from "../types";
import { MapPin, CalendarPlus } from "lucide-react";

interface VenueProps {
  venue: VenueDetails;
  groom?: Person;
  bride?: Person;
  weddingDate?: string;
}

export function Venue({ venue, groom, bride, weddingDate }: VenueProps) {
  // Generate Google Calendar URL
  let calendarUrl = "";
  if (groom && bride && weddingDate) {
    const title = encodeURIComponent(`Wedding of ${groom.name} & ${bride.name}`);
    const location = encodeURIComponent(`${venue.name}, ${venue.addressLine1}, ${venue.addressLine2}`);
    
    // Convert to ISO string and remove punctuation for Google Calendar format (YYYYMMDDTHHMMSSZ)
    const startDate = new Date(weddingDate);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // add 24 hours
    const startStr = startDate.toISOString().replace(/-|:|\.\d\d\d/g,"");
    const endStr = endDate.toISOString().replace(/-|:|\.\d\d\d/g,"");
    
    calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&location=${location}&details=We+can't+wait+to+celebrate+with+you!`;
  }

  return (
    <section className="py-16 px-6 bg-blush-light flex flex-col items-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md flex flex-col items-center text-center relative"
      >
        <MapPin className="w-6 h-6 text-wine-dark mb-4 opacity-80" strokeWidth={1.5} />
        <h2 className="font-serif text-4xl md:text-5xl uppercase tracking-widest text-wine-dark font-bold text-center drop-shadow-sm">
          Venue
        </h2>
        
        <HeartDivider />

        <div className="mt-4 flex flex-col items-center relative z-10">
          <h3 className="font-serif font-bold text-2xl text-wine-dark mb-3">{venue.name}</h3>
          <p className="text-wine-dark/80 text-sm md:text-base font-semibold max-w-[250px] leading-relaxed">
            {venue.addressLine1}
            <br />
            {venue.addressLine2}
          </p>
        </div>

        {/* Minimal palace line art placeholder */}
        <div className="w-full max-w-[280px] h-32 mt-10 mb-8 opacity-20 flex items-end justify-center pointer-events-none">
          <svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full stroke-wine-dark" strokeWidth="1">
            <path d="M100 10C115 10 125 25 125 45V90H75V45C75 25 85 10 100 10Z" />
            <path d="M40 50C48 50 55 58 55 70V90H25V70C25 58 32 50 40 50Z" />
            <path d="M160 50C168 50 175 58 175 70V90H145V70C145 58 152 50 160 50Z" />
            <line x1="0" y1="90" x2="200" y2="90" />
            <path d="M90 90V65C90 60 94 55 100 55C106 55 110 60 110 65V90" />
            <line x1="25" y1="35" x2="25" y2="50" />
            <line x1="175" y1="35" x2="175" y2="50" />
            <circle cx="25" cy="32" r="3" />
            <circle cx="175" cy="32" r="3" />
            <circle cx="100" cy="5" r="5" />
          </svg>
        </div>

        <div className="flex flex-col gap-4 w-full px-4">
          <a 
            href={venue.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-burgundy text-white px-8 py-3 rounded-md font-serif text-sm tracking-widest shadow-md hover:bg-wine-dark transition-colors active:scale-95"
          >
            <MapPin className="w-4 h-4" /> View on Google Maps
          </a>
          
          {calendarUrl && (
            <a 
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white text-wine-dark border border-pink-border px-8 py-3 rounded-md font-serif text-sm tracking-widest shadow-sm hover:bg-blush-main transition-colors active:scale-95"
            >
              <CalendarPlus className="w-4 h-4" /> Save to Calendar
            </a>
          )}
        </div>
      </motion.div>
    </section>
  );
}
