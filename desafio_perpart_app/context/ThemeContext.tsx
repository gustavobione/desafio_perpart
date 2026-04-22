'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({ isDark: false });

/**
 * ThemeProvider: observa a classe `dark` no <html> que o GovBar do UI-GovPE
 * gerencia automaticamente. Provê `isDark` para qualquer componente filho.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () =>
      setIsDark(document.documentElement.classList.contains('dark'));

    // Verifica o estado inicial
    checkDarkMode();

    // Observa mudanças de classe no <html> (o GovBar alterna a classe `dark`)
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark }}>{children}</ThemeContext.Provider>
  );
}

/** Hook para consumir o tema atual em qualquer componente */
export const useTheme = () => useContext(ThemeContext);
