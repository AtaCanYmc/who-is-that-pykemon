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
 * Mobile-First Sticky Action Bar.
 * Strictly formatted to guarantee single-line button text on 320px/375px screens (Hallmark gate 49).
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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 border-t border-slate-700/80 dark:border-slate-800 light:border-slate-300 flex items-center justify-center shadow-lg safe-area-bottom">
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
                className="btn-tactile py-3 px-3 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-200 dark:text-slate-200 light:text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 dark:border-slate-700 light:border-slate-300 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-poke-yellow"
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
              className={`btn-tactile flex-1 py-3 px-3 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 whitespace-nowrap shadow-md ${
                !hasImage || isLoading
                  ? 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-700 dark:border-slate-700 light:border-slate-300'
                  : 'bg-poke-red hover:bg-red-700 text-white border border-red-500/50 cursor-pointer'
              } focus-visible:outline-2 focus-visible:outline-poke-yellow`}
            >
              <Sparkles className={`w-4 h-4 text-poke-yellow ${isLoading ? 'animate-spin' : ''}`} />
              <span className="truncate">{isLoading ? t.generatingBtn : t.generateBtn}</span>
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
              className="btn-tactile py-3 px-3 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-700 dark:border-slate-700 light:border-slate-300 focus-visible:outline-2 focus-visible:outline-poke-yellow"
              title={t.newVideoBtn}
              aria-label={t.newVideoBtn}
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundEffects.playClickSound();
                onDownload();
              }}
              className="btn-tactile flex-1 py-3 px-3 rounded-xl bg-poke-yellow hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md whitespace-nowrap focus-visible:outline-2 focus-visible:outline-slate-950"
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
              className="btn-tactile py-3 px-3.5 rounded-xl bg-poke-blue hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md whitespace-nowrap focus-visible:outline-2 focus-visible:outline-poke-yellow"
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
