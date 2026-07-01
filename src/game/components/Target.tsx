"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { Target as TargetType } from "../game-types";
import { SPAWN_AREA } from "../game-config";

interface TargetProps {
  target: TargetType;
  onExpire: (id: string) => void;
}

export default function Target({ target, onExpire }: TargetProps) {
  const meshRef = useRef<Mesh>(null!);
  const lifetime = 3000;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const pos = meshRef.current.position;

    // Move target
    pos.x += target.direction[0] * target.speed * delta;
    pos.y += target.direction[1] * target.speed * delta;
    pos.z += target.direction[2] * target.speed * delta;

    // Bounce off bounds
    if (pos.x < SPAWN_AREA.xMin || pos.x > SPAWN_AREA.xMax) {
      target.direction[0] *= -1;
      pos.x = Math.max(SPAWN_AREA.xMin, Math.min(SPAWN_AREA.xMax, pos.x));
    }
    if (pos.y < SPAWN_AREA.yMin || pos.y > SPAWN_AREA.yMax) {
      target.direction[1] *= -1;
      pos.y = Math.max(SPAWN_AREA.yMin, Math.min(SPAWN_AREA.yMax, pos.y));
    }
    if (pos.z < SPAWN_AREA.zMax || pos.z > SPAWN_AREA.zMin) {
      target.direction[2] *= -1;
      pos.z = Math.max(SPAWN_AREA.zMax, Math.min(SPAWN_AREA.zMin, pos.z));
    }

    // Pulse animation
    const age = Date.now() - target.spawnTime;
    const pulse = 1 + Math.sin(age * 0.008) * 0.08;
    meshRef.current.scale.setScalar(pulse);

    // Auto-expire
    if (age > lifetime) {
      onExpire(target.id);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={target.position}
      userData={{ targetId: target.id, spawnTime: target.spawnTime }}
    >
      <sphereGeometry args={[target.radius, 24, 24]} />
      <meshStandardMaterial
        color="#E85D26"
        emissive="#E85D26"
        emissiveIntensity={0.8}
        roughness={0.3}
        metalness={0.2}
      />
    </mesh>
  );
}
