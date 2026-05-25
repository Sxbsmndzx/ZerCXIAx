import { createContext, useContext, useEffect, ReactNode, useState } from "react";
import { SettingsInputTheme, useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import { useAuth } from "./AuthContext";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyAccentColor(hsl: string) {
  document.documentElement.style.setProperty("--onyx-accent", hsl);
  document.documentElement.style.setProperty("--primary", hsl);
  document.documentElement.style.setProperty("--ring", hsl);
  document.documentElement.style.setProperty("--sidebar-primary", hsl);
  document.documentElement.style.setProperty("--sidebar-ring", hsl);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>("dark");
  const [accentColor, setAccentColorState] = useState<string>("187 100% 42%");
  const [language, setLanguageState] = useState<string>("es");

  const { data: settings } = useGetSettings({
    query: {
      enabled: !!user,
      queryKey: ["/api/settings"],
    },
  });

  const updateSettings = useUpdateSettings();

  useEffect(() => {
    if (settings) {
      setThemeState(settings.theme as Theme);
      setAccentColorState(settings.accentColor);
      setLanguageState(settings.language);
      applyAccentColor(settings.accentColor);
    }
  }, [settings]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    applyAccentColor(accentColor);
  }, [accentColor]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (user) {
      updateSettings.mutate({ data: { theme: newTheme as SettingsInputTheme } });
    }
  };

  const setAccentColor = (newColor: string) => {
    setAccentColorState(newColor);
    if (user) {
      updateSettings.mutate({ data: { accentColor: newColor } });
    }
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    if (user) {
      updateSettings.mutate({ data: { language: lang } });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor, language, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
