export type GamePhase = "idle" | "countdown" | "playing" | "ended";

export interface Target {
  id: string;
  position: [number, number, number];
  radius: number;
  speed: number;
  direction: [number, number, number];
  spawnTime: number;
}

export interface GameState {
  phase: GamePhase;
  countdown: number;
  timeLeft: number;
  score: number;
  hits: number;
  misses: number;
  targets: Target[];
  reactionTimes: number[];
  lastTargetSpawnTime: number;
}

export interface GameStats {
  score: number;
  hits: number;
  misses: number;
  accuracy: number;
  avgReactionTime: number;
  bestReactionTime: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string | null;
  score: number;
  hits: number;
  misses: number;
  accuracy: number;
  avgReactionTime: number;
  bestReactionTime: number;
  date: string;
}

export interface GameSettings {
  sensitivity: number;
  fov: number;
  dpiReference: number;
}

export type GameAction =
  | { type: "START_COUNTDOWN" }
  | { type: "COUNTDOWN_TICK" }
  | { type: "START_GAME" }
  | { type: "TICK"; delta: number }
  | { type: "SPAWN_TARGET"; target: Target }
  | { type: "HIT_TARGET"; targetId: string; reactionTime: number }
  | { type: "MISS" }
  | { type: "REMOVE_TARGET"; targetId: string }
  | { type: "END_GAME" }
  | { type: "RESET" };
