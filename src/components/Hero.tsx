import { motion } from "motion/react";
import { Heart, ArrowDown } from "lucide-react";
import { WeddingData } from "../types";
import { useState, useRef, useEffect } from "react";

interface HeroProps {
  data: WeddingData;
  shouldPlayVideo?: boolean;
  onVideoEnd?: () => void;
}

export function Hero({ data, shouldPlayVideo = true, onVideoEnd }: HeroProps) {
  const [showText, setShowText] = useState(!data.heroVideoUrl);
  const [isEnded, setIsEnded] = useState(!data.heroVideoUrl);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (shouldPlayVideo && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Hero video autoplay failed, showing content:", err);
        setShowText(true);
        setIsEnded(true);
        if (onVideoEnd) onVideoEnd();
      });
    }
  }, [shouldPlayVideo, onVideoEnd]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime } = videoRef.current;
      if (currentTime >= 1.5) {
        if (!showText) setShowText(true);
      }
    }
  };

  const handleEnded = () => {
    setIsEnded(true);
    setShowText(true);
    if (onVideoEnd) onVideoEnd();
  };

  return (
    <section className="relative min-h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden bg-blush-main">
      {/* Background Video or Image */}
      <div className="absolute inset-0 z-0 bg-blush-main overflow-hidden">
        {data.heroVideoUrl ? (
          <video
            ref={videoRef}
            src={data.heroVideoUrl}
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setIsVideoReady(true)}
            onCanPlay={() => setIsVideoReady(true)}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onError={() => {
              console.warn("Hero video failed to load, falling back to text");
              setShowText(true);
              setIsEnded(true);
              if (onVideoEnd) onVideoEnd();
            }}
            className={`w-full h-full object-cover transition-opacity duration-700 ease-in-out ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop')" }}
          />
        )}
        
        {/* Dynamic Light/Pink Overlay for readability */}
        <div className={`absolute inset-0 bg-white/20 transition-opacity duration-1000 ${data.heroVideoUrl && !showText ? 'opacity-0' : 'opacity-100'}`} />

        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-blush-main to-transparent pointer-events-none z-10" />
      </div>

      {/* Content */}
      <div className={`relative z-10 flex flex-col items-center justify-center px-6 text-center w-full max-w-md mx-auto pt-12 pb-6 h-full min-h-[100svh] transition-opacity duration-1000 ${showText ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        <div className="flex-1 flex flex-col items-center justify-center w-full mt-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 10 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex flex-col items-center w-full"
          >
            <Heart className="w-5 h-5 text-[#A91F3D] fill-[#A91F3D] mb-4 opacity-90" />
            <p className="font-serif text-[#8F1736] text-[14px] italic mb-4 max-w-[280px] leading-relaxed whitespace-pre-line font-medium">
              {data.heroMessage}
            </p>
            
            <div className="flex items-center justify-center gap-3 opacity-80 mb-6">
              <div className="h-[1px] w-12 bg-[#8F1736]"></div>
              <Heart className="w-3 h-3 text-[#A91F3D] fill-[#A91F3D]" />
              <div className="h-[1px] w-12 bg-[#8F1736]"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: showText ? 1 : 0, scale: showText ? 1 : 0.95 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="flex flex-col items-center justify-center w-full"
          >
            <h1 className="font-script text-5xl sm:text-6xl text-[#8F1736] drop-shadow-sm leading-none whitespace-nowrap">
              {data.groom.name}
            </h1>
            <div className="font-serif text-[12px] text-[#5D4147] flex flex-col items-center gap-1 mt-2 mb-5 font-medium">
              <p>
                {data.groom.parents || (data.groom.motherName && data.groom.fatherName 
                  ? `Son of ${data.groom.motherName} & ${data.groom.fatherName}`
                  : data.groom.motherName ? `Son of ${data.groom.motherName}`
                  : data.groom.fatherName ? `Son of ${data.groom.fatherName}` : '')}
              </p>
              {data.groom.education && <p>{data.groom.education}</p>}
              {data.groom.profession && <p>{data.groom.profession}</p>}
            </div>
            
            <span className="font-script text-3xl text-[#D995A5] my-1">&amp;</span>
            
            <h1 className="font-script text-5xl sm:text-6xl text-[#8F1736] drop-shadow-sm leading-none mt-3 whitespace-nowrap">
              {data.bride.name}
            </h1>
            <div className="font-serif text-[12px] text-[#5D4147] flex flex-col items-center gap-1 mt-2 font-medium">
              <p>
                {data.bride.parents || (data.bride.motherName && data.bride.fatherName 
                  ? `Daughter of ${data.bride.motherName} & ${data.bride.fatherName}`
                  : data.bride.motherName ? `Daughter of ${data.bride.motherName}`
                  : data.bride.fatherName ? `Daughter of ${data.bride.fatherName}` : '')}
              </p>
              {data.bride.education && <p>{data.bride.education}</p>}
              {data.bride.profession && <p>{data.bride.profession}</p>}
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showText ? 0.8 : 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-6 flex flex-col items-center"
        >
          <span className="text-[10px] font-serif text-[#8F1736] uppercase tracking-[0.3em] mb-2 font-bold">Scroll</span>
          <motion.div 
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="w-4 h-4 text-[#8F1736]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
