import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  // Keep React state in sync with the class already set in main.jsx
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.theme = isDark ? 'dark' : 'light';
    } catch {
      // localStorage blocked — theme just won't persist across reloads
    }
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark((prev) => !prev)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className="btn-secondary rounded-xl relative h-9 w-9 p-0! overflow-hidden"
    >
      <Sun
        className={`absolute inset-0 m-auto h-4 w-4 transition-all duration-300 ${
          isDark
            ? 'scale-0 -rotate-90 opacity-0'
            : 'scale-100 rotate-0 opacity-100'
        }`}
      />
      <Moon
        className={`absolute inset-0 m-auto h-4 w-4 transition-all duration-300 ${
          isDark
            ? 'scale-100 rotate-0 opacity-100'
            : 'scale-0 rotate-90 opacity-0'
        }`}
      />
    </button>
  );
}
