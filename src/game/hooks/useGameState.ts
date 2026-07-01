"use client";

import { useReducer, useCallback } from "react";
import type { GameState, GameAction, GameStats } from "../game-types";
import {
  GAME_DURATION,
  COUNTDOWN_FROM,
  POINTS_PER_HIT,
  FAST_REACTION_BONUS,
  FAST_REACTION_THRESHOLD,
  getDifficultyProgress,
  getDifficultyMultiplier,
} from "../game-config";

const initialState: GameState = {
  phase: "idle",
  countdown: COUNTDOWN_FROM,
  timeLeft: GAME_DURATION,
  score: 0,
  hits: 0,
  misses: 0,
  targets: [],
  reactionTimes: [],
  lastTargetSpawnTime: 0,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_COUNTDOWN":
      return { ...initialState, phase: "countdown", countdown: COUNTDOWN_FROM };

    case "COUNTDOWN_TICK":
      if (state.countdown <= 1) {
        return { ...state, phase: "playing", countdown: 0, timeLeft: GAME_DURATION };
      }
      return { ...state, countdown: state.countdown - 1 };

    case "START_GAME":
      return { ...state, phase: "playing", timeLeft: GAME_DURATION };

    case "TICK": {
      const newTime = state.timeLeft - action.delta;
      if (newTime <= 0) {
        return { ...state, timeLeft: 0, phase: "ended" };
      }
      return { ...state, timeLeft: newTime };
    }

    case "SPAWN_TARGET":
      return {
        ...state,
        targets: [...state.targets, action.target],
        lastTargetSpawnTime: Date.now(),
      };

    case "HIT_TARGET": {
      const progress = getDifficultyProgress(state.timeLeft);
      const mult = getDifficultyMultiplier(progress);
      let points = Math.round(POINTS_PER_HIT * mult);
      if (action.reactionTime < FAST_REACTION_THRESHOLD) {
        points += FAST_REACTION_BONUS;
      }
      return {
        ...state,
        score: state.score + points,
        hits: state.hits + 1,
        targets: state.targets.filter((t) => t.id !== action.targetId),
        reactionTimes: [...state.reactionTimes, action.reactionTime],
      };
    }

    case "MISS":
      return { ...state, misses: state.misses + 1 };

    case "REMOVE_TARGET":
      return {
        ...state,
        targets: state.targets.filter((t) => t.id !== action.targetId),
      };

    case "END_GAME":
      return { ...state, phase: "ended", timeLeft: 0 };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const getStats = useCallback((): GameStats => {
    const total = state.hits + state.misses;
    const accuracy = total > 0 ? (state.hits / total) * 100 : 0;
    const avgReaction =
      state.reactionTimes.length > 0
        ? state.reactionTimes.reduce((a, b) => a + b, 0) / state.reactionTimes.length
        : 0;
    const bestReaction =
      state.reactionTimes.length > 0 ? Math.min(...state.reactionTimes) : 0;

    return {
      score: state.score,
      hits: state.hits,
      misses: state.misses,
      accuracy: Math.round(accuracy * 10) / 10,
      avgReactionTime: Math.round(avgReaction),
      bestReactionTime: Math.round(bestReaction),
    };
  }, [state.hits, state.misses, state.score, state.reactionTimes]);

  return { state, dispatch, getStats };
}
