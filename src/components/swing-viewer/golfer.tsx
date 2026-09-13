"use client";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import {
  AnimationMixer,
  BoxGeometry,
  CylinderGeometry,
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  SkinnedMesh,
  SphereGeometry,
  Vector3,
} from "three";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import type { Club, Preferences } from "@/lib/golf";
import { pressureAt } from "@/lib/swing";
import { heatmapMaterial } from "./heatmap-material";
import type { Player } from "./player-store";
import { SkeletonOverlay } from "./skeleton-overlay";
export type Colors = {
  body: string;
  rim: string;
  mid: string;
  signal: string;
  green: string;
  blue: string;
  ground: string;
};
/**
 * Shared scene anchors in world space, written by the golfer and read by the ground:
 * 0–2 lead foot, 3–5 trail foot, 6–8 ball (clubhead at address), 9–11 forward direction.
 */
export const ANCHORS = 12;
const bone = (root: Object3D, name: string) =>
  root.getObjectByName(`mixamorig${name}`) ??
  root.getObjectByName(`mixamorig:${name}`) ??
  null;
/** Whole-club length from butt to sole, metres. */
const clubLength: Record<Club["system"], number> = {
  driver: 1.15,
  wood: 1.08,
  iron: 0.95,
  putter: 0.88,
};
function buildClub(club: Club, color: string) {
  const material = new MeshStandardMaterial({ color, roughness: 0.45 });
  const group = new Group();
  const shaft = new Mesh(new CylinderGeometry(0.007, 0.01, 1, 10), material);
  group.add(shaft);
  const wood = club.system === "driver" || club.system === "wood";
  const head = new Mesh(
    wood
      ? new SphereGeometry(club.system === "driver" ? 0.055 : 0.045, 14, 10)
      : new BoxGeometry(
          0.022,
          club.system === "putter" ? 0.03 : 0.045,
          club.system === "putter" ? 0.11 : 0.085,
        ),
    material,
  );
  if (wood) head.scale.set(1, 0.6, 1.25);
  group.add(head);
  const dispose = () => {
    shaft.geometry.dispose();
    head.geometry.dispose();
    material.dispose();
  };
  /** Lay the shaft along -Y from the butt at the origin and seat the head at its sole. */
  const fit = (length: number) => {
    shaft.scale.set(1, length, 1);
    shaft.position.y = -length / 2;
    head.position.set(0, -length + (wood ? 0.03 : 0.02), wood ? 0.05 : 0.04);
  };
  fit(clubLength[club.system]);
  return { group, fit, dispose, head };
}
export function Golfer({
  player,
  anchors,
  club,
  hand,
  overlays,
  colors,
  onReady,
}: {
  anchors: Float32Array;
  player: Player;
  club: Club;
  hand: string;
  overlays: Preferences["overlays"];
  colors: Colors;
  onReady: (name: string, duration: number) => void;
}) {
  "use no memo";
  const gltf = useGLTF("/models/golfer.glb", false, false, (loader) =>
    loader.setMeshoptDecoder(MeshoptDecoder),
  );
  const [model] = useState(() => clone(gltf.scene));
  const runtime = useRef<{
    materials: ReturnType<typeof heatmapMaterial>[];
    duration: number;
    point: Vector3;
  } | null>(null);
  const invalidate = useThree((s) => s.invalidate);
  const clip = player.getState().spec.clip;
  useEffect(
    () => () => {
      model.traverse((o) => {
        if (o instanceof SkinnedMesh) {
          o.geometry.dispose();
          o.skeleton.dispose();
        }
      });
      useGLTF.clear("/models/golfer.glb");
    },
    [model],
  );

  useEffect(() => {
    const materials: ReturnType<typeof heatmapMaterial>[] = [];
    model.traverse((o) => {
      if (o instanceof SkinnedMesh) {
        const m = heatmapMaterial(o);
        o.material = m.material;
        materials.push(m);
        o.frustumCulled = false;
      }
    });
    const mixer = new AnimationMixer(model),
      animation = gltf.animations.find((a) => a.name === clip);
    if (!animation) throw new Error(`Missing animation ${clip}`);
    const action = mixer.clipAction(animation);
    action.play();
    action.paused = true;
    const pose = (t: number) => {
      action.time = t * animation.duration;
      mixer.update(0);
      model.updateMatrixWorld(true);
    };

    /*
     * The club rides on the lead hand. Its transform is solved once at address:
     * the grip runs from the top (lead) palm through the lower (trail) palm, the
     * shaft is long enough for the sole to meet the ground, and the toe points
     * away from the golfer. Every later frame inherits the hand's motion, so the
     * face opens and closes with the wrists as it does in the capture.
     */
    const leadHand = bone(model, "LeftHand"),
      leadPalm = bone(model, "LeftHandMiddle1") ?? leadHand,
      trailHand = bone(model, "RightHand"),
      trailPalm = bone(model, "RightHandMiddle1") ?? trailHand,
      hips = bone(model, "Hips"),
      leadFoot = bone(model, "LeftFoot"),
      trailFoot = bone(model, "RightFoot");
    const golfClub = buildClub(club, colors.blue);
    const modelInverse = new Matrix4(),
      local = (o: Object3D, out: Vector3) =>
        out.setFromMatrixPosition(o.matrixWorld).applyMatrix4(modelInverse);
    const forward = new Vector3(0, 0, 1),
      ballLocal = new Vector3();
    if (
      leadHand &&
      leadPalm &&
      trailHand &&
      trailPalm &&
      hips &&
      leadFoot &&
      trailFoot
    ) {
      model.parent?.updateWorldMatrix(true, false);
      pose(0);
      modelInverse.copy(model.matrixWorld).invert();
      const a = new Vector3(),
        b = new Vector3();
      const top = local(leadHand, a)
        .add(local(leadPalm, b))
        .multiplyScalar(0.5)
        .clone();
      const low = local(trailHand, a)
        .add(local(trailPalm, b))
        .multiplyScalar(0.5)
        .clone();
      const grip = top.clone().add(low).multiplyScalar(0.5);
      const hip = local(hips, a).clone();
      const feet = local(leadFoot, a)
        .add(local(trailFoot, b))
        .multiplyScalar(0.5)
        .clone();
      /* The golfer faces the ball: hands hang forward of the hips at address. */
      forward.copy(grip).sub(hip).setY(0).normalize();
      if (forward.lengthSq() < 0.5) forward.set(0, 0, 1);
      /*
       * Solve the address geometry instead of trusting finger bones: the shaft
       * passes through the hands, the sole rests on the ground, and the head sits
       * on the forward line through the stance centre. That is where the ball is.
       */
      const nominal = clubLength[club.system],
        below = nominal - 0.16; // hands cover the top of the grip
      const h = new Vector3(feet.x - grip.x, 0, feet.z - grip.z),
        hf = h.dot(forward),
        reach = below * below - grip.y * grip.y - h.lengthSq();
      const d = reach + hf * hf >= 0 ? -hf + Math.sqrt(reach + hf * hf) : -hf;
      const head = new Vector3(
        feet.x + forward.x * d,
        0.02,
        feet.z + forward.z * d,
      );
      const down = head.clone().sub(grip).normalize();
      if (down.y > -0.3) down.set(0, -1, 0);
      const butt = top.clone().addScaledVector(down, -0.06);
      golfClub.fit(head.distanceTo(butt));
      const toe = forward
        .clone()
        .addScaledVector(down, -forward.dot(down))
        .normalize();
      const up = down.clone().negate(),
        side = new Vector3().crossVectors(up, toe);
      const clubMatrix = new Matrix4()
        .makeBasis(side, up, toe)
        .setPosition(butt);
      const handInverse = modelInverse
        .clone()
        .multiply(leadHand.matrixWorld)
        .invert();
      golfClub.group.matrix.multiplyMatrices(handInverse, clubMatrix);
      golfClub.group.matrix.decompose(
        golfClub.group.position,
        golfClub.group.quaternion,
        golfClub.group.scale,
      );
      leadHand.add(golfClub.group);
      model.updateMatrixWorld(true);
      ballLocal.copy(head).setY(0);
    } else {
      model.add(golfClub.group);
    }
    const point = new Vector3();
    const ball = ballLocal.clone().applyMatrix4(model.matrixWorld);
    ball.toArray(anchors, 6);
    forward
      .clone()
      .transformDirection(model.matrixWorld)
      .setY(0)
      .normalize()
      .toArray(anchors, 9);
    runtime.current = { materials, duration: animation.duration, point };
    const update = () => {
      pose(player.getState().t);
      invalidate();
    };
    update();
    onReady(animation.name, animation.duration);
    const unsubscribe = player.onFrame(update);
    return () => {
      unsubscribe();
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      materials.forEach((m) => {
        m.material.dispose();
      });
      golfClub.group.removeFromParent();
      golfClub.dispose();
    };
  }, [
    model,
    gltf.animations,
    clip,
    club,
    colors.blue,
    invalidate,
    onReady,
    player,
    anchors,
  ]);
  useFrame((_, delta) => {
    const r = runtime.current;
    if (!r) return;
    /* One clock: the render loop advances the swing, so every drawn frame is a fresh pose. */
    player.advance(Math.min(delta, 0.1), r.duration);
    for (const [i, side] of ["Left", "Right"].entries()) {
      bone(model, `${side}Foot`)?.getWorldPosition(r.point);
      r.point.toArray(anchors, i * 3);
    }
    const state = player.getState();
    for (const m of r.materials)
      m.update(
        pressureAt(state.spec, state.t),
        overlays.pressure,
        overlays.skeleton,
        colors,
      );
  });
  useEffect(() => {
    invalidate();
  }, [invalidate]);
  return (
    <>
      <group scale={[hand === "left" ? -1 : 1, 1, 1]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          <primitive object={model} />
        </group>
      </group>
      <SkeletonOverlay
        model={model}
        visible={overlays.skeleton}
        color={colors.green}
      />
    </>
  );
}
