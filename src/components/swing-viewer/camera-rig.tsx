"use client";
import { CameraControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Preferences } from "@/lib/golf";
export const cameraPresets = {
  front: [0, Math.PI / 2.12],
  side: [-Math.PI / 2, Math.PI / 2.12],
  back: [Math.PI, Math.PI / 2.12],
  top: [0, Math.PI / 22],
} as const;
export function CameraRig({
  look,
  hand,
  reduced,
  onOrbit,
}: {
  look: Preferences["look"] | null;
  hand: string;
  reduced: boolean;
  onOrbit: () => void;
}) {
  const controls = useRef<CameraControls>(null);
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.tabIndex = 0;
    const key = (event: KeyboardEvent) => {
      const c = controls.current;
      if (!c) return;
      const arrows: Record<string, [number, number]> = {
        ArrowLeft: [-0.15, 0],
        ArrowRight: [0.15, 0],
        ArrowUp: [0, -0.15],
        ArrowDown: [0, 0.15],
      };
      if (arrows[event.key]) {
        event.preventDefault();
        onOrbit();
        void c.rotate(...arrows[event.key], false);
      }
      if (event.key === "+" || event.key === "=" || event.key === "-") {
        event.preventDefault();
        onOrbit();
        void c.dolly(event.key === "-" ? -0.25 : 0.25, false);
      }
    };
    canvas.addEventListener("keydown", key);
    return () => canvas.removeEventListener("keydown", key);
  }, [gl, onOrbit]);
  useEffect(() => {
    const c = controls.current;
    if (!c || !look) return;
    const [a, p] = cameraPresets[look];
    void c.setTarget(0, 0.95, 0, false);
    void c.rotateTo(a * (hand === "left" ? -1 : 1), p, !reduced);
  }, [look, hand, reduced]);
  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={2.5}
      maxDistance={5.5}
      smoothTime={reduced ? 0 : 0.25}
      onStart={onOrbit}
    />
  );
}
