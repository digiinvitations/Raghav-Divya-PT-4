import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface MusicControlProps {
  musicUrl: string;
  shouldPlay?: boolean;
}

export function MusicControl({ musicUrl, shouldPlay = false }: MusicControlProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStartedAuto, setHasStartedAuto] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check visibility conditions (30s delay + scrolled down)
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    let hasScrolled = false;

    const handleScroll = () => {
      if (window.scrollY > 50) {
        hasScrolled = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    timerId = setTimeout(() => {
      if (hasScrolled || window.scrollY > 50) {
        setIsVisible(true);
      } else {
        // Wait until scroll happens if 30s passed but no scroll
        const waitScroll = () => {
          if (window.scrollY > 50) {
            setIsVisible(true);
            window.removeEventListener('scroll', waitScroll);
          }
        };
        window.addEventListener('scroll', waitScroll, { passive: true });
      }
    }, 30000);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!musicUrl) return;
    audioRef.current = new Audio(musicUrl);
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [musicUrl]);

  useEffect(() => {
    if (!musicUrl) return;
    if (shouldPlay && !hasStartedAuto && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setHasStartedAuto(true);
      }).catch((err) => {
        console.log("Autoplay blocked by browser", err);
      });
    }
  }, [shouldPlay, hasStartedAuto]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!musicUrl || !isVisible) return null;

  return (
    <button
      onClick={togglePlay}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-blush-light/80 backdrop-blur-sm shadow-sm border border-pink-border transition-transform active:scale-95"
      aria-label={isPlaying ? "Mute music" : "Play music"}
    >
      {isPlaying ? (
        <Volume2 className="w-5 h-5 text-wine-dark" />
      ) : (
        <VolumeX className="w-5 h-5 text-wine-dark opacity-60" />
      )}
    </button>
  );
}
