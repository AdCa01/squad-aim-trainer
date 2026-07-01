"use client";

import { useRef, useCallback, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GameState, GameAction } from "../game-types";
import type { GameSettings } from "../game-types";
import TargetManager from "./TargetManager";
import Particles from "./Particles";

interface GameSceneProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  settings: GameSettings;
  isLocked: boolean;
}

export default function GameScene({ state, dispatch, settings, isLocked }: GameSceneProps) {
  const { camera, scene } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const raycaster = useRef(new THREE.Raycaster());

  // Set FOV
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = settings.fov;
      camera.updateProjectionMatrix();
    }
  }, [camera, settings.fov]);

  // Mouse look
  useEffect(() => {
    if (!isLocked) return;

    const onMouseMove = (e: MouseEvent) => {
      const sens = settings.sensitivity * 0.002;
      euler.current.y -= e.movementX * sens;
      euler.current.x -= e.movementY * sens;
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, [isLocked, camera, settings.sensitivity]);

  // Shoot
  const shoot = useCallback(() => {
    if (state.phase !== "playing") return;

    raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    const hit = intersects.find(
      (i) => i.object.userData.targetId
    );

    if (hit) {
      const targetId = hit.object.userData.targetId;
      const spawnTime = hit.object.userData.spawnTime;
      const reactionTime = Date.now() - spawnTime;
      dispatch({ type: "HIT_TARGET", targetId, reactionTime });
    } else {
      dispatch({ type: "MISS" });
    }
  }, [state.phase, camera, scene, dispatch]);

  useEffect(() => {
    if (!isLocked || state.phase !== "playing") return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) shoot();
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isLocked, state.phase, shoot]);

  // Game timer
  useFrame((_, delta) => {
    if (state.phase === "playing") {
      dispatch({ type: "TICK", delta });
    }
  });

  // Reset camera on game start
  useEffect(() => {
    if (state.phase === "countdown") {
      euler.current.set(0, 0, 0, "YXZ");
      camera.quaternion.setFromEuler(euler.current);
      camera.position.set(0, 0, 0);
    }
  }, [state.phase, camera]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={0.8} color="#2F67B2" />
      <pointLight position={[-10, -5, -10]} intensity={0.4} color="#4466ff" />

      {/* Arena floor grid for spatial reference */}
      <gridHelper
        args={[40, 40, "#2F67B2", "#1a1a1a"]}
        position={[0, -5, -10]}
        rotation={[0, 0, 0]}
      />

      <Particles />
      <TargetManager state={state} dispatch={dispatch} />
    </>
  );
}
