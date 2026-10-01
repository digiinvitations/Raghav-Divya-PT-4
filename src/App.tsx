import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { Hero } from './components/Hero';
import { InvitationMessage } from './components/InvitationMessage';
import { MusicControl } from './components/MusicControl';
import { ScratchCardSection } from './components/ScratchCard';
import { Countdown } from './components/Countdown';
import { Events } from './components/Events';
import { Timeline } from './components/Timeline';
import { Venue } from './components/Venue';
import { RSVP } from './components/RSVP';
import { ClosingMessage } from './components/ClosingMessage';
import { Footer } from './components/Footer';
import { getWeddingData, getDefaultTemplateId } from './services/db';
import { WeddingData } from './types';
import { AdminPanel } from './components/AdminPanel';
import { Preloader } from './components/Preloader';
import { Reveal } from './components/Reveal';
import { EnvironmentEffects } from './components/EnvironmentEffects';

function PublicView() {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template') || getDefaultTemplateId();

  const [data, setData] = useState<WeddingData | null>(null);
  const [isPreloading, setIsPreloading] = useState(true);
  const [viewState, setViewState] = useState<'thumbnail' | 'opening-video' | 'main'>('thumbnail');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isScratched, setIsScratched] = useState(false);
  const [isHeroEnded, setIsHeroEnded] = useState(false);
  const openingVideoRef = React.useRef<HTMLVideoElement>(null);

  const handlePreloadComplete = React.useCallback(() => {
    setIsPreloading(false);
  }, []);

  useEffect(() => {
    async function loadData() {
      const dbData = await getWeddingData(templateId);
      
      setData(dbData);
      if (!dbData.openingThumbnailUrl) {
        setViewState('main');
      }
    }
    loadData();
  }, [templateId]);

  const handleThumbnailClick = () => {
    if (viewState === 'opening-video') {
      // If user clicks again while video is buffering/stuck, skip to main
      setViewState('main');
      return;
    }

    if (data?.openingVideoUrl) {
      setViewState('opening-video');
      if (openingVideoRef.current) {
        // We set volume to 1 here in case it was muted by default, but keeping muted is safer for autoplay.
        // The play() promise can reject if the video is broken.
        openingVideoRef.current.play().catch((err) => {
          console.error("Video playback failed", err);
          setViewState('main');
        });
      }
    } else {
      setViewState('main');
    }
  };

  useEffect(() => {
    if (data?.groom?.name && data?.bride?.name) {
      const pageTitle = `${data.groom.name} & ${data.bride.name} | Wedding Invitation`;
      document.title = pageTitle;

      const desc = `You are invited to the wedding of ${data.groom.name} & ${data.bride.name}.`;
      const descMeta = document.querySelector('meta[name="description"]');
      if (descMeta) descMeta.setAttribute('content', desc);

      const ogTitleMeta = document.querySelector('meta[property="og:title"]');
      if (ogTitleMeta) ogTitleMeta.setAttribute('content', pageTitle);

      const ogDescMeta = document.querySelector('meta[property="og:description"]');
      if (ogDescMeta) ogDescMeta.setAttribute('content', desc);

      const twTitleMeta = document.querySelector('meta[name="twitter:title"]');
      if (twTitleMeta) twTitleMeta.setAttribute('content', pageTitle);

      const twDescMeta = document.querySelector('meta[name="twitter:description"]');
      if (twDescMeta) twDescMeta.setAttribute('content', desc);
    }

    if (data?.ogImageUrl) {
      // Find or create og:image meta tag
      let ogImageMeta = document.querySelector('meta[property="og:image"]');
      if (!ogImageMeta) {
        ogImageMeta = document.createElement('meta');
        ogImageMeta.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageMeta);
      }
      ogImageMeta.setAttribute('content', data.ogImageUrl);
      
      // Some platforms also use twitter:image
      let twImageMeta = document.querySelector('meta[name="twitter:image"]');
      if (!twImageMeta) {
        twImageMeta = document.createElement('meta');
        twImageMeta.setAttribute('name', 'twitter:image');
        document.head.appendChild(twImageMeta);
      }
      twImageMeta.setAttribute('content', data.ogImageUrl);
    }
  }, [data]);

  if (!data) {
    return <div className="min-h-screen bg-blush-main flex items-center justify-center font-serif text-wine-dark">Loading...</div>;
  }

  if (isPreloading) {
    return <Preloader data={data} onComplete={handlePreloadComplete} />;
  }

  return (
    <div className={`w-full bg-blush-main relative mx-auto max-w-md shadow-2xl overflow-hidden sm:my-0 ${viewState !== 'main' ? 'h-[100svh]' : 'min-h-[100svh]'}`}>
      
      {/* Audio player remains mounted across transitions */}
      <MusicControl musicUrl={data.musicUrl} shouldPlay={viewState !== 'thumbnail'} />

      {/* Global Environment Animations (Petals, Birds, Butterflies) */}
      {viewState === 'main' && <EnvironmentEffects />}

      {/* Main Content (Always rendered so Hero video preloads and starts seamlessly) */}
      <main className="w-full min-h-[100svh] bg-blush-main relative overflow-hidden">
        <Hero data={data} shouldPlayVideo={viewState === 'main' || !data.openingVideoUrl} onVideoEnd={() => setIsHeroEnded(true)} />
        <Reveal delay={0.1}><InvitationMessage message={data.invitationMessage} isHeroEnded={isHeroEnded} /></Reveal>
        <Reveal delay={0.1}><ScratchCardSection data={data} onReveal={() => setIsScratched(true)} /></Reveal>
        {isScratched && <Reveal delay={0.1}><Countdown targetDate={data.weddingDate} /></Reveal>}
        <Reveal delay={0.1}><Events events={data.events} globalLogo={data?.hero?.logoUrl} /></Reveal>
        <Reveal delay={0.1}><Timeline events={data.events} /></Reveal>
        <Reveal delay={0.1}><Venue venue={data.venue} groom={data.groom} bride={data.bride} weddingDate={data.weddingDate} /></Reveal>
        <Reveal delay={0.1}><RSVP templateId={templateId} /></Reveal>
        <Reveal delay={0.1}><ClosingMessage data={data} /></Reveal>
        <Reveal delay={0.1}><Footer data={data} /></Reveal>
      </main>

      {/* Opening Video Overlay (z-[9999]) */}
      {data.openingVideoUrl && (
        <div 
          className={`absolute inset-0 z-[9999] bg-blush-main flex items-center justify-center ${viewState === 'opening-video' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <video
            ref={openingVideoRef}
            src={data.openingVideoUrl}
            playsInline
            muted
            preload="auto"
            onLoadedData={() => setIsVideoPlaying(true)}
            onError={() => {
              console.error("Failed to load opening video.");
              setViewState('main');
            }}
            onTimeUpdate={(e) => {
              if (e.currentTarget.currentTime > 0.1) {
                setIsVideoPlaying(true);
              }
            }}
            onEnded={() => setViewState('main')}
            onClick={() => setViewState('main')}
            className="w-full h-full object-contain cursor-pointer"
          />
        </div>
      )}

      {/* Thumbnail Overlay (z-[9999]) */}
      {data.openingThumbnailUrl && (
        <div 
          className={`absolute inset-0 z-[9999] bg-blush-main flex flex-col items-center justify-center cursor-pointer transition-opacity duration-700 ${viewState === 'thumbnail' || (viewState === 'opening-video' && !isVideoPlaying) ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={handleThumbnailClick}
        >
          <img 
            src={data.openingThumbnailUrl} 
            alt="Opening" 
            className="absolute inset-0 w-full h-full object-contain" 
          />
          
          {/* Tap to open indicator */}
          <div className="absolute bottom-20 z-10 bg-white/40 backdrop-blur-md border border-white/50 px-6 py-2.5 rounded-full shadow-lg flex items-center justify-center animate-pulse">
            <span className="font-serif text-wine-dark uppercase tracking-widest text-xs font-bold drop-shadow-sm">
              Tap to open
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicView />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}


