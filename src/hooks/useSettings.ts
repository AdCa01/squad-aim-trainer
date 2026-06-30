"use client";

import { useState, useCallback, useEffect } from "react";
import type { GameSettings } from "@/lib/game-types";
import { DEFAULT_SENSITIVITY, DEFAULT_FOV, DEFAULT_DPI } from "@/lib/game-config";

const STORAGE_KEY = "saf-aim-settings";

const defaults: GameSettings = {
  sensitivity: DEFAULT_SENSITIVITY,
  fov: DEFAULT_FOV,
  dpiReference: DEFAULT_DPI,
};

export function useSettings() {
  const [settings, setSettings] = useState<GameSettings>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSettings({ ...defaults, ...JSON.parse(raw) });
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const updateSettings = useCallback((partial: Partial<GameSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const resetDefaults = useCallback(() => {
    setSettings(defaults);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { settings, updateSettings, resetDefaults, loaded };
}
