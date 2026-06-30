export const GAME_DURATION = 60;
export const COUNTDOWN_FROM = 3;
export const MAX_TARGETS = 8;
export const TARGET_LIFETIME = 3000; // ms before auto-despawn

// Spawn interval decreases over time (ms)
export const SPAWN_INTERVAL_START = 1200;
export const SPAWN_INTERVAL_END = 400;

// Target size decreases over time
export const TARGET_RADIUS_START = 0.5;
export const TARGET_RADIUS_END = 0.25;

// Target speed increases over time
export const TARGET_SPEED_START = 0.5;
export const TARGET_SPEED_END = 2.5;

// Spawn area bounds
export const SPAWN_AREA = {
  xMin: -8,
  xMax: 8,
  yMin: -4,
  yMax: 4,
  zMin: -15,
  zMax: -8,
};

// Scoring
export const POINTS_PER_HIT = 100;
export const FAST_REACTION_BONUS = 50;
export const FAST_REACTION_THRESHOLD = 300; // ms

// Difficulty multiplier range (based on elapsed time)
export const DIFFICULTY_MULT_START = 1;
export const DIFFICULTY_MULT_END = 3;

// Settings defaults
export const DEFAULT_SENSITIVITY = 1.0;
export const DEFAULT_FOV = 90;
export const DEFAULT_DPI = 800;

export function getDifficultyProgress(timeLeft: number): number {
  const elapsed = GAME_DURATION - timeLeft;
  return Math.min(elapsed / GAME_DURATION, 1);
}

export function getSpawnInterval(progress: number): number {
  return SPAWN_INTERVAL_START + (SPAWN_INTERVAL_END - SPAWN_INTERVAL_START) * progress;
}

export function getTargetRadius(progress: number): number {
  return TARGET_RADIUS_START + (TARGET_RADIUS_END - TARGET_RADIUS_START) * progress;
}

export function getTargetSpeed(progress: number): number {
  return TARGET_SPEED_START + (TARGET_SPEED_END - TARGET_SPEED_START) * progress;
}

export function getDifficultyMultiplier(progress: number): number {
  return DIFFICULTY_MULT_START + (DIFFICULTY_MULT_END - DIFFICULTY_MULT_START) * progress;
}
