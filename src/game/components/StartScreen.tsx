"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSession, signIn } from "next-auth/react";
import type { GameState, GameAction } from "../game-types";
import type { GameSettings } from "../game-types";
import type { LeaderboardEntry } from "../game-types";
import Link from "next/link";
import SettingsPanel from "./SettingsPanel";

interface StartScreenProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  topScores: LeaderboardEntry[];
  settings: GameSettings;
  onUpdateSettings: (partial: Partial<GameSettings>) => void;
  onResetSettings: () => void;
}

export default function StartScreen({
  state,
  dispatch,
  topScores,
  settings,
  onUpdateSettings,
  onResetSettings,
}: StartScreenProps) {
  const { data: session } = useSession();

  if (state.phase !== "idle" && state.phase !== "countdown") return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {state.phase === "countdown" ? (
          <motion.div
            key="countdown"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="font-display text-9xl font-bold text-saf-blue glow-blue"
          >
            {state.countdown === 0 ? "GO!" : state.countdown}
          </motion.div>
        ) : (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center max-w-3xl w-full px-4 max-h-[90vh] overflow-y-auto"
          >
            <h1 className="font-display text-5xl font-bold mb-2">
              AIM <span className="text-saf-blue">TRAINER</span>
            </h1>
            <p className="text-white/40 font-display text-sm tracking-widest uppercase mb-6">
              Echauffez-vous avant de nous rejoindre !
            </p>

            <div className="flex gap-6 items-start mb-6">
              {/* Left: Leaderboard */}
              <div className="flex-1">
                {topScores.length > 0 && (
                  <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                    <h3 className="font-display text-xs tracking-widest uppercase text-saf-blue/60 mb-3">
                      Leaderboard ({topScores.length})
                    </h3>
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                      {topScores.map((entry, i) => (
                        <div
                          key={entry.userId}
                          className={`flex items-center justify-between text-sm gap-3 px-2 py-1 rounded ${i < 3 ? "bg-white/5" : ""}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`font-display font-bold w-6 shrink-0 text-right ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-white/30"}`}>
                              {i + 1}
                            </span>
                            {entry.avatar ? (
                              <Image
                                src={entry.avatar}
                                alt=""
                                width={20}
                                height={20}
                                className="rounded-full shrink-0"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-white/10 shrink-0" />
                            )}
                            <span className="text-white/80 truncate text-xs">{entry.name}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-white/30 tabular-nums text-[10px] hidden sm:block">
                              {entry.accuracy}%
                            </span>
                            <span className={`font-display font-bold tabular-nums w-14 text-right text-xs ${i === 0 ? "text-yellow-400" : "text-white/70"}`}>
                              {entry.score.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Auth message */}
                {!session?.user && (
                  <div className="mt-4 bg-white/5 rounded-lg border border-white/10 p-4 text-center">
                    <p className="text-white/40 text-sm mb-3">
                      Connectez-vous pour enregistrer votre score
                    </p>
                    <button
                      onClick={() => signIn("discord")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] font-display text-sm tracking-wider uppercase rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                      </svg>
                      Discord
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Settings panel inline */}
              <div className="flex-1 bg-white/5 rounded-lg border border-white/10 p-4">
                <h3 className="font-display text-xs tracking-widest uppercase text-saf-blue/60 mb-4">
                  Settings
                </h3>
                <SettingsPanel
                  settings={settings}
                  onUpdate={onUpdateSettings}
                  onReset={onResetSettings}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => dispatch({ type: "START_COUNTDOWN" })}
                className="group relative inline-flex items-center gap-3 px-10 py-4 bg-saf-blue font-display text-lg font-semibold tracking-wider uppercase rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(47,103,178,0.4)]"
              >
                <span className="relative z-10">START</span>
                <kbd className="relative z-10 px-1.5 py-0.5 bg-white/20 rounded text-xs font-mono">Entree</kbd>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
              </button>
            </div>

            <Link
              href="/"
              className="text-white/40 hover:text-white text-sm font-display tracking-wider uppercase transition-colors"
            >
              Back to Home
            </Link>

            <p className="mt-4 text-white/20 text-xs">
              Le pointer lock s&apos;active automatiquement. Clic gauche pour tirer. Echap pour quitter.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
