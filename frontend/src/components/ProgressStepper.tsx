import React, { useEffect } from 'react';
import { Scissors, Moon, Film, CheckCircle2, HelpCircle } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface ProgressStepperProps {
  progress: number;
  message: string;
  status: string;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  progress,
  message,
  status,
}) => {
  const steps = [
    {
      key: 'REMOVING_BACKGROUND',
      label: 'Arka Plan',
      icon: Scissors,
      threshold: 30,
    },
    {
      key: 'GENERATING_SILHOUETTE',
      label: 'Siluet',
      icon: Moon,
      threshold: 60,
    },
    {
      key: 'RENDERING_VIDEO',
      label: 'Video & Ses',
      icon: Film,
      threshold: 85,
    },
    {
      key: 'COMPLETED',
      label: 'Hazır',
      icon: CheckCircle2,
      threshold: 100,
    },
  ];

  // Play wobble sound on active transitions
  useEffect(() => {
    if (progress > 5 && progress < 100) {
      soundEffects.playWobbleSound();
    } else if (progress === 100 || status === 'COMPLETED') {
      soundEffects.playSuccessFanfare();
    }
  }, [status, progress]);

  return (
    <div className="w-full flex flex-col items-center py-6">
      {/* Neo-Retro Animated Mystery Frame */}
      <div className="relative w-28 h-28 mb-5 flex items-center justify-center">
        {/* Glowing Background Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-poke-red via-poke-yellow to-poke-blue blur-xl opacity-40 animate-pulse"></div>

        {/* Animated Pokéball Container */}
        <div className="relative z-10 w-20 h-20 rounded-full bg-slate-950 border-4 border-slate-900 shadow-2xl flex items-center justify-center overflow-hidden animate-pokeball-wobble">
          {/* Top Half (Red) */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-poke-red to-red-600 border-b-2 border-slate-950 flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-white/30 animate-ping" />
          </div>

          {/* Bottom Half (White) */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-200 to-white"></div>

          {/* Center Button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-4 border-slate-950 flex items-center justify-center shadow-lg">
            <div className="w-2 h-2 rounded-full bg-poke-yellow animate-pulse-fast"></div>
          </div>
        </div>

        {/* Floating Mystery Badges */}
        <div className="absolute -top-1 -right-1 bg-poke-yellow text-slate-950 font-arcade text-[9px] px-1.5 py-0.5 rounded-full border border-slate-950 shadow-md animate-bounce">
          ?
        </div>
      </div>

      {/* Status Header */}
      <div className="text-center mb-4">
        <h4 className="text-sm font-arcade tracking-wider text-poke-yellow">
          {progress < 100 ? 'WHO IS THAT PYKEMON?' : 'PYKEMON YAKALANDI!'}
        </h4>
        <p className="text-xs text-slate-300 mt-1 font-medium max-w-xs">{message}</p>
      </div>

      {/* Retro Percentage Display */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-arcade text-slate-400 uppercase">İlerleme:</span>
        <span className="text-xs font-arcade text-poke-yellow">{progress}%</span>
      </div>

      {/* Glowing Neo Progress Bar */}
      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden mb-6 border border-slate-800 shadow-inner p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-poke-red via-poke-yellow to-green-400 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(255,203,5,0.6)]"
          style={{ width: `${Math.max(6, progress)}%` }}
        ></div>
      </div>

      {/* Steps Milestone Badges */}
      <div className="grid grid-cols-4 gap-1.5 w-full">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = progress >= step.threshold || status === 'COMPLETED';
          const isCurrent = progress < step.threshold && progress >= step.threshold - 30;

          return (
            <div
              key={step.key}
              className={`flex flex-col items-center p-2.5 rounded-2xl border transition-all duration-300 ${
                isDone
                  ? 'bg-poke-yellow/15 border-poke-yellow/40 text-poke-yellow shadow-[0_0_10px_rgba(255,203,5,0.15)]'
                  : isCurrent
                  ? 'bg-slate-800/90 border-slate-600 text-white animate-pulse'
                  : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4 mb-1.5" />
              <span className="text-[10px] font-bold text-center leading-tight">
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
