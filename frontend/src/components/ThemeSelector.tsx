import React from 'react';
import { Sparkles, Flame, Zap } from 'lucide-react';

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  borderColor: string;
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
    description: '1997 orijinal mavi/sarı anime geçişi',
    accentColor: 'from-blue-600 to-poke-blue',
    borderColor: 'border-poke-blue',
    icon: Sparkles,
  },
  {
    id: 'gold',
    name: 'Johto Altın',
    description: 'Gen-2 nostaljik altın ve kızıl şablon',
    accentColor: 'from-amber-600 to-yellow-500',
    borderColor: 'border-yellow-500',
    icon: Flame,
  },
  {
    id: 'neon',
    name: 'Cyber Neon',
    description: 'Fütüristik elektrikli synthwave şablonu',
    accentColor: 'from-fuchsia-600 to-cyan-500',
    borderColor: 'border-cyan-400',
    icon: Zap,
  },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onSelectTheme,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-bold text-slate-300 tracking-wide uppercase">
        Tema Şablonu
      </label>
      <div className="grid grid-cols-3 gap-2 w-full">
        {THEME_OPTIONS.map((theme) => {
          const Icon = theme.icon;
          const isSelected = selectedTheme === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectTheme(theme.id)}
              className={`p-2.5 rounded-2xl flex flex-col items-center text-center transition-all border ${
                isSelected
                  ? `bg-slate-800 ${theme.borderColor} shadow-lg ring-1 ring-poke-yellow scale-[1.02]`
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div
                className={`p-2 rounded-xl bg-gradient-to-br ${theme.accentColor} text-white mb-1.5 shadow`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white leading-tight">
                {theme.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
