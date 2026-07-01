"use client";

import { Stars } from "@react-three/drei";

export default function Particles() {
  return (
    <Stars
      radius={50}
      depth={80}
      count={2000}
      factor={3}
      saturation={0}
      fade
      speed={0.5}
    />
  );
}
