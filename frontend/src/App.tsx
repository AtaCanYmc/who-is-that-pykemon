import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  Camera,
  AlertCircle,
  Smartphone,
  Crop
} from 'lucide-react';
import { ImageCropper } from './components/ImageCropper';
import { ProgressStepper } from './components/ProgressStepper';
import { ThemeSelector } from './components/ThemeSelector';

/**
 * Main Application Component: Who is That Pykemon?
 *
 * Full-featured Progressive Web App with:
 * - Image selection & camera capture
 * - Interactive centering & zoom cropping tool
 * - Multi-theme customization (Kanto Classic, Johto Gold, Cyber Neon)
 * - Asynchronous task polling with step-by-step progress
 * - 16:9 video preview, download, and Web Share API
 */
export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('classic');
  const [personName, setPersonName] = useState<string>('');

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
   * Triggers native browser PWA installation.
   */
  const handleInstallClick = async () => {
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
  };

  /**
   * Submits job to asynchronous processing queue and polls progress.
   */
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

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
        await new Promise((r) => setTimeout(r, 800));

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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-between p-4 sm:p-6 text-slate-100 font-sans">
      {/* Interactive Crop Modal */}
      {showCropper && rawImageUrl && (
        <ImageCropper
          imageUrl={rawImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
        />
      )}

      {/* Header & Logo */}
      <header className="w-full max-w-md flex flex-col items-center pt-2 pb-4">
        {/* PWA Install Banner */}
        {deferredPrompt && !isInstalled && (
          <button
            onClick={handleInstallClick}
            className="w-full mb-4 py-2 px-3 bg-gradient-to-r from-poke-blue to-blue-600 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-poke-yellow animate-bounce" />
              <span>Ana Ekrana Ekle (PWA)</span>
            </div>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">YÜKLE</span>
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-poke-red border-2 border-white flex items-center justify-center shadow-lg shadow-red-900/50">
            <div className="w-full h-1 bg-slate-950 absolute"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-950 z-10"></div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-poke-yellow drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase">
            Who is That <span className="text-white">Pykemon</span>?
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 text-center font-medium">
          Fotoğrafını yükle, anında klasik Pokémon geçiş meme videosunu üret!
        </p>
      </header>

      {/* Main Content Card */}
      <main className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col my-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/40 rounded-2xl flex items-start gap-2.5 text-red-200 text-xs sm:text-sm">
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
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            {/* Fotoğraf Yükleme / Dropzone */}
            <div className="relative w-full">
              <div
                onClick={() => !previewUrl && fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`relative aspect-square w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 group ${
                  previewUrl
                    ? 'border-poke-yellow/60 bg-slate-950/80'
                    : 'border-slate-700 hover:border-poke-yellow bg-slate-800/40 hover:bg-slate-800/70'
                }`}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-medium text-xs backdrop-blur-[2px]">
                      <Camera className="w-4 h-4 text-poke-yellow" />
                      Fotoğrafı Değiştir
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center p-6 text-center">
                    <div className="p-4 rounded-2xl bg-poke-red/10 border border-poke-red/20 group-hover:bg-poke-yellow/20 group-hover:border-poke-yellow/40 text-poke-yellow transition-all mb-3 shadow-inner">
                      <Camera className="w-8 h-8 text-poke-yellow" />
                    </div>
                    <span className="font-semibold text-sm text-slate-200">Fotoğraf Seç veya Kamerayı Aç</span>
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
                  onClick={() => setShowCropper(true)}
                  className="absolute top-3 right-3 py-1.5 px-3 bg-slate-900/90 hover:bg-poke-yellow hover:text-slate-950 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all active:scale-95"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>Kırp / Odakla</span>
                </button>
              )}
            </div>

            {/* İsim Girişi */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-bold text-slate-300 tracking-wide uppercase">
                Açılışta Söylenecek İsim (Opsiyonel)
              </label>
              <input
                id="name"
                type="text"
                maxLength={30}
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Örn: Caner, Hoca, Pikachu..."
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-poke-yellow text-sm font-medium text-white placeholder-slate-500 transition-all"
              />
            </div>

            {/* Tema Seçici */}
            <ThemeSelector
              selectedTheme={selectedTheme}
              onSelectTheme={setSelectedTheme}
            />

            {/* Üret Butonu */}
            <button
              type="submit"
              disabled={!selectedFile}
              className={`w-full py-4 rounded-2xl font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all ${
                !selectedFile
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-poke-red via-red-600 to-amber-500 hover:brightness-110 text-white shadow-red-900/40 active:scale-[0.98]'
              }`}
            >
              <Sparkles className="w-5 h-5 text-poke-yellow" />
              <span>Videoyu Oluştur</span>
            </button>
          </form>
        ) : (
          /* Video Sonuç Ekranı */
          <div className="flex flex-col items-center gap-4">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 flex items-center justify-center">
              <video
                src={videoBlobUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 w-full">
              <a
                href={videoBlobUrl}
                download={`whos_that_${(personName || 'pykemon').toLowerCase().replace(/\s+/g, '_')}.mp4`}
                className="py-3.5 px-4 bg-poke-yellow hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>İndir</span>
              </a>

              <button
                onClick={handleShare}
                className="py-3.5 px-4 bg-poke-blue hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Paylaş</span>
              </button>
            </div>

            <button
              onClick={resetAll}
              className="w-full py-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition-all border border-slate-700 active:scale-98"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Yeni Video Hazırla</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center py-3 text-[11px] text-slate-500 font-medium">
        Who is That Pykemon • Asynchronous AI Task Queue Powered PWA
      </footer>
    </div>
  );
}
