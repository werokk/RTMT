// Simple theme implementation that doesn't rely on context
// This is a temporary solution to bypass the issue

type Theme = 'light' | 'dark' | 'system';

// Set a default theme
document.documentElement.classList.add('light');

// Export a dummy function to prevent import errors
export function useTheme() {
  return {
    theme: 'light' as Theme,
    setTheme: (_theme: Theme) => {}
  };
}

// Export a dummy provider to prevent import errors
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return children;
}