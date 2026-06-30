"use client";

import type { GameSettings } from "@/lib/game-types";

interface SettingsPanelProps {
  settings: GameSettings;
  onUpdate: (partial: Partial<GameSettings>) => void;
  onReset: () => void;
}

export default function SettingsPanel({ settings, onUpdate, onReset }: SettingsPanelProps) {
  return (
    <div className="space-y-8">
      {/* Sensitivity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-display text-sm tracking-widest uppercase text-white/60">
            Sensitivity
          </label>
          <span className="font-display text-lg font-bold text-saf-blue tabular-nums">
            {settings.sensitivity.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.05"
          value={settings.sensitivity}
          onChange={(e) => onUpdate({ sensitivity: parseFloat(e.target.value) })}
          className="aim-slider w-full"
        />
        <div className="flex justify-between text-xs text-white/20 mt-1">
          <span>0.10</span>
          <span>3.00</span>
        </div>
      </div>

      {/* FOV */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-display text-sm tracking-widest uppercase text-white/60">
            Field of View
          </label>
          <span className="font-display text-lg font-bold text-saf-blue tabular-nums">
            {settings.fov}°
          </span>
        </div>
        <input
          type="range"
          min="60"
          max="120"
          step="1"
          value={settings.fov}
          onChange={(e) => onUpdate({ fov: parseInt(e.target.value) })}
          className="aim-slider w-full"
        />
        <div className="flex justify-between text-xs text-white/20 mt-1">
          <span>60°</span>
          <span>120°</span>
        </div>
      </div>

      {/* DPI Reference */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-display text-sm tracking-widest uppercase text-white/60">
            Mouse DPI Reference
          </label>
          <span className="font-display text-lg font-bold text-white/80 tabular-nums">
            {settings.dpiReference}
          </span>
        </div>
        <input
          type="range"
          min="200"
          max="3200"
          step="100"
          value={settings.dpiReference}
          onChange={(e) => onUpdate({ dpiReference: parseInt(e.target.value) })}
          className="aim-slider w-full"
        />
        <div className="flex justify-between text-xs text-white/20 mt-1">
          <span>200</span>
          <span>3200</span>
        </div>
      </div>

      {/* Calculated cm/360 */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="font-display text-xs tracking-widest uppercase text-white/40 mb-1">
          Estimated cm/360°
        </div>
        <div className="font-display text-2xl font-bold text-white tabular-nums">
          {((2.54 * 360) / (settings.dpiReference * settings.sensitivity * 0.002 * 360)).toFixed(1)} cm
        </div>
        <p className="text-white/30 text-xs mt-1">
          Based on your DPI and sensitivity settings
        </p>
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="w-full px-4 py-3 border border-white/10 hover:border-red-500/40 font-display text-sm tracking-wider uppercase rounded-lg transition-colors text-white/40 hover:text-red-400"
      >
        Reset to Defaults
      </button>
    </div>
  );
}
