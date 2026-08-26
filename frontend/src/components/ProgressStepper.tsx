import React from 'react';
import { Scissors, Moon, Film, CheckCircle2 } from 'lucide-react';

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

  return (
    <div className="w-full flex flex-col items-center py-4">
      {/* Animated Pokéball Spinner */}
      <div className="relative w-16 h-16 mb-4">
        <div className="w-16 h-16 rounded-full bg-poke-red border-4 border-slate-950 shadow-2xl relative overflow-hidden animate-bounce">
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white border-t-4 border-slate-950"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-4 border-slate-950 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center mb-4">
        <h4 className="text-sm font-black text-poke-yellow tracking-wide">
          {progress < 100 ? 'PYKEMON OLUŞTURULUYOR' : 'HAZIR!'}
        </h4>
        <p className="text-xs text-slate-300 mt-0.5">{message}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-5 border border-slate-700 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-poke-red via-poke-yellow to-green-400 transition-all duration-300 ease-out"
          style={{ width: `${Math.max(5, progress)}%` }}
        ></div>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-4 gap-1 w-full">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = progress >= step.threshold || status === 'COMPLETED';
          const isCurrent = progress < step.threshold && progress >= step.threshold - 30;

          return (
            <div
              key={step.key}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                isDone
                  ? 'bg-poke-yellow/10 text-poke-yellow'
                  : isCurrent
                  ? 'bg-slate-800 text-white animate-pulse'
                  : 'text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
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
