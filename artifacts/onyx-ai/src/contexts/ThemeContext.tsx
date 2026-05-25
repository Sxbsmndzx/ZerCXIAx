import { createContext, useContext, useEffect, ReactNode, useState } from "react";
import { SettingsInputTheme, useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import { useAuth } from "./AuthContext";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>("dark");
  const [accentColor, setAccentColorState] = useState<string>("#00BCD4");
  
  const { data: settings } = useGetSettings({
    query: {
      enabled: !!user,
      queryKey: ["/api/settings"]
    }
  });

  const updateSettings = useUpdateSettings();

  useEffect(() => {
    if (settings) {
      setThemeState(settings.theme as Theme);
      setAccentColorState(settings.accentColor);
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

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor }}>
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
