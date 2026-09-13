"use client";
import { CameraControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Preferences } from "@/lib/golf";
/**
 * Presets follow the golfer, not the world axes. `forward` is the direction the
 * golfer faces at address (toward the ball); the target line is perpendicular
 * to it, on the lead side. Angles are camera-controls azimuth/polar pairs.
 */
export function cameraPreset(
  look: Preferences["look"],
  forward: [number, number],
  hand: string,
): [number, number] {
  const [fx, fz] = forward;
  const facing = Math.atan2(fx, fz);
  const level = Math.PI / 2.12;
  switch (look) {
    case "front":
      return [facing, level];
    case "back":
      return [facing + Math.PI, level];
    case "side":
      /* Down the line: behind the golfer on the target line, looking at the target. */
      return [facing - (hand === "left" ? -1 : 1) * (Math.PI / 2), level];
    case "top":
      return [facing, Math.PI / 22];
  }
}
export function CameraRig({
  look,
  hand,
  reduced,
  anchors,
  ready,
  onOrbit,
}: {
  look: Preferences["look"] | null;
  hand: string;
  reduced: boolean;
  anchors: Float32Array;
  ready: boolean;
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
    const forward: [number, number] =
      anchors[9] || anchors[11] ? [anchors[9], anchors[11]] : [0, 1];
    const [a, p] = cameraPreset(look, forward, hand);
    void c.setTarget(0, 0.95, 0, false);
    void c.rotateTo(a, p, !reduced && ready);
  }, [look, hand, reduced, anchors, ready]);
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
