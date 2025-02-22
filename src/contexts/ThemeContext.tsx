'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Cargar preferencia al inicio
    fetch('/api/preferences')
      .then(res => res.json())
      .then(data => {
        setDarkMode(data.darkMode);
        // Aplicar el tema inmediatamente
        document.documentElement.classList.toggle('dark', data.darkMode);
      })
      .catch(() => {
        setDarkMode(false);
        document.documentElement.classList.remove('dark');
      });
  }, []);

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // Guardar en la base de datos
    await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ darkMode: newMode })
    });

    // Actualizar clase en el documento
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 