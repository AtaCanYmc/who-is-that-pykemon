import React from 'react';
import { Sparkles, Download, Share2, RefreshCw, Camera } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { Translations } from '../i18n/translations';

interface BottomActionBarProps {
  hasImage: boolean;
  isLoading: boolean;
  hasVideo: boolean;
  onCameraClick: () => void;
  onSubmit: () => void;
  onDownload: () => void;
  onShare: () => void;
  onReset: () => void;
  t: Translations;
}

/**
 * Mobile-First Sticky Action Bar (Hidden on Desktop 'lg' screens where desktop studio controls take over).
 */
export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  hasImage,
  isLoading,
  hasVideo,
  onCameraClick,
  onSubmit,
  onDownload,
  onShare,
  onReset,
  t,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-slate-950/90 dark:bg-slate-950/90 light:bg-white/95 backdrop-blur-2xl border-t border-slate-800/90 dark:border-slate-800/90 light:border-slate-300 flex items-center justify-center shadow-2xl safe-area-bottom">
      <div className="max-w-md w-full flex items-center gap-2">
        {!hasVideo ? (
          <>
            {!hasImage && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClickSound();
                  onCameraClick();
                }}
                className="py-3 px-3.5 rounded-2xl bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-200 text-slate-200 dark:text-slate-200 light:text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 dark:border-slate-700 light:border-slate-300 active:scale-95 transition-all shadow-md"
              >
                <Camera className="w-4 h-4 text-poke-yellow" />
                <span>{t.cameraBtn}</span>
              </button>
            )}

            <button
              type="button"
              disabled={!hasImage || isLoading}
              onClick={() => {
                soundEffects.playClickSound();
                onSubmit();
              }}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-xl ${
                !hasImage || isLoading
                  ? 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-700 dark:border-slate-700 light:border-slate-300'
                  : 'bg-gradient-to-r from-poke-red via-red-600 to-amber-500 hover:brightness-110 text-white shadow-red-900/50 active:scale-[0.98] ring-1 ring-white/20 animate-glow-pulse'
              }`}
            >
              <Sparkles className="w-4 h-4 text-poke-yellow animate-spin" />
              <span>{isLoading ? t.generatingBtn : t.generateBtn}</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                soundEffects.playClickSound();
                onReset();
              }}
              className="py-3.5 px-3 rounded-2xl bg-slate-800/90 dark:bg-slate-800/90 light:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-800 font-bold text-xs flex items-center justify-center gap-1 border border-slate-700 dark:border-slate-700 light:border-slate-300 active:scale-95 transition-all shadow-md"
              title={t.newVideoBtn}
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundEffects.playClickSound();
                onDownload();
              }}
              className="flex-1 py-3.5 px-3 rounded-2xl bg-poke-yellow hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEffects.playClickSound();
                onShare();
              }}
              className="py-3.5 px-4 rounded-2xl bg-poke-blue hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>{t.shareBtn}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
