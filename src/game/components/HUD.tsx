"use client";

import type { GameState } from "../game-types";

interface HUDProps {
  state: GameState;
}

export default function HUD({ state }: HUDProps) {
  const total = state.hits + state.misses;
  const accuracy = total > 0 ? Math.round((state.hits / total) * 100) : 0;
  const timeDisplay = Math.max(0, Math.ceil(state.timeLeft));

  return (
    <div className="absolute inset-x-0 top-0 z-20 pointer-events-none p-6">
      <div className="flex items-start justify-between max-w-5xl mx-auto">
        {/* Timer */}
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-5 py-3 border border-white/10">
          <div className="font-display text-xs tracking-widest uppercase text-white/40 mb-1">
            Time
          </div>
          <div className={`font-display text-3xl font-bold tabular-nums ${timeDisplay <= 10 ? "text-red-500" : "text-white"}`}>
            {timeDisplay}s
          </div>
        </div>

        {/* Score */}
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-5 py-3 border border-saf-blue/30 text-center">
          <div className="font-display text-xs tracking-widest uppercase text-saf-blue/60 mb-1">
            Score
          </div>
          <div className="font-display text-3xl font-bold text-saf-blue tabular-nums">
            {state.score.toLocaleString()}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-5 py-3 border border-white/10">
          <div className="flex gap-6">
            <div>
              <div className="font-display text-xs tracking-widest uppercase text-white/40 mb-1">
                Hits
              </div>
              <div className="font-display text-xl font-bold text-green-400 tabular-nums">
                {state.hits}
              </div>
            </div>
            <div>
              <div className="font-display text-xs tracking-widest uppercase text-white/40 mb-1">
                Miss
              </div>
              <div className="font-display text-xl font-bold text-red-400 tabular-nums">
                {state.misses}
              </div>
            </div>
            <div>
              <div className="font-display text-xs tracking-widest uppercase text-white/40 mb-1">
                Acc
              </div>
              <div className="font-display text-xl font-bold text-white tabular-nums">
                {accuracy}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
