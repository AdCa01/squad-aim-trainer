"use client";

import { useState, useCallback, useEffect } from "react";
import type { LeaderboardEntry, GameStats } from "@/lib/game-types";

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const submitScore = useCallback(
    async (stats: GameStats) => {
      try {
        const res = await fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stats),
        });
        if (res.ok) {
          const data = await res.json();
          // Refresh leaderboard after submit
          await fetchLeaderboard();
          return data.updated ?? true;
        }
      } catch {
        // ignore
      }
      return false;
    },
    [fetchLeaderboard]
  );

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { entries, loading, fetchLeaderboard, submitScore };
}
