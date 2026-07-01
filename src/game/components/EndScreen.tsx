"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession, signIn } from "next-auth/react";
import type { GameStats, GameAction } from "../game-types";

interface EndScreenProps {
  stats: GameStats;
  dispatch: React.Dispatch<GameAction>;
  onSubmit: () => Promise<boolean>;
}

export default function EndScreen({ stats, dispatch, onSubmit }: EndScreenProps) {
  const { data: session } = useSession();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notUpdated, setNotUpdated] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const updated = await onSubmit();
    if (updated) {
      setSubmitted(true);
    } else {
      setNotUpdated(true);
    }
    setSubmitting(false);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md w-full px-4"
      >
        <h2 className="font-display text-4xl font-bold mb-2">
          GAME <span className="text-saf-blue">OVER</span>
        </h2>

        {/* Score */}
        <div className="my-6">
          <div className="font-display text-6xl font-bold text-saf-blue glow-blue tabular-nums">
            {stats.score.toLocaleString()}
          </div>
          <div className="font-display text-xs tracking-widest uppercase text-white/40 mt-1">
            Final Score
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <StatCard label="Hits" value={String(stats.hits)} color="text-green-400" />
          <StatCard label="Misses" value={String(stats.misses)} color="text-red-400" />
          <StatCard label="Accuracy" value={`${stats.accuracy}%`} color="text-white" />
          <StatCard label="Avg Reaction" value={`${stats.avgReactionTime}ms`} color="text-white" />
          <StatCard
            label="Best Reaction"
            value={stats.bestReactionTime > 0 ? `${stats.bestReactionTime}ms` : "-"}
            color="text-saf-blue"
          />
        </div>

        {/* Submit / Login */}
        {session?.user ? (
          !submitted && !notUpdated ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full px-6 py-3 bg-saf-blue font-display font-semibold tracking-wider uppercase rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:shadow-[0_0_30px_rgba(47,103,178,0.3)]"
            >
              {submitting ? "Saving..." : "Save Score"}
            </button>
          ) : submitted ? (
            <p className="text-green-400 font-display text-sm tracking-wider">
              Nouveau record !
            </p>
          ) : (
            <p className="text-white/40 font-display text-sm tracking-wider">
              Your existing score is higher — not updated.
            </p>
          )
        ) : (
          <button
            onClick={() => signIn("discord")}
            className="w-full px-6 py-3 bg-saf-blue hover:bg-saf-blue-light font-display font-semibold tracking-wider uppercase rounded-lg transition-colors"
          >
            Login to save
          </button>
        )}

        <button
          onClick={() => dispatch({ type: "RESET" })}
          className="mt-4 px-6 py-3 border border-white/10 hover:border-white/30 font-display text-sm tracking-wider uppercase rounded-lg transition-colors text-white/60 hover:text-white"
        >
          Play Again
        </button>
      </motion.div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
      <div className="font-display text-xs tracking-widest uppercase text-white/40 mb-1">{label}</div>
      <div className={`font-display text-xl font-bold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}
