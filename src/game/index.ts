/**
 * Barrel entry point for the aim-trainer game library.
 *
 * Consumers import from `squad-aim-trainer/game` (see the `exports` field
 * in the package's package.json). The companion CSS is at
 * `squad-aim-trainer/game/styles.css` — you must `import` it once at the
 * app root or the crosshair / slider styles will be missing.
 *
 * The `useLeaderboard` hook talks to `/api/leaderboard` by default. Pass
 * your own URL via the (still-simple) fetch inside the hook if you're
 * mounting the game at a non-default route — see the source.
 */

// Types + config first so IDE tooltips land on the primary contract.
export type {
  GameState,
  GameAction,
  GameSettings,
  GameStats,
  LeaderboardEntry,
  Target,
} from "./game-types";
export {
  DEFAULT_SENSITIVITY,
  DEFAULT_FOV,
  DEFAULT_DPI,
  SPAWN_AREA,
} from "./game-config";

// Hooks
export { useGameState } from "./hooks/useGameState";
export { usePointerLock } from "./hooks/usePointerLock";
export { useSettings } from "./hooks/useSettings";
export { useLeaderboard } from "./hooks/useLeaderboard";
export { useIsMobile } from "./hooks/useIsMobile";

// Components (default exports re-exported as named for a friendlier import).
export { default as Crosshair } from "./components/Crosshair";
export { default as EndScreen } from "./components/EndScreen";
export { default as GameCanvas } from "./components/GameCanvas";
export { default as GameScene } from "./components/GameScene";
export { default as HUD } from "./components/HUD";
export { default as MobileBlocker } from "./components/MobileBlocker";
export { default as Particles } from "./components/Particles";
export { default as SettingsPanel } from "./components/SettingsPanel";
export { default as StartScreen } from "./components/StartScreen";
export { default as TargetComponent } from "./components/Target";
export { default as TargetManager } from "./components/TargetManager";
