"use client";

import { useRef, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import type { GameState, GameAction } from "../game-types";
import type { GameSettings } from "../game-types";
import GameScene from "./GameScene";

interface GameCanvasProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  settings: GameSettings;
  isLocked: boolean;
  onRequestLock: (el: HTMLElement) => void;
}

export default function GameCanvas({
  state,
  dispatch,
  settings,
  isLocked,
  onRequestLock,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null!);

  const handleClick = useCallback(() => {
    if (!isLocked && state.phase === "playing" && containerRef.current) {
      onRequestLock(containerRef.current);
    }
  }, [isLocked, state.phase, onRequestLock]);

  // Re-lock on escape during play
  useEffect(() => {
    if (state.phase !== "playing") return;

    const onLockChange = () => {
      // Pointer lock was lost during gameplay - show click to re-lock
    };
    document.addEventListener("pointerlockchange", onLockChange);
    return () => document.removeEventListener("pointerlockchange", onLockChange);
  }, [state.phase]);

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="w-full h-full"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: settings.fov, near: 0.1, far: 100, position: [0, 0, 0] }}
        style={{ background: "#0a0a0a" }}
      >
        <GameScene
          state={state}
          dispatch={dispatch}
          settings={settings}
          isLocked={isLocked}
        />
      </Canvas>
    </div>
  );
}
