import { createContext, useContext, useEffect, useState } from 'react';
import { cookieStorage, CookieOptions } from '../lib/cookieStorage';
import { StorageKeys } from '../lib/storageKeys';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => cookieStorage.get(StorageKeys.THEME) || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    cookieStorage.set(StorageKeys.THEME, theme, CookieOptions.pref);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
