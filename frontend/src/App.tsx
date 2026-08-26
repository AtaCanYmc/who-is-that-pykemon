import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Smartphone,
  Crop,
  Volume2,
  VolumeX,
  Sparkles,
  Camera,
  AlertCircle,
  HelpCircle,
  Download,
  Share2,
  RefreshCw,
  Zap,
  ShieldCheck,
  Film,
  Sun,
  Moon,
} from 'lucide-react';
import { ImageCropper } from './components/ImageCropper';
import { ProgressStepper } from './components/ProgressStepper';
import { ThemeSelector } from './components/ThemeSelector';
import { LiveBadgePreview, FontStyleId } from './components/LiveBadgePreview';
import { BottomActionBar } from './components/BottomActionBar';
import { LanguageSelector } from './components/LanguageSelector';
import { soundEffects } from './utils/soundEffects';
import { translations, Language } from './i18n/translations';

/**
 * Main Application Component: Who is That Pykemon?
 *
 * Full Responsive Web & Mobile Studio:
 * - Desktop/Web: 2-column Studio Workspace layout with keyboard shortcuts
 * - Mobile: Thumb Zone single-column stack with sticky floating bottom controls
 * - Dark & Light Mode Theme Support
 * - Multi-language Localization (TR, EN, FR)
 * - Neo-Retro Pokémon theme, Web Audio SFX, and live interactive previews
 */
export default function App() {
  // Localization & Theme Preferences
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    const savedLang = localStorage.getItem('pykemon_lang') as Language;
    if (savedLang && ['tr', 'en', 'fr'].includes(savedLang)) {
      return savedLang;
    }
    const navLang = navigator.language?.toLowerCase() || '';
    if (navLang.startsWith('fr')) return 'fr';
    if (navLang.startsWith('tr')) return 'tr';
    return 'en';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('pykemon_color_theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return true; // Default to sleek cyberpunk dark mode
  });

  const t = translations[currentLang];

  // Apply dark mode class to document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pykemon_color_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pykemon_color_theme', 'light');
    }
  }, [isDarkMode]);

  // Persist language change
  const handleSelectLanguage = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('pykemon_lang', lang);
  };

  const handleToggleTheme = () => {
    soundEffects.playClickSound();
    setIsDarkMode((prev) => !prev);
  };

  // Editor states
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
        setError(t.invalidFileError);
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
  const handleGenerate = useCallback(async () => {
    if (!selectedFile || isLoading) return;

    setIsLoading(true);
    setError(null);
    setJobProgress(5);
    setJobStatus('QUEUED');
    setJobMessage(t.progressRemovingBg);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', personName.trim() || t.pykemon);
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
        throw new Error(errJson.detail || 'Failed to submit job.');
      }

      const { job_id } = await submitRes.json();

      // 2. Poll job status
      let isDone = false;
      while (!isDone) {
        await new Promise((r) => setTimeout(r, 700));

        const pollRes = await fetch(`${API_URL}/api/jobs/${job_id}`);
        if (!pollRes.ok) {
          throw new Error('Failed to query job status.');
        }

        const pollData = await pollRes.json();
        setJobProgress(pollData.progress || 10);
        setJobMessage(pollData.message || 'Processing...');
        setJobStatus(pollData.status);

        if (pollData.status === 'COMPLETED') {
          isDone = true;
          // 3. Fetch completed video blob
          const videoRes = await fetch(`${API_URL}/api/jobs/${job_id}/download`);
          if (!videoRes.ok) throw new Error('Failed to download video.');
          const blob = await videoRes.blob();
          setVideoBlobUrl(URL.createObjectURL(blob));
        } else if (pollData.status === 'FAILED') {
          throw new Error(pollData.error || 'Video rendering failed.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during video generation.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, isLoading, personName, selectedTheme, t]);

  /**
   * Keyboard shortcuts: Cmd/Ctrl + Enter to trigger generation.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (selectedFile && !isLoading && !videoBlobUrl) {
          handleGenerate();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFile, isLoading, videoBlobUrl, handleGenerate]);

  /**
   * Triggers native Web Share API.
   */
  const handleShare = async () => {
    if (!videoBlobUrl) return;
    try {
      const response = await fetch(videoBlobUrl);
      const blob = await response.blob();
      const subjectName = personName || t.pykemon;
      const filename = `whos_that_${subjectName.toLowerCase().replace(/\s+/g, '_')}.mp4`;
      const file = new File([blob], filename, { type: 'video/mp4' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: t.shareTitle,
          text: t.shareText.replace('{name}', subjectName),
        });
      } else if (navigator.share) {
        await navigator.share({
          title: t.shareTitle,
          text: t.shareText.replace('{name}', subjectName),
          url: window.location.href,
        });
      } else {
        alert(t.shareNotSupported);
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
    const subjectName = personName || t.pykemon;
    a.download = `whos_that_${subjectName.toLowerCase().replace(/\s+/g, '_')}.mp4`;
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
    <div className="min-h-screen retro-grid-bg flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 font-sans selection:bg-poke-yellow selection:text-slate-950 transition-colors duration-300">
      {/* Interactive Crop Modal */}
      {showCropper && rawImageUrl && (
        <ImageCropper
          imageUrl={rawImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
          t={t}
        />
      )}

      {/* Top Navigation Bar */}
      <nav className="w-full max-w-5xl flex items-center justify-between py-2 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
          <span className="text-[11px] font-arcade text-slate-400 dark:text-slate-300 light:text-slate-600 tracking-wider">
            {t.engineReady}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <LanguageSelector
            currentLang={currentLang}
            onSelectLang={handleSelectLanguage}
          />

          {/* Theme Toggle (Dark / Light) */}
          <button
            type="button"
            onClick={handleToggleTheme}
            className="p-2 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-700/60 dark:border-slate-800 light:border-slate-300 text-slate-400 dark:text-slate-400 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-950 transition-all shadow-sm"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-poke-yellow" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-700/60 dark:border-slate-800 light:border-slate-300 text-slate-400 dark:text-slate-400 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-950 transition-all shadow-sm"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-poke-yellow" />}
          </button>

          {/* PWA Install Button */}
          {deferredPrompt && !isInstalled && (
            <button
              onClick={handleInstallClick}
              className="hidden sm:flex py-1.5 px-3 bg-poke-blue/30 hover:bg-poke-blue/50 text-poke-yellow border border-poke-blue/40 rounded-xl text-xs font-bold items-center gap-1.5 transition-all shadow"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t.installApp}</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main Studio Container */}
      <div className="w-full max-w-5xl flex flex-col items-center my-auto">
        {/* Header & Logo */}
        <header className="w-full flex flex-col items-center pt-1 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-poke-red border-2 border-white flex items-center justify-center shadow-xl shadow-red-900/60 animate-pokeball-wobble">
              <div className="w-full h-1 bg-slate-950 absolute"></div>
              <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-950 z-10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-poke-yellow"></div>
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-wider text-poke-yellow text-poke-stroke font-display uppercase">
              {t.appTitle} <span className="text-white dark:text-white light:text-slate-900">{t.pykemon}</span>?
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 mt-2 text-center font-medium max-w-md sm:max-w-lg">
            {t.tagline}
          </p>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="w-full mb-6 p-4 bg-red-500/15 border border-red-500/40 rounded-3xl flex items-start gap-3 text-red-200 text-xs sm:text-sm shadow-inner">
            <AlertCircle className="w-5 h-5 mt-0.5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Content Glass Card */}
        <main className="w-full glass-card-interactive rounded-3xl p-5 sm:p-7 lg:p-8 shadow-2xl flex flex-col relative overflow-hidden transition-all duration-300">
          {/* Glowing Top Neon Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-poke-red via-poke-yellow to-poke-blue"></div>

          {isLoading ? (
            /* Step-by-Step Progress View */
            <div className="max-w-md mx-auto w-full py-6">
              <ProgressStepper
                progress={jobProgress}
                message={jobMessage}
                status={jobStatus}
                t={t}
              />
            </div>
          ) : !videoBlobUrl ? (
            /* Responsive 2-Column Studio Grid (Mobile Stack / Desktop 2-Column) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left Column: Visual Dropzone & Live Preview (lg:col-span-5) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
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
                        : 'border-slate-700 dark:border-slate-700 light:border-slate-300 hover:border-poke-yellow bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 hover:bg-slate-850 light:hover:bg-slate-100'
                    }`}
                  >
                    {previewUrl ? (
                      <>
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-[3px]">
                          <Camera className="w-4 h-4 text-poke-yellow" />
                          {t.changePhoto}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center p-6 text-center">
                        <div className="p-4 rounded-3xl bg-poke-red/10 border border-poke-red/30 group-hover:bg-poke-yellow/20 group-hover:border-poke-yellow/50 text-poke-yellow transition-all mb-3 shadow-inner">
                          <Camera className="w-10 h-10 text-poke-yellow" />
                        </div>
                        <span className="font-bold text-sm text-slate-100 dark:text-slate-100 light:text-slate-900">{t.dropzoneTitle}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 light:text-slate-500 mt-1">{t.dropzoneSub}</span>
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
                      <span>{t.cropAdjust}</span>
                    </button>
                  )}
                </div>

                {/* Live Badge Preview Card */}
                <LiveBadgePreview
                  personName={personName}
                  selectedTheme={selectedTheme}
                  fontStyle={fontStyle}
                  onSelectFontStyle={setFontStyle}
                  t={t}
                />
              </div>

              {/* Right Column: Customization Deck & Controls (lg:col-span-7) */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                {/* Name Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-[11px] font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 tracking-wider uppercase flex items-center justify-between">
                    <span>{t.nameLabel}</span>
                    <span className="text-[10px] text-slate-500">{personName.length}/30 {t.nameCharCount}</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    maxLength={30}
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="w-full px-4 py-3.5 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-poke-yellow text-sm font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder-slate-500 transition-all shadow-inner"
                  />
                </div>

                {/* Theme Selector */}
                <ThemeSelector
                  selectedTheme={selectedTheme}
                  onSelectTheme={setSelectedTheme}
                  t={t}
                />

                {/* Feature Highlights Grid */}
                <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-100 border border-slate-800/80 dark:border-slate-800 light:border-slate-300 text-center">
                  <div className="flex flex-col items-center">
                    <Zap className="w-4 h-4 text-poke-yellow mb-1" />
                    <span className="text-[10px] font-bold text-slate-300 dark:text-slate-300 light:text-slate-800">{t.highlightAi}</span>
                    <span className="text-[9px] text-slate-500">{t.highlightAiDesc}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Film className="w-4 h-4 text-cyan-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-300 dark:text-slate-300 light:text-slate-800">{t.highlight1080p}</span>
                    <span className="text-[9px] text-slate-500">{t.highlight1080pDesc}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <ShieldCheck className="w-4 h-4 text-green-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-300 dark:text-slate-300 light:text-slate-800">{t.highlightAudio}</span>
                    <span className="text-[9px] text-slate-500">{t.highlightAudioDesc}</span>
                  </div>
                </div>

                {/* Desktop Primary CTA Button (Visible on Desktop 'lg', handled by BottomActionBar on Mobile) */}
                <div className="hidden lg:flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    disabled={!selectedFile || isLoading}
                    onClick={() => {
                      soundEffects.playClickSound();
                      handleGenerate();
                    }}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all shadow-xl ${
                      !selectedFile || isLoading
                        ? 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-700 dark:border-slate-700 light:border-slate-300'
                        : 'bg-gradient-to-r from-poke-red via-red-600 to-amber-500 hover:brightness-110 text-white shadow-red-900/50 active:scale-[0.98] ring-1 ring-white/20 animate-glow-pulse cursor-pointer'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 text-poke-yellow" />
                    <span>{isLoading ? t.generatingBtn : t.generateBtn}</span>
                  </button>

                  <span className="text-[10px] text-slate-500 text-center font-mono">
                    {t.shortcutTip}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Video Result Studio Screen */
            <div className="flex flex-col items-center gap-5 max-w-2xl mx-auto w-full">
              <div className="w-full flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-poke-yellow" />
                  <span className="text-xs font-arcade text-poke-yellow">{t.videoCompleted}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{t.videoSpecs}</span>
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

              {/* Desktop & Mobile Action Buttons */}
              <div className="grid grid-cols-3 gap-3 w-full">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClickSound();
                    resetAll();
                  }}
                  className="py-3.5 px-3 rounded-2xl bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-750 dark:hover:bg-slate-750 light:hover:bg-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 dark:border-slate-700 light:border-slate-300 active:scale-95 transition-all shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t.newVideoBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClickSound();
                    handleDownload();
                  }}
                  className="py-3.5 px-4 rounded-2xl bg-poke-yellow hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.downloadBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClickSound();
                    handleShare();
                  }}
                  className="py-3.5 px-4 rounded-2xl bg-poke-blue hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{t.shareBtn}</span>
                </button>
              </div>

              <div className="p-3 w-full rounded-2xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-center text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 flex items-center justify-center gap-2">
                <HelpCircle className="w-4 h-4 text-poke-yellow" />
                <span>{t.shareAdvice}</span>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile-first Thumb Zone Action Bar (Sticky on Mobile, hidden on Desktop 'lg') */}
      <BottomActionBar
        hasImage={Boolean(selectedFile)}
        isLoading={isLoading}
        hasVideo={Boolean(videoBlobUrl)}
        onCameraClick={() => fileInputRef.current?.click()}
        onSubmit={handleGenerate}
        onDownload={handleDownload}
        onShare={handleShare}
        onReset={resetAll}
        t={t}
      />

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center pt-6 text-[11px] text-slate-500 font-medium hidden sm:block">
        {t.footerText}
      </footer>
    </div>
  );
}
