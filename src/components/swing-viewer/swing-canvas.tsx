"use client";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import type { Group, Mesh, MeshBasicMaterial } from "three";
import type { Club, Preferences } from "@/lib/golf";
import { pressureAt } from "@/lib/swing";
import { CameraRig } from "./camera-rig";
import { ANCHORS, type Colors, Golfer } from "./golfer";
import type { Perf } from "./perf";
import type { Player } from "./player-store";

function PerfProbe({ perf }: { perf: Perf }) {
  const gl = useThree((s) => s.gl);
  const last = useRef(0);
  useFrame(() => {
    const now = performance.now();
    if (last.current) {
      const delta = now - last.current;
      /* Ignore idle gaps: demand rendering stops the loop between interactions. */
      if (delta < 250)
        perf.frameMs = perf.frameMs ? perf.frameMs * 0.9 + delta * 0.1 : delta;
    }
    last.current = now;
    perf.frames += 1;
    perf.calls = gl.info.render.calls;
    perf.triangles = gl.info.render.triangles;
    perf.dpr = gl.getPixelRatio();
    const memory = (
      performance as Performance & { memory?: { usedJSHeapSize: number } }
    ).memory;
    perf.heapMb = memory ? Math.round(memory.usedJSHeapSize / 1048576) : null;
  });
  return null;
}
function CanvasDescription({ label }: { label: string }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.domElement.setAttribute("role", "img");
    gl.domElement.setAttribute("aria-label", label);
  }, [gl, label]);
  return null;
}
/** Ground disc, target line and ball, placed from the golfer's address pose. */
function Ground({
  player,
  hand,
  overlays,
  colors,
  anchors,
}: {
  anchors: Float32Array;
  player: Player;
  hand: string;
  overlays: Preferences["overlays"];
  colors: Colors;
}) {
  const lead = useRef<Mesh>(null),
    trail = useRef<Mesh>(null),
    ball = useRef<Mesh>(null),
    line = useRef<Group>(null),
    mirror = hand === "left" ? -1 : 1;
  useFrame(() => {
    const state = player.getState();
    const p = pressureAt(state.spec, state.t);
    if (lead.current) {
      lead.current.position.set(anchors[0] * mirror, 0.003, anchors[2]);
      (lead.current.material as MeshBasicMaterial).opacity = overlays.pressure
        ? p.leadFoot * 0.7
        : 0;
    }
    if (trail.current) {
      trail.current.position.set(anchors[3] * mirror, 0.003, anchors[5]);
      (trail.current.material as MeshBasicMaterial).opacity = overlays.pressure
        ? p.trailFoot * 0.7
        : 0;
    }
    if (ball.current && line.current && (anchors[9] || anchors[11])) {
      ball.current.position.set(anchors[6] * mirror, 0.021, anchors[8]);
      line.current.position.set(anchors[6] * mirror, 0, anchors[8]);
      /* The target line runs perpendicular to the golfer's forward direction. */
      const fx = anchors[9] * mirror,
        fz = anchors[11];
      line.current.rotation.y = Math.atan2(fx, fz);
    }
  });
  return (
    <group scale={[mirror, 1, 1]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
        <circleGeometry args={[1.25, 64]} />
        <meshBasicMaterial color={colors.ground} toneMapped={false} />
      </mesh>
      <group ref={line}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <planeGeometry args={[2.4, 0.008]} />
          <meshBasicMaterial color={colors.blue} toneMapped={false} />
        </mesh>
      </group>
      <mesh ref={ball} position={[0, 0.021, 0.6]}>
        <sphereGeometry args={[0.021, 18, 14]} />
        <meshStandardMaterial color={colors.signal} roughness={0.35} />
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
  playing: boolean;
  ready: boolean;
  onOrbit: () => void;
  onReady: (name: string, duration: number) => void;
  label: string;
  onFailure: () => void;
  perf?: Perf;
}) {
  const [dpr, setDpr] = useState(1.5);
  const [anchors] = useState(() => new Float32Array(ANCHORS));
  return (
    <Canvas
      frameloop={props.playing ? "always" : "demand"}
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
      <hemisphereLight args={["#fffef8", "#778778", 1.6]} />
      <directionalLight position={[3, 4, 3]} intensity={2.2} />
      <directionalLight position={[-3, 2, -2]} intensity={1.4} />
      <Suspense fallback={null}>
        <Golfer {...props} anchors={anchors} />
        <Ground {...props} anchors={anchors} />
      </Suspense>
      <CameraRig {...props} anchors={anchors} />
      <AdaptiveDpr pixelated />
      <PerformanceMonitor onDecline={() => setDpr(1.25)} />
      {props.perf && <PerfProbe perf={props.perf} />}
    </Canvas>
  );
}
