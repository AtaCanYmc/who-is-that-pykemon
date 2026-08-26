import React, { useState, useRef, useEffect } from 'react';
import {
  Smartphone,
  Crop,
  Volume2,
  VolumeX,
  Sparkles,
  Camera,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ImageCropper } from './components/ImageCropper';
import { ProgressStepper } from './components/ProgressStepper';
import { ThemeSelector } from './components/ThemeSelector';
import { LiveBadgePreview, FontStyleId } from './components/LiveBadgePreview';
import { BottomActionBar } from './components/BottomActionBar';
import { soundEffects } from './utils/soundEffects';

/**
 * Main Application Component: Who is That Pykemon?
 *
 * Full-featured Neo-Retro Pokémon Experience:
 * - Glassmorphism & Neo-Retro aesthetic (Game Boy / Anime / Cyberpunk)
 * - Live dynamic reveal text & badge preview with font styles
 * - Interactive centering & zoom cropping tool
 * - Web Audio API procedural retro sound effects & mobile haptics
 * - Asynchronous task polling with animated Pokéball progress
 * - Mobile-first Thumb Zone action bar
 * - PWA native install prompt & standalone mode
 */
export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('classic');
  const [personName, setPersonName] = useState<string>('');
  const [fontStyle, setFontStyle] = useState<FontStyleId>('display');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Async job state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [jobProgress, setJobProgress] = useState<number>(0);
  const [jobMessage, setJobMessage] = useState<string>('');
  const [jobStatus, setJobStatus] = useState<string>('');
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // PWA install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Listen for PWA beforeinstallprompt event.
   */
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  /**
   * Toggle Sound Effects.
   */
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEffects.isMuted = nextMuted;
    if (!nextMuted) {
      soundEffects.playClickSound();
    }
  };

  /**
   * Triggers native browser PWA installation.
   */
  const handleInstallClick = async () => {
    soundEffects.playClickSound();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  /**
   * Handles user file selection.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setRawImageUrl(url);
      setSelectedFile(file);
      setPreviewUrl(url);
      setVideoBlobUrl(null);
      setError(null);
      soundEffects.playClickSound();
    }
  };

  /**
   * Handles drag-and-drop file upload.
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setRawImageUrl(url);
        setSelectedFile(file);
        setPreviewUrl(url);
        setVideoBlobUrl(null);
        setError(null);
        soundEffects.playClickSound();
      } else {
        setError('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, WEBP).');
      }
    }
  };

  /**
   * Handles crop confirmation from ImageCropper.
   */
  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], 'cropped_subject.png', { type: 'image/png' });
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(croppedBlob));
    setShowCropper(false);
    soundEffects.playClickSound();
  };

  /**
   * Submits job to asynchronous processing queue and polls progress.
   */
  const handleGenerate = async () => {
    if (!selectedFile || isLoading) return;

    setIsLoading(true);
    setError(null);
    setJobProgress(5);
    setJobStatus('QUEUED');
    setJobMessage('İşlem kuyruğa alınıyor...');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', personName.trim() || 'Pykemon');
    formData.append('theme', selectedTheme);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      // 1. Submit async job
      const submitRes = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        body: formData,
      });

      if (!submitRes.ok) {
        const errJson = await submitRes.json().catch(() => ({}));
        throw new Error(errJson.detail || 'İş kuyruğa alınamadı.');
      }

      const { job_id } = await submitRes.json();

      // 2. Poll job status
      let isDone = false;
      while (!isDone) {
        await new Promise((r) => setTimeout(r, 700));

        const pollRes = await fetch(`${API_URL}/api/jobs/${job_id}`);
        if (!pollRes.ok) {
          throw new Error('İşlem durumu sorgulanamadı.');
        }

        const pollData = await pollRes.json();
        setJobProgress(pollData.progress || 10);
        setJobMessage(pollData.message || 'İşleniyor...');
        setJobStatus(pollData.status);

        if (pollData.status === 'COMPLETED') {
          isDone = true;
          // 3. Fetch completed video blob
          const videoRes = await fetch(`${API_URL}/api/jobs/${job_id}/download`);
          if (!videoRes.ok) throw new Error('Video indirilemedi.');
          const blob = await videoRes.blob();
          setVideoBlobUrl(URL.createObjectURL(blob));
        } else if (pollData.status === 'FAILED') {
          throw new Error(pollData.error || 'Video işleme başarısız oldu.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Sunucu ile iletişim kurulurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Triggers native Web Share API.
   */
  const handleShare = async () => {
    if (!videoBlobUrl) return;
    try {
      const response = await fetch(videoBlobUrl);
      const blob = await response.blob();
      const filename = `whos_that_${(personName || 'pykemon').toLowerCase().replace(/\s+/g, '_')}.mp4`;
      const file = new File([blob], filename, { type: 'video/mp4' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Who's That Pykemon?",
          text: `Who's that Pykemon? It's ${personName || 'Pykemon'}!`,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: "Who's That Pykemon?",
          text: `Who's that Pykemon? It's ${personName || 'Pykemon'}!`,
          url: window.location.href,
        });
      } else {
        alert('Cihazınız doğrudan paylaşımı desteklemiyor. "İndir" butonunu kullanabilirsiniz.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
      }
    }
  };

  /**
   * Downloads video directly.
   */
  const handleDownload = () => {
    if (!videoBlobUrl) return;
    const a = document.createElement('a');
    a.href = videoBlobUrl;
    a.download = `whos_that_${(personName || 'pykemon').toLowerCase().replace(/\s+/g, '_')}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setRawImageUrl(null);
    setVideoBlobUrl(null);
    setPersonName('');
    setError(null);
    setJobProgress(0);
    setJobStatus('');
  };

  return (
    <div className="min-h-screen bg-slate-950 retro-grid-bg flex flex-col items-center justify-between p-4 sm:p-6 pb-28 text-slate-100 font-sans selection:bg-poke-yellow selection:text-slate-950">
      {/* Interactive Crop Modal */}
      {showCropper && rawImageUrl && (
        <ImageCropper
          imageUrl={rawImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
        />
      )}

      {/* Top Navigation & Sound Toggle */}
      <nav className="w-full max-w-lg flex items-center justify-between py-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
          <span className="text-[11px] font-arcade text-slate-400 tracking-wider">ONLINE</span>
        </div>

        <button
          type="button"
          onClick={handleToggleMute}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all shadow"
          title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-poke-yellow" />}
        </button>
      </nav>

      {/* Header & Logo */}
      <header className="w-full max-w-lg flex flex-col items-center pt-1 pb-4">
        {/* PWA Install Banner */}
        {deferredPrompt && !isInstalled && (
          <button
            onClick={handleInstallClick}
            className="w-full mb-4 py-2.5 px-3.5 bg-gradient-to-r from-poke-blue to-blue-600 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg active:scale-95 transition-all border border-white/10"
          >
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-poke-yellow animate-bounce" />
              <span>Ana Ekrana Ekle (PWA Uygulama)</span>
            </div>
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px] font-black">YÜKLE</span>
          </button>
        )}

        {/* Neo-Retro Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full bg-poke-red border-2 border-white flex items-center justify-center shadow-xl shadow-red-900/60 animate-pokeball-wobble">
            <div className="w-full h-1 bg-slate-950 absolute"></div>
            <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-950 z-10 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-poke-yellow"></div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-poke-yellow text-poke-stroke font-display uppercase">
            Who is That <span className="text-white">Pykemon</span>?
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5 text-center font-medium">
          Fotoğrafını yükle, anında klasik Pokémon geçiş meme videosunu üret!
        </p>
      </header>

      {/* Main Glassmorphic Card */}
      <main className="w-full max-w-lg glass-card-interactive rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col my-auto relative overflow-hidden">
        {/* Glowing Top Neon Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-poke-red via-poke-yellow to-poke-blue"></div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-500/15 border border-red-500/40 rounded-2xl flex items-start gap-2.5 text-red-200 text-xs sm:text-sm shadow-inner">
            <AlertCircle className="w-4 h-4 mt-0.5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          /* Step-by-Step Progress View */
          <ProgressStepper
            progress={jobProgress}
            message={jobMessage}
            status={jobStatus}
          />
        ) : !videoBlobUrl ? (
          /* Form Input View */
          <div className="flex flex-col gap-4">
            {/* Fotoğraf Yükleme / Dropzone */}
            <div className="relative w-full">
              <div
                onClick={() => {
                  soundEffects.playClickSound();
                  !previewUrl && fileInputRef.current?.click();
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`relative aspect-square w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 group ${
                  previewUrl
                    ? 'border-poke-yellow/70 bg-slate-950/90 shadow-2xl'
                    : 'border-slate-700 hover:border-poke-yellow bg-slate-900/50 hover:bg-slate-850'
                }`}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-[3px]">
                      <Camera className="w-4 h-4 text-poke-yellow" />
                      Fotoğrafı Değiştir
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center p-6 text-center">
                    <div className="p-4 rounded-3xl bg-poke-red/10 border border-poke-red/30 group-hover:bg-poke-yellow/20 group-hover:border-poke-yellow/50 text-poke-yellow transition-all mb-3 shadow-inner">
                      <Camera className="w-9 h-9 text-poke-yellow" />
                    </div>
                    <span className="font-bold text-sm text-slate-100">Fotoğraf Seç veya Kamerayı Aç</span>
                    <span className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP • Max 15 MB</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Crop & Adjust Overlay Button */}
              {previewUrl && (
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClickSound();
                    setShowCropper(true);
                  }}
                  className="absolute top-3 right-3 py-2 px-3 bg-slate-950/90 hover:bg-poke-yellow hover:text-slate-950 text-slate-100 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-xl backdrop-blur-md transition-all active:scale-95"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>Kırp / Odakla</span>
                </button>
              )}
            </div>

            {/* İsim Girişi */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-[11px] font-bold text-slate-300 tracking-wider uppercase flex items-center justify-between">
                <span>Açılışta Söylenecek İsim</span>
                <span className="text-[10px] text-slate-500 lowercase">opsiyonel</span>
              </label>
              <input
                id="name"
                type="text"
                maxLength={30}
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Örn: Ahmet, Caner, Pikachu..."
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-poke-yellow text-sm font-semibold text-white placeholder-slate-500 transition-all shadow-inner"
              />
            </div>

            {/* Canlı Metin & Rozet Önizleme */}
            <LiveBadgePreview
              personName={personName}
              selectedTheme={selectedTheme}
              fontStyle={fontStyle}
              onSelectFontStyle={setFontStyle}
            />

            {/* Tema Seçici */}
            <ThemeSelector
              selectedTheme={selectedTheme}
              onSelectTheme={setSelectedTheme}
            />
          </div>
        ) : (
          /* Video Sonuç Ekranı */
          <div className="flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-poke-yellow" />
                <span className="text-xs font-arcade text-poke-yellow">VİDEO TAMAMLANDI!</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">1080P • 16:9</span>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-700/80 flex items-center justify-center">
              <video
                src={videoBlobUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-3 w-full rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <HelpCircle className="w-4 h-4 text-poke-yellow" />
              <span>Videoyu doğrudan indirebilir veya Instagram/TikTok&apos;ta paylaşabilirsiniz!</span>
            </div>
          </div>
        )}
      </main>

      {/* Mobile-first Thumb Zone Action Bar */}
      <BottomActionBar
        hasImage={Boolean(selectedFile)}
        isLoading={isLoading}
        hasVideo={Boolean(videoBlobUrl)}
        onCameraClick={() => fileInputRef.current?.click()}
        onSubmit={handleGenerate}
        onDownload={handleDownload}
        onShare={handleShare}
        onReset={resetAll}
      />
    </div>
  );
}
