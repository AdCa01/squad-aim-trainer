"use client";

import { useCallback, useEffect, useRef } from "react";
import type { GameState, GameAction, Target as TargetType } from "../game-types";
import {
  MAX_TARGETS,
  SPAWN_AREA,
  getDifficultyProgress,
  getSpawnInterval,
  getTargetRadius,
  getTargetSpeed,
} from "../game-config";
import Target from "./Target";

interface TargetManagerProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomDirection(): [number, number, number] {
  const x = (Math.random() - 0.5) * 2;
  const y = (Math.random() - 0.5) * 2;
  const z = (Math.random() - 0.5) * 2;
  const len = Math.sqrt(x * x + y * y + z * z) || 1;
  return [x / len, y / len, z / len];
}

export default function TargetManager({ state, dispatch }: TargetManagerProps) {
  const lastSpawn = useRef(0);

  const spawnTarget = useCallback(() => {
    const progress = getDifficultyProgress(state.timeLeft);
    const radius = getTargetRadius(progress);
    const speed = getTargetSpeed(progress);

    const target: TargetType = {
      id: crypto.randomUUID(),
      position: [
        randomRange(SPAWN_AREA.xMin, SPAWN_AREA.xMax),
        randomRange(SPAWN_AREA.yMin, SPAWN_AREA.yMax),
        randomRange(SPAWN_AREA.zMax, SPAWN_AREA.zMin),
      ],
      radius,
      speed,
      direction: randomDirection(),
      spawnTime: Date.now(),
    };

    dispatch({ type: "SPAWN_TARGET", target });
  }, [state.timeLeft, dispatch]);

  useEffect(() => {
    if (state.phase !== "playing") return;

    const progress = getDifficultyProgress(state.timeLeft);
    const interval = getSpawnInterval(progress);

    const now = Date.now();
    if (now - lastSpawn.current >= interval && state.targets.length < MAX_TARGETS) {
      lastSpawn.current = now;
      spawnTarget();
    }

    const timer = setInterval(() => {
      const p = getDifficultyProgress(state.timeLeft);
      const int = getSpawnInterval(p);
      if (state.targets.length < MAX_TARGETS) {
        lastSpawn.current = Date.now();
        spawnTarget();
      }
      return int;
    }, getSpawnInterval(progress));

    return () => clearInterval(timer);
  }, [state.phase, state.timeLeft, state.targets.length, spawnTarget]);

  const handleExpire = useCallback(
    (id: string) => {
      dispatch({ type: "REMOVE_TARGET", targetId: id });
    },
    [dispatch]
  );

  return (
    <group>
      {state.targets.map((t) => (
        <Target key={t.id} target={t} onExpire={handleExpire} />
      ))}
    </group>
  );
}
