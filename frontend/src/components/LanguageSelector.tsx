import React from 'react';
import { Language } from '../i18n/translations';
import { soundEffects } from '../utils/soundEffects';

interface LanguageSelectorProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
}

const LANGUAGES: { id: Language; label: string; flag: string }[] = [
  { id: 'tr', label: 'TR', flag: '🇹🇷' },
  { id: 'en', label: 'EN', flag: '🇬🇧' },
  { id: 'fr', label: 'FR', flag: '🇫🇷' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onSelectLang,
}) => {
  return (
    <div className="flex items-center bg-slate-900/80 dark:bg-slate-900/80 light:bg-white/80 border border-slate-700/60 dark:border-slate-800 light:border-slate-300 rounded-xl p-0.5 shadow-sm">
      {LANGUAGES.map((lang) => {
        const isSelected = currentLang === lang.id;
        return (
          <button
            key={lang.id}
            type="button"
            onClick={() => {
              soundEffects.playClickSound();
              onSelectLang(lang.id);
            }}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              isSelected
                ? 'bg-poke-yellow text-slate-950 shadow-sm scale-[1.02]'
                : 'text-slate-400 hover:text-white dark:hover:text-white light:text-slate-600 light:hover:text-slate-900'
            }`}
          >
            <span>{lang.flag}</span>
            <span className="text-[10px]">{lang.label}</span>
          </button>
        );
      })}
    </div>
  );
};
