"use client";

import { useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useGameState } from "@/hooks/useGameState";
import { usePointerLock } from "@/hooks/usePointerLock";
import { useSettings } from "@/hooks/useSettings";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useIsMobile } from "@/hooks/useIsMobile";
import Crosshair from "@/components/aim-trainer/Crosshair";
import HUD from "@/components/aim-trainer/HUD";
import StartScreen from "@/components/aim-trainer/StartScreen";
import EndScreen from "@/components/aim-trainer/EndScreen";
import MobileBlocker from "@/components/aim-trainer/MobileBlocker";
import Navbar from "@/components/layout/Navbar";

const GameCanvas = dynamic(() => import("@/components/aim-trainer/GameCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-saf-dark flex items-center justify-center">
      <div className="inline-block w-8 h-8 border-2 border-saf-blue/30 border-t-saf-blue rounded-full animate-spin" />
    </div>
  ),
});

export default function AimTrainerPage() {
  const isMobile = useIsMobile();
  const { state, dispatch, getStats } = useGameState();
  const { isLocked, requestLock, exitLock } = usePointerLock();
  const { settings, updateSettings, resetDefaults, loaded } = useSettings();
  const { entries, submitScore } = useLeaderboard();
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer
  useEffect(() => {
    if (state.phase === "countdown") {
      countdownInterval.current = setInterval(() => {
        dispatch({ type: "COUNTDOWN_TICK" });
      }, 1000);
      return () => {
        if (countdownInterval.current) clearInterval(countdownInterval.current);
      };
    }
  }, [state.phase, dispatch]);

  // Auto-lock pointer when game starts playing
  const lockRequested = useRef(false);
  useEffect(() => {
    if (state.phase === "playing" && !isLocked && !lockRequested.current) {
      lockRequested.current = true;
      const timer = setTimeout(() => {
        const canvas = document.querySelector("canvas");
        if (canvas) requestLock(canvas);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [state.phase, isLocked, requestLock]);

  // Detect pointer lock lost during gameplay (ESC) -> reset to menu
  const prevLocked = useRef(false);
  useEffect(() => {
    if (state.phase === "playing" && prevLocked.current && !isLocked) {
      dispatch({ type: "RESET" });
    }
    prevLocked.current = isLocked;
  }, [isLocked, state.phase, dispatch]);

  // Reset tracking when going back to idle
  useEffect(() => {
    if (state.phase === "idle") {
      lockRequested.current = false;
    }
  }, [state.phase]);

  // Unlock pointer when game ends
  useEffect(() => {
    if (state.phase === "ended") {
      exitLock();
    }
  }, [state.phase, exitLock]);

  // Keyboard shortcuts: Enter = start game
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (state.phase === "idle") {
        if (e.code === "Enter") {
          e.preventDefault();
          dispatch({ type: "START_COUNTDOWN" });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.phase, dispatch]);

  const handleSubmitScore = useCallback(
    async () => {
      const stats = getStats();
      return submitScore(stats);
    },
    [getStats, submitScore]
  );

  if (isMobile) return <MobileBlocker />;
  if (!loaded) return null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-saf-dark">
      {/* Navbar - only visible when not playing */}
      {state.phase === "idle" && <Navbar />}

      {/* 3D Canvas */}
      <GameCanvas
        state={state}
        dispatch={dispatch}
        settings={settings}
        isLocked={isLocked}
        onRequestLock={requestLock}
      />

      {/* Crosshair overlay */}
      {state.phase === "playing" && isLocked && <Crosshair />}

      {/* HUD */}
      {state.phase === "playing" && <HUD state={state} />}

      {/* Start screen */}
      <StartScreen
        state={state}
        dispatch={dispatch}
        topScores={entries}
        settings={settings}
        onUpdateSettings={updateSettings}
        onResetSettings={resetDefaults}
      />

      {/* End screen */}
      {state.phase === "ended" && (
        <EndScreen
          stats={getStats()}
          dispatch={dispatch}
          onSubmit={handleSubmitScore}
        />
      )}
    </div>
  );
}
