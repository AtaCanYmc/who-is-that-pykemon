import React from 'react';
import { Sparkles, Flame, Zap } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

export interface ThemeOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  accentGradient: string;
  activeBorder: string;
  activeGlow: string;
  icon: React.ElementType;
}

interface ThemeSelectorProps {
  selectedTheme: string;
  onSelectTheme: (themeId: string) => void;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'classic',
    name: 'Kanto Klasik',
    badge: '1997 RETRO',
    description: 'Mavi & sarı anime geçişi',
    accentGradient: 'from-blue-600 via-indigo-600 to-poke-blue',
    activeBorder: 'border-poke-blue',
    activeGlow: 'shadow-[0_0_15px_rgba(42,117,187,0.5)]',
    icon: Sparkles,
  },
  {
    id: 'gold',
    name: 'Johto Altın',
    badge: 'GEN-2 GOLD',
    description: 'Nostaljik altın & kızıl',
    accentGradient: 'from-amber-600 via-yellow-600 to-red-600',
    activeBorder: 'border-yellow-500',
    activeGlow: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]',
    icon: Flame,
  },
  {
    id: 'neon',
    name: 'Cyber Neon',
    badge: 'SYNTHWAVE',
    description: 'Fütüristik neon elektrik',
    accentGradient: 'from-fuchsia-600 via-purple-600 to-cyan-500',
    activeBorder: 'border-cyan-400',
    activeGlow: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]',
    icon: Zap,
  },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onSelectTheme,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-300 tracking-wider uppercase">
          Pokémon Şablon Teması
        </label>
        <span className="text-[10px] text-slate-500 font-mono">3 ŞABLON</span>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full">
        {THEME_OPTIONS.map((theme) => {
          const Icon = theme.icon;
          const isSelected = selectedTheme === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => {
                soundEffects.playClickSound();
                onSelectTheme(theme.id);
              }}
              className={`relative p-3 rounded-2xl flex flex-col items-center text-center transition-all duration-200 border ${
                isSelected
                  ? `bg-slate-800/90 ${theme.activeBorder} ${theme.activeGlow} ring-1 ring-white/20 scale-[1.03]`
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-400'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-poke-yellow text-slate-950 text-[8px] font-black rounded-full shadow-sm tracking-tighter">
                  SEÇİLDİ
                </div>
              )}

              <div
                className={`p-2.5 rounded-xl bg-gradient-to-br ${theme.accentGradient} text-white mb-2 shadow-md`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white leading-tight">
                {theme.name}
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5 leading-tight line-clamp-1">
                {theme.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
