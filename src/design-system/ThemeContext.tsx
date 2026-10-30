import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeMode, AccentName, tokens } from "./tokens";

interface ThemeContextType {
  themeMode: ThemeMode;
  effectiveTheme: "dark" | "light";
  accent: AccentName;
  setThemeMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentName) => void;
  tokens: typeof tokens;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [accent, setAccent] = useState<AccentName>("indigo");
  const [systemIsDark, setSystemIsDark] = useState<boolean>(true);

  // Detect system preference
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemIsDark(mq.matches);

    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const effectiveTheme: "dark" | "light" =
    themeMode === "system" ? (systemIsDark ? "dark" : "light") : themeMode;

  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [effectiveTheme]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        effectiveTheme,
        accent,
        setThemeMode,
        setAccent,
        tokens,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
};
