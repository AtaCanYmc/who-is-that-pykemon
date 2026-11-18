import React from 'react';
import { Tv, Sparkles, Zap, Flame } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { Translations } from '../i18n/translations';

export interface ThemeOption {
  id: string;
  channel: string;
  name: string;
  badge: string;
  description: string;
  channelColor: string;
  icon: React.ElementType;
}

interface ThemeSelectorProps {
  selectedTheme: string;
  onSelectTheme: (themeId: string) => void;
  t: Translations;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onSelectTheme,
  t,
}) => {
  const themeOptions: ThemeOption[] = [
    {
      id: 'classic',
      channel: 'CH-01',
      name: t.themeClassicTitle,
      badge: '1997 RETRO',
      description: t.themeClassicDesc,
      channelColor: 'border-blue-500 text-blue-400 bg-blue-500/10',
      icon: Sparkles,
    },
    {
      id: 'gold',
      channel: 'CH-02',
      name: t.themeGoldTitle,
      badge: 'GEN-2 GOLD',
      description: t.themeGoldDesc,
      channelColor: 'border-amber-500 text-amber-400 bg-amber-500/10',
      icon: Flame,
    },
    {
      id: 'neon',
      channel: 'CH-03',
      name: t.themeNeonTitle,
      badge: 'SYNTHWAVE',
      description: t.themeNeonDesc,
      channelColor: 'border-fuchsia-500 text-fuchsia-400 bg-fuchsia-500/10',
      icon: Zap,
    },
  ];

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
          <Tv className="w-3.5 h-3.5 text-poke-yellow" />
          <span>{t.themeSectionTitle}</span>
        </label>
        <span className="text-[10px] text-slate-500 font-mono tracking-widest">{t.themeCount}</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 w-full">
        {themeOptions.map((theme) => {
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
              className={`btn-tactile relative p-3 rounded-xl flex flex-col items-center text-center transition-colors border ${
                isSelected
                  ? 'bg-slate-800/90 dark:bg-slate-800/90 light:bg-slate-100 border-poke-yellow shadow-md ring-1 ring-poke-yellow/40'
                  : 'bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border-slate-700/80 dark:border-slate-800 light:border-slate-300 hover:border-slate-600 light:hover:border-slate-400 text-slate-400'
              } focus-visible:outline-2 focus-visible:outline-poke-yellow`}
            >
              {isSelected && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-poke-yellow text-slate-950 text-[8px] font-black rounded tracking-widest uppercase">
                  ACTIVE
                </div>
              )}

              <div className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border mb-2 ${theme.channelColor}`}>
                {theme.channel}
              </div>

              <div className="p-2 rounded-lg bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-100 text-slate-200 dark:text-slate-200 light:text-slate-800 mb-1.5">
                <Icon className="w-4 h-4" />
              </div>

              <span className="text-xs font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 leading-tight">
                {theme.name}
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 light:text-slate-500 mt-0.5">
                {theme.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
