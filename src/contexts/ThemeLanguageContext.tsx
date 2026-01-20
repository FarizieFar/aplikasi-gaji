import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../utils/translations';

type Theme = 'light' | 'dark';

interface ThemeLanguageContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['id'], params?: Record<string, string>) => string;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export const ThemeLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguageState] = useState<Language>('id');

  // Load from storage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('timemaster_theme') as Theme;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (systemDark) {
        setTheme('dark');
    }

    const savedLang = localStorage.getItem('timemaster_lang') as Language;
    if (savedLang) setLanguageState(savedLang);
  }, []);

  // Apply theme to HTML tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('timemaster_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('timemaster_lang', lang);
  };

  // Translation Helper
  const t = (key: keyof typeof translations['id'], params?: Record<string, string>) => {
    let text = translations[language][key] || key;
    
    if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
            text = text.replace(`{${paramKey}}`, paramValue);
        });
    }
    return text;
  };

  return (
    <ThemeLanguageContext.Provider value={{ theme, toggleTheme, language, setLanguage, t }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (context === undefined) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
};