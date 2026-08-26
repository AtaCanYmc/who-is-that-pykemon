import React from 'react';
import { Type, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

export type FontStyleId = 'arcade' | 'display' | 'sans';

interface LiveBadgePreviewProps {
  personName: string;
  selectedTheme: string;
  fontStyle: FontStyleId;
  onSelectFontStyle: (style: FontStyleId) => void;
}

export const FONT_STYLES = [
  { id: 'display' as FontStyleId, name: 'Anime Solid', fontClass: 'font-display' },
  { id: 'arcade' as FontStyleId, name: '8-Bit Arcade', fontClass: 'font-arcade' },
  { id: 'sans' as FontStyleId, name: 'Modern Pro', fontClass: 'font-sans' },
];

export const LiveBadgePreview: React.FC<LiveBadgePreviewProps> = ({
  personName,
  selectedTheme,
  fontStyle,
  onSelectFontStyle,
}) => {
  const displayName = (personName.trim() || 'PYKEMON').toUpperCase();

  const getThemeBadgeStyle = () => {
    switch (selectedTheme) {
      case 'gold':
        return {
          strokeClass: 'text-gold-stroke',
          textColor: 'text-yellow-400',
          badgeBg: 'from-amber-950/80 via-yellow-900/60 to-red-950/80',
          badgeBorder: 'border-yellow-500/50',
          glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
        };
      case 'neon':
        return {
          strokeClass: 'text-neon-stroke',
          textColor: 'text-cyan-300',
          badgeBg: 'from-fuchsia-950/80 via-purple-900/60 to-cyan-950/80',
          badgeBorder: 'border-cyan-400/50',
          glow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]',
        };
      default: // classic
        return {
          strokeClass: 'text-poke-stroke-sm sm:text-poke-stroke',
          textColor: 'text-poke-yellow',
          badgeBg: 'from-blue-950/80 via-indigo-900/60 to-red-950/80',
          badgeBorder: 'border-poke-blue/60',
          glow: 'shadow-[0_0_25px_rgba(42,117,187,0.4)]',
        };
    }
  };

  const currentThemeStyle = getThemeBadgeStyle();

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-poke-yellow" />
          <span>Canlı Yazı & Stil Önizlemesi</span>
        </label>
        <span className="text-[10px] text-slate-500 font-mono">CANLI ÖNİZLEME</span>
      </div>

      {/* Live Badge Preview Card */}
      <div
        className={`relative w-full py-4 px-4 rounded-2xl bg-gradient-to-r ${currentThemeStyle.badgeBg} border ${currentThemeStyle.badgeBorder} ${currentThemeStyle.glow} flex flex-col items-center justify-center overflow-hidden transition-all duration-300`}
      >
        <div className="absolute top-0 right-0 p-2 opacity-20">
          <Sparkles className="w-12 h-12 text-white" />
        </div>

        <span className="text-[10px] tracking-widest text-slate-300 uppercase font-black mb-0.5 opacity-80">
          AÇILIŞ ANINDA SÖYLENECEK METİN
        </span>

        <div
          className={`text-lg sm:text-2xl tracking-wide font-black ${currentThemeStyle.textColor} ${currentThemeStyle.strokeClass} ${
            fontStyle === 'arcade'
              ? 'font-arcade text-xs sm:text-base leading-relaxed tracking-tighter'
              : fontStyle === 'display'
              ? 'font-display tracking-wider'
              : 'font-sans'
          } text-center break-all transition-all duration-200`}
        >
          IT&apos;S {displayName}!
        </div>
      </div>

      {/* Font Style Switcher */}
      <div className="grid grid-cols-3 gap-1.5 w-full">
        {FONT_STYLES.map((style) => {
          const isSelected = fontStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => {
                soundEffects.playClickSound();
                onSelectFontStyle(style.id);
              }}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                isSelected
                  ? 'bg-poke-yellow text-slate-950 border-poke-yellow shadow-md scale-[1.02]'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {style.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
