"use client";

import { useState, useCallback, useEffect } from "react";
import type { LeaderboardEntry, GameStats } from "../game-types";

/**
 * Reads the leaderboard from `endpoint` (GET) and submits new runs to
 * the same URL (POST). Defaults to `/api/leaderboard` for the standalone
 * app; hosts that expose their leaderboard under a different path pass
 * their own — team-lumen-web mounts the API at `/api/aim-trainer/
 * leaderboard`, for example.
 *
 * The GET response shape is `LeaderboardEntry[]`; the POST body is the
 * `GameStats` record produced by `useGameState().getStats()`, and the
 * response is `{ updated: boolean }`.
 */
export function useLeaderboard(endpoint: string = "/api/leaderboard") {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const submitScore = useCallback(
    async (stats: GameStats) => {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stats),
        });
        if (res.ok) {
          const data = await res.json();
          await fetchLeaderboard();
          return data.updated ?? true;
        }
      } catch {
        // ignore
      }
      return false;
    },
    [endpoint, fetchLeaderboard]
  );

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { entries, loading, fetchLeaderboard, submitScore };
}
