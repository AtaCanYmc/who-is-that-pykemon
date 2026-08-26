import React, { useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { Translations } from '../i18n/translations';

interface ProgressStepperProps {
  progress: number; // 0 to 100
  message: string;
  status: string; // QUEUED, REMOVING_BACKGROUND, GENERATING_SILHOUETTE, RENDERING_VIDEO, COMPLETED, FAILED
  t: Translations;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  progress,
  message,
  status,
  t,
}) => {
  const prevStatusRef = useRef<string>(status);

  // Play audio milestones when steps change
  useEffect(() => {
    if (prevStatusRef.current !== status) {
      if (status === 'COMPLETED') {
        soundEffects.playSuccessFanfare();
      } else if (status === 'REMOVING_BACKGROUND' || status === 'GENERATING_SILHOUETTE') {
        soundEffects.playWobbleSound();
      }
      prevStatusRef.current = status;
    }
  }, [status]);

  const steps = [
    { key: 'REMOVING_BACKGROUND', label: t.stepBg, min: 10 },
    { key: 'GENERATING_SILHOUETTE', label: t.stepSil, min: 35 },
    { key: 'RENDERING_VIDEO', label: t.stepVideo, min: 65 },
    { key: 'COMPLETED', label: t.stepReady, min: 100 },
  ];

  const isFailed = status === 'FAILED';
  const isCompleted = status === 'COMPLETED';

  // Translate progress message dynamically if matching standard status
  const getDisplayMessage = () => {
    switch (status) {
      case 'REMOVING_BACKGROUND':
        return t.progressRemovingBg;
      case 'GENERATING_SILHOUETTE':
        return t.progressGeneratingSil;
      case 'RENDERING_VIDEO':
        return t.progressRenderingVideo;
      case 'COMPLETED':
        return t.progressCompleted;
      default:
        return message || t.progressRemovingBg;
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-5 py-4">
      {/* Animated Pokéball Centerpiece */}
      <div className="relative">
        <div
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-slate-900 bg-poke-red flex items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-300 ${
            isCompleted
              ? 'ring-4 ring-poke-yellow shadow-poke-yellow/50 scale-105'
              : isFailed
              ? 'bg-red-800'
              : 'animate-pokeball-wobble shadow-red-900/60'
          }`}
        >
          {/* Top/Bottom divider */}
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-950 -translate-y-1/2 z-10"></div>
          <div className="absolute bottom-0 left-0 right-0 top-1/2 bg-white"></div>

          {/* Center Pokéball button */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border-4 border-slate-950 z-20 flex items-center justify-center shadow-inner">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                isCompleted
                  ? 'bg-green-500 animate-ping'
                  : isFailed
                  ? 'bg-red-600'
                  : 'bg-poke-yellow animate-pulse'
              }`}
            ></div>
          </div>
        </div>

        {/* Floating Mystery ? */}
        {!isCompleted && !isFailed && (
          <div className="absolute -top-1 -right-2 text-poke-yellow font-arcade text-xs animate-bounce">
            ?
          </div>
        )}
      </div>

      {/* Title & Status Message */}
      <div className="flex flex-col items-center text-center gap-1.5 px-4">
        <div className="text-xs sm:text-sm font-arcade text-poke-yellow tracking-wider flex items-center gap-2">
          {isCompleted ? (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{t.progressDoneTitle}</span>
            </>
          ) : isFailed ? (
            <>
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span className="text-red-400">HATA OLUŞTU</span>
            </>
          ) : (
            <span>{t.progressTitle}</span>
          )}
        </div>
        <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 font-medium animate-pulse max-w-xs">
          {getDisplayMessage()}
        </p>
      </div>

      {/* Progress Bar with Retro Percentage */}
      <div className="w-full max-w-md flex flex-col gap-1.5 px-2">
        <div className="flex justify-between text-[11px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-600">
          <span>{t.progressLabel}</span>
          <span className="font-bold text-poke-yellow">{Math.min(100, Math.max(5, progress))}%</span>
        </div>
        <div className="h-3 w-full bg-slate-900 dark:bg-slate-900 light:bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-800 dark:border-slate-800 light:border-slate-300 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isCompleted
                ? 'bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.6)]'
                : 'bg-gradient-to-r from-poke-red via-amber-500 to-poke-yellow animate-pulse shadow-[0_0_12px_rgba(255,203,5,0.5)]'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
          ></div>
        </div>
      </div>

      {/* Step Milestones Grid */}
      <div className="grid grid-cols-4 gap-1.5 w-full max-w-md px-1 pt-1">
        {steps.map((step) => {
          const isPassed = progress >= step.min;
          const isCurrent = progress >= step.min - 25 && progress < step.min;

          return (
            <div
              key={step.key}
              className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all ${
                isPassed
                  ? 'bg-poke-blue/20 border-poke-blue/60 text-slate-100 dark:text-slate-100 light:text-slate-900 shadow-sm'
                  : isCurrent
                  ? 'bg-poke-yellow/15 border-poke-yellow/70 text-poke-yellow animate-pulse'
                  : 'bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-100 border-slate-800/80 dark:border-slate-800 light:border-slate-300 text-slate-500 dark:text-slate-500 light:text-slate-400'
              }`}
            >
              {isPassed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-poke-yellow mb-1" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-current mb-1 flex items-center justify-center text-[8px] font-bold">
                  {step.min === 100 ? '4' : step.min === 65 ? '3' : step.min === 35 ? '2' : '1'}
                </div>
              )}
              <span className="text-[9px] font-bold tracking-tight line-clamp-1">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
