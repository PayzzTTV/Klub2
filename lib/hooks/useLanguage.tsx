'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import translations, { Language, Translations } from '@/lib/i18n/translations';

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr',
  setLang: () => {},
  t: translations.fr as Translations,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('fr');

  useEffect(() => {
    const stored = localStorage.getItem('klub_lang') as Language | null;
    if (stored === 'fr' || stored === 'en') setLangState(stored);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('klub_lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] as Translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
