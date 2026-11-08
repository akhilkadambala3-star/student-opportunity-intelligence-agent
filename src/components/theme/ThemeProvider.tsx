"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on client mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("theme") as Theme | null;
      if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
        setThemeState(storedTheme);
      } else {
        // Default to dark for premium aesthetic
        setThemeState("dark");
      }
    } catch {
      // Storage access blocked or unavailable
    }
    setMounted(true);
  }, []);

  // Sync DOM classes whenever theme changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    const applyTheme = (targetTheme: "light" | "dark") => {
      setResolvedTheme(targetTheme);
      if (targetTheme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
        root.style.colorScheme = "light";
      }
    };

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mediaQuery.matches ? "dark" : "light");

      const listener = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? "dark" : "light");
      };

      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    } else {
      applyTheme(theme);
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("theme", newTheme);
    } catch {
      // ignore
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
