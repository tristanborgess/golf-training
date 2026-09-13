"use client";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import type { Mesh, MeshBasicMaterial } from "three";
import type { Club, Preferences } from "@/lib/golf";
import { pressureAt } from "@/lib/swing";
import { CameraRig } from "./camera-rig";
import { type Colors, Golfer } from "./golfer";
import type { Player } from "./player-store";

function CanvasDescription({ label }: { label: string }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.domElement.setAttribute("role", "img");
    gl.domElement.setAttribute("aria-label", label);
  }, [gl, label]);
  return null;
}
function Ground({
  player,
  hand,
  overlays,
  colors,
  feet,
}: {
  feet: Float32Array;
  player: Player;
  hand: string;
  overlays: Preferences["overlays"];
  colors: Colors;
}) {
  const lead = useRef<Mesh>(null),
    trail = useRef<Mesh>(null),
    mirror = hand === "left" ? -1 : 1;
  useFrame(() => {
    const p = pressureAt(player.getState().spec, player.getState().t);
    if (lead.current)
      lead.current.position.set(feet[0] * mirror, 0.003, feet[2]);
    if (trail.current)
      trail.current.position.set(feet[3] * mirror, 0.003, feet[5]);
    if (lead.current)
      (lead.current.material as MeshBasicMaterial).opacity = overlays.pressure
        ? p.leadFoot * 0.7
        : 0;
    if (trail.current)
      (trail.current.material as MeshBasicMaterial).opacity = overlays.pressure
        ? p.trailFoot * 0.7
        : 0;
  });
  return (
    <group scale={[mirror, 1, 1]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
        <circleGeometry args={[1.15, 64]} />
        <meshBasicMaterial color={colors.ground} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.6]}>
        <planeGeometry args={[2, 0.009]} />
        <meshBasicMaterial color={colors.blue} />
      </mesh>
      <mesh position={[-0.1, 0.025, 0.6]}>
        <sphereGeometry args={[0.025, 16, 12]} />
        <meshStandardMaterial color={colors.signal} />
      </mesh>
      {[lead, trail].map((ref, i) => (
        <mesh
          key={i === 0 ? "lead" : "trail"}
          ref={ref}
          position={[i === 0 ? -0.2 : 0.2, 0.003, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial
            color={colors.signal}
            transparent
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
export default function SwingCanvas(props: {
  player: Player;
  club: Club;
  hand: string;
  overlays: Preferences["overlays"];
  colors: Colors;
  look: Preferences["look"] | null;
  reduced: boolean;
  onOrbit: () => void;
  onReady: (name: string, duration: number) => void;
  label: string;
  onFailure: () => void;
}) {
  const [dpr, setDpr] = useState(1.5);
  const [feet] = useState(() => new Float32Array(6));
  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      camera={{ position: [0, 1.05, 3.7], fov: 42 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      role="img"
      aria-label={props.label}
      onCreated={({ gl }) => {
        gl.domElement.setAttribute("aria-label", props.label);
        gl.domElement.addEventListener("webglcontextlost", props.onFailure, {
          once: true,
        });
      }}
    >
      <CanvasDescription label={props.label} />
      <hemisphereLight args={["#fffef8", "#778778", 2]} />
      <directionalLight position={[3, 4, 3]} intensity={2.5} />
      <directionalLight position={[-3, 2, -2]} intensity={2} />
      <Suspense fallback={null}>
        <Golfer {...props} feet={feet} />
        <Ground {...props} feet={feet} />
      </Suspense>
      <CameraRig {...props} />
      <AdaptiveDpr pixelated />
      <PerformanceMonitor onDecline={() => setDpr(1.25)} />
    </Canvas>
  );
}
