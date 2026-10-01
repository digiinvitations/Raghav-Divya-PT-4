import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { WeddingData } from '../types';

interface PreloaderProps {
  data: WeddingData;
  onComplete: () => void;
}

export function Preloader({ data, onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let isMounted = true;

    // Inject high-priority preloads into document head for video and critical image assets
    const injectedLinks: HTMLLinkElement[] = [];
    const addPreloadLink = (href: string, asType: string) => {
      if (!href) return;
      try {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = asType;
        link.href = href;
        document.head.appendChild(link);
        injectedLinks.push(link);
      } catch {
        // ignore
      }
    };

    if (data.openingVideoUrl) addPreloadLink(data.openingVideoUrl, 'video');
    if (data.heroVideoUrl) addPreloadLink(data.heroVideoUrl, 'video');
    if (data.openingThumbnailUrl) addPreloadLink(data.openingThumbnailUrl, 'image');

    const loadAllAssets = async () => {
      const assetList: { type: 'image' | 'video' | 'audio'; url: string }[] = [];

      // Critical opener & hero assets
      if (data.openingThumbnailUrl) assetList.push({ type: 'image', url: data.openingThumbnailUrl });
      if (data.openingVideoUrl) assetList.push({ type: 'video', url: data.openingVideoUrl });
      if (data.heroVideoUrl) assetList.push({ type: 'video', url: data.heroVideoUrl });
      if (data.ogImageUrl) assetList.push({ type: 'image', url: data.ogImageUrl });
      if (data.musicUrl) assetList.push({ type: 'audio', url: data.musicUrl });

      // Floral flourish pattern texture used in backgrounds
      assetList.push({ 
        type: 'image', 
        url: 'https://www.transparenttextures.com/patterns/floral-flourish.png' 
      });

      // Events media & artwork
      if (data.events && Array.isArray(data.events)) {
        data.events.forEach(e => {
          if (e.backgroundUrl) assetList.push({ type: 'image', url: e.backgroundUrl });
          if (e.caricatureUrl) assetList.push({ type: 'image', url: e.caricatureUrl });
          if (e.circularImageUrl) assetList.push({ type: 'image', url: e.circularImageUrl });
          if (e.logoUrl) assetList.push({ type: 'image', url: e.logoUrl });
          if (e.image) assetList.push({ type: 'image', url: e.image });
          if (e.videoUrl) assetList.push({ type: 'video', url: e.videoUrl });
        });
      }

      // Gallery photos
      if (data.gallery && Array.isArray(data.gallery)) {
        data.gallery.forEach(url => {
          if (url) assetList.push({ type: 'image', url });
        });
      }

      // Deduplicate by URL
      const uniqueAssets = Array.from(new Set(assetList.map(a => a.url)))
        .map(url => assetList.find(a => a.url === url)!);

      const total = uniqueAssets.length;
      if (total === 0) {
        onCompleteRef.current();
        return;
      }

      let loadedCount = 0;
      const stepProgress = () => {
        loadedCount++;
        if (isMounted) {
          setProgress(Math.min(99, Math.round((loadedCount / total) * 100)));
        }
      };

      const promises = uniqueAssets.map(asset => {
        return new Promise<void>((resolve) => {
          if (asset.type === 'image') {
            const img = new Image();
            img.src = asset.url;

            if (img.complete) {
              stepProgress();
              resolve();
            } else {
              img.onload = () => {
                if ('decode' in img) {
                  img.decode().then(() => {
                    stepProgress();
                    resolve();
                  }).catch(() => {
                    stepProgress();
                    resolve();
                  });
                } else {
                  stepProgress();
                  resolve();
                }
              };
              img.onerror = () => {
                stepProgress();
                resolve();
              };
            }
          } else if (asset.type === 'video') {
            const video = document.createElement('video');
            video.preload = 'auto';
            video.muted = true;
            video.playsInline = true;
            video.src = asset.url;

            if (video.readyState >= 2) {
              stepProgress();
              resolve();
            } else {
              let settled = false;
              const onReady = () => {
                if (settled) return;
                settled = true;
                cleanup();
                stepProgress();
                resolve();
              };
              const cleanup = () => {
                video.removeEventListener('loadeddata', onReady);
                video.removeEventListener('canplay', onReady);
                video.removeEventListener('canplaythrough', onReady);
                video.removeEventListener('error', onReady);
              };

              video.addEventListener('loadeddata', onReady, { once: true });
              video.addEventListener('canplay', onReady, { once: true });
              video.addEventListener('canplaythrough', onReady, { once: true });
              video.addEventListener('error', onReady, { once: true });
              video.load();

              // Safety timeout per video
              setTimeout(onReady, 4000);
            }
          } else if (asset.type === 'audio') {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.src = asset.url;

            if (audio.readyState >= 2) {
              stepProgress();
              resolve();
            } else {
              let settled = false;
              const onReady = () => {
                if (settled) return;
                settled = true;
                cleanup();
                stepProgress();
                resolve();
              };
              const cleanup = () => {
                audio.removeEventListener('canplay', onReady);
                audio.removeEventListener('canplaythrough', onReady);
                audio.removeEventListener('error', onReady);
              };

              audio.addEventListener('canplay', onReady, { once: true });
              audio.addEventListener('canplaythrough', onReady, { once: true });
              audio.addEventListener('error', onReady, { once: true });
              audio.load();

              setTimeout(onReady, 3000);
            }
          }
        });
      });

      // Global safety timeout to ensure slow networks never lock the screen
      const timeout = new Promise<void>(resolve => setTimeout(resolve, 9000));

      await Promise.race([Promise.all(promises), timeout]);

      if (isMounted) {
        setProgress(100);
        setTimeout(() => {
          if (isMounted) onCompleteRef.current();
        }, 500);
      }
    };

    loadAllAssets();

    return () => { 
      isMounted = false; 
      injectedLinks.forEach(link => {
        if (link && link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [data]);

  return (
    <div className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-[#FDF5F5] px-6 select-none">
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ 
          rotate: { repeat: Infinity, duration: 4, ease: "linear" },
          scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
        }}
        className="mb-8 flex items-center justify-center"
      >
        <span className="text-5xl drop-shadow-md">🌸</span>
      </motion.div>
      <div className="w-full max-w-xs">
        <div className="h-1 w-full bg-[#A91F3D]/15 rounded-full overflow-visible relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#A91F3D] to-[#D995A5] absolute top-0 left-0 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
          {/* Progress Indicator Flower */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 text-[12px] drop-shadow-sm z-10"
            initial={{ left: "0%" }}
            animate={{ left: `calc(${progress}% - 6px)` }}
            transition={{ duration: 0.2 }}
          >
            🌸
          </motion.div>
        </div>
        <p className="text-center text-[#8F1736] font-serif text-[11px] uppercase tracking-widest mt-6 font-bold opacity-90 drop-shadow-sm">
          {progress < 100 ? `Loading Invitation ${progress}%` : "Welcome"}
        </p>
      </div>
    </div>
  );
}
