import React from 'react';
import { Type, Radio } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { Translations } from '../i18n/translations';

export type FontStyleId = 'solid' | 'hollow' | 'arcade' | 'sans';

interface LiveBadgePreviewProps {
  personName: string;
  selectedTheme: string;
  fontStyle: FontStyleId;
  onSelectFontStyle: (style: FontStyleId) => void;
  t: Translations;
}

export const LiveBadgePreview: React.FC<LiveBadgePreviewProps> = ({
  personName,
  selectedTheme,
  fontStyle,
  onSelectFontStyle,
  t,
}) => {
  const displayName = (personName.trim() || t.pykemon).toUpperCase();

  const fontOptions = [
    { id: 'solid' as FontStyleId, name: t.fontSolid, fontClass: 'font-pokemon' },
    { id: 'hollow' as FontStyleId, name: t.fontHollow, fontClass: 'font-hollow' },
    { id: 'arcade' as FontStyleId, name: t.fontArcade, fontClass: 'font-arcade' },
    { id: 'sans' as FontStyleId, name: t.fontModern, fontClass: 'font-sans' },
  ];

  const getThemeBadgeStyle = () => {
    switch (selectedTheme) {
      case 'gold':
        return {
          strokeClass: 'text-gold-stroke',
          textColor: 'text-yellow-400',
          badgeBg: 'bg-[#2A1805] border-amber-600/70',
        };
      case 'neon':
        return {
          strokeClass: 'text-neon-stroke',
          textColor: 'text-cyan-300',
          badgeBg: 'bg-[#180A26] border-fuchsia-600/70',
        };
      default: // classic
        return {
          strokeClass: 'text-poke-stroke-sm sm:text-poke-stroke',
          textColor: 'text-poke-yellow',
          badgeBg: 'bg-[#0E2042] border-blue-600/70',
        };
    }
  };

  const currentThemeStyle = getThemeBadgeStyle();

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-poke-yellow" />
          <span>{t.livePreviewTitle}</span>
        </label>
        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
          <Radio className="w-3 h-3 text-red-500 animate-pulse" />
          <span>LIVE STAGE</span>
        </div>
      </div>

      {/* Live Badge Preview Card (Tactile Broadcast Lower-Third) */}
      <div
        className={`relative w-full py-3.5 px-4 rounded-xl border ${currentThemeStyle.badgeBg} flex flex-col items-center justify-center overflow-hidden transition-colors shadow-inner`}
      >
        <span className="text-[10px] tracking-widest text-slate-300 uppercase font-bold mb-0.5 opacity-80">
          {t.livePreviewAnnounce}
        </span>

        <div
          className={`text-base sm:text-xl tracking-wide font-black ${currentThemeStyle.textColor} ${currentThemeStyle.strokeClass} ${
            fontStyle === 'arcade'
              ? 'font-arcade text-xs sm:text-sm leading-relaxed tracking-tighter'
              : fontStyle === 'hollow'
              ? 'font-hollow tracking-wider'
              : fontStyle === 'solid'
              ? 'font-pokemon tracking-wider'
              : 'font-sans'
          } text-center break-all transition-all duration-150`}
        >
          {t.revealPrefix} {displayName}!
        </div>
      </div>

      {/* Font Style Switcher: Tactile Segmented Controls */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 rounded-lg border border-slate-700/60 dark:border-slate-800 light:border-slate-300">
        {fontOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              soundEffects.playClickSound();
              onSelectFontStyle(opt.id);
            }}
            className={`py-1.5 px-2 rounded text-[10px] font-bold transition-all text-center ${
              fontStyle === opt.id
                ? 'bg-poke-yellow text-slate-950 shadow-sm font-black'
                : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-100'
            } focus-visible:outline-2 focus-visible:outline-poke-yellow`}
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  );
};
