import { useState, useEffect } from 'react';

export interface AppSettings {
  showPositionsOnChart: boolean;
  successColor: string; // HSL format: "210 100% 50%"
  dangerColor: string; // HSL format: "0 84% 60%"
  lightBackground: string; // HSL format: "0 0% 100%"
  darkBackground: string; // HSL format: "240 10% 3.9%"
}

const DEFAULT_SETTINGS: AppSettings = {
  showPositionsOnChart: true,
  successColor: "210 100% 50%", // Blue
  dangerColor: "0 84% 60%", // Red
  lightBackground: "0 0% 100%",
  darkBackground: "240 10% 3.9%",
};

const SETTINGS_KEY = 'brokex-settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      
      // Apply CSS variables
      const root = document.documentElement;
      root.style.setProperty('--success', settings.successColor);
      root.style.setProperty('--danger', settings.dangerColor);
      root.style.setProperty('--background-light', settings.lightBackground);
      root.style.setProperty('--background-dark', settings.darkBackground);
      
      // Update background based on current theme
      const isDark = root.classList.contains('dark');
      if (isDark) {
        root.style.setProperty('--background', settings.darkBackground);
      } else {
        root.style.setProperty('--background', settings.lightBackground);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    updateSettings,
    resetSettings,
  };
};
