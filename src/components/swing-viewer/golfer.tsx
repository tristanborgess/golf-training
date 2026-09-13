"use client";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import {
  AnimationMixer,
  BoxGeometry,
  Color,
  CylinderGeometry,
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  Quaternion,
  SkinnedMesh,
  SphereGeometry,
  Vector3,
} from "three";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { type Club, getSetup, type Preferences, type Shot } from "@/lib/golf";
import { pressureAt, timeFor } from "@/lib/swing";
import { clipData } from "@/lib/swing-data";
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
 * 0–2 lead foot, 3–5 trail foot, 6–8 ball centre, 9–11 forward direction,
 * 12–14 target direction (lead side), 15 tee height (0 when the ball is on the ground),
 * 16–18 clubhead centre for the current frame.
 */
export const ANCHORS = 19;
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
/**
 * Club geometry in the club's own frame: the butt at the origin, the shaft along -Y,
 * the toe along +Z and the face looking down +X. Sizes are real-world metres, made
 * a little chunkier than life so the head reads on a phone.
 */
function buildClub(club: Club, color: string) {
  const material = new MeshStandardMaterial({ color, roughness: 0.4 });
  const dark = new MeshStandardMaterial({
    color: new Color(color).multiplyScalar(0.7),
    roughness: 0.4,
  });
  const group = new Group();
  const shaft = new Mesh(new CylinderGeometry(0.007, 0.011, 1, 10), material);
  group.add(shaft);
  const head = new Group();
  group.add(head);
  const wood = club.system === "driver" || club.system === "wood";
  if (wood) {
    const size = club.system === "driver" ? 1 : 0.8;
    const crown = new Mesh(new SphereGeometry(0.055 * size, 18, 12), dark);
    crown.scale.set(0.95, 0.55, 1.15);
    crown.position.set(0, 0.03 * size, 0.045 * size);
    head.add(crown);
    const face = new Mesh(
      new BoxGeometry(0.012, 0.05 * size, 0.1 * size),
      material,
    );
    face.position.set(0.045 * size, 0.028 * size, 0.045 * size);
    head.add(face);
  } else if (club.system === "putter") {
    const blade = new Mesh(new BoxGeometry(0.03, 0.026, 0.115), dark);
    blade.position.set(0, 0.013, 0.045);
    head.add(blade);
    const face = new Mesh(new BoxGeometry(0.006, 0.026, 0.115), material);
    face.position.set(0.016, 0.013, 0.045);
    head.add(face);
  } else {
    const blade = new Mesh(new BoxGeometry(0.02, 0.052, 0.095), dark);
    blade.position.set(0, 0.026, 0.05);
    head.add(blade);
    const face = new Mesh(new BoxGeometry(0.006, 0.052, 0.095), material);
    face.position.set(0.012, 0.026, 0.05);
    head.add(face);
    const hosel = new Mesh(new CylinderGeometry(0.009, 0.011, 0.06, 8), dark);
    hosel.position.set(0, 0.04, 0.008);
    head.add(hosel);
  }
  const dispose = () => {
    shaft.geometry.dispose();
    head.traverse((o) => {
      if (o instanceof Mesh) o.geometry.dispose();
    });
    material.dispose();
    dark.dispose();
  };
  /** Lay the shaft along -Y from the butt and rest the sole on the club's -length plane. */
  const fit = (length: number) => {
    shaft.scale.set(1, length, 1);
    shaft.position.y = -length / 2;
    head.position.y = -length;
  };
  fit(clubLength[club.system]);
  /** Where the ball should sit: just ahead of the face centre, in club space. */
  const ballOffset = new Vector3(
    wood ? 0.075 : club.system === "putter" ? 0.045 : 0.04,
    0,
    wood ? 0.045 : 0.05,
  );
  return { group, fit, dispose, head, ballOffset };
}
export function Golfer({
  player,
  anchors,
  club,
  shot,
  hand,
  overlays,
  colors,
  onReady,
}: {
  anchors: Float32Array;
  player: Player;
  club: Club;
  shot: Shot;
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
    head: Object3D;
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
    const { trim } = clipData[clip],
      duration = animation.duration * (trim[1] - trim[0]);
    /* t runs over the trimmed window; the static tail of each capture is never shown. */
    const pose = (t: number) => {
      action.time = (trim[0] + t * (trim[1] - trim[0])) * animation.duration;
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
      target = new Vector3(1, 0, 0),
      ballLocal = new Vector3();
    const setup = getSetup(club, shot);
    const tee = club.system === "driver" ? 0.04 : 0;
    let blend: (t: number) => void = () => {};
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
      model.updateMatrixWorld(true);
      modelInverse.copy(model.matrixWorld).invert();
      const a = new Vector3(),
        b = new Vector3();
      /* Stance and ball come from the address pose. */
      pose(0);
      const addressTop = local(leadHand, a)
        .add(local(leadPalm, b))
        .multiplyScalar(0.5)
        .clone();
      const addressLow = local(trailHand, a)
        .add(local(trailPalm, b))
        .multiplyScalar(0.5)
        .clone();
      const addressGrip = addressTop
        .clone()
        .add(addressLow)
        .multiplyScalar(0.5);
      const hipAtAddress = local(hips, a).clone();
      const lead = local(leadFoot, a).clone(),
        trail = local(trailFoot, b).clone();
      const feet = lead.clone().add(trail).multiplyScalar(0.5);
      /* Target direction runs from the trail foot to the lead foot; forward is perpendicular, toward the hands. */
      target.copy(lead).sub(trail).setY(0).normalize();
      forward.copy(addressGrip).sub(hipAtAddress).setY(0);
      forward.addScaledVector(target, -forward.dot(target)).normalize();
      if (forward.lengthSq() < 0.5) forward.set(0, 0, 1);
      const stance = lead.distanceTo(trail) || 0.4;
      /*
       * Ball position per club and shot comes from the same setup data as the
       * checklist: 0.5 is stance centre, 1 the lead heel. The clubhead is solved
       * to that spot: through the hands, sole on the ground, on the forward line.
       */
      const centre = feet
        .clone()
        .addScaledVector(target, (setup.ball - 0.5) * stance)
        .setY(0);
      const nominal = clubLength[club.system],
        below = nominal - 0.16; // hands cover the top of the grip
      const h = centre.clone().sub(addressGrip).setY(0),
        hf = h.dot(forward),
        reach = below * below - addressGrip.y * addressGrip.y - h.lengthSq();
      const exact =
        reach + hf * hf >= 0 ? -hf + Math.sqrt(reach + hf * hf) : -hf;
      /* The capture is one posture for every club; keep long clubs within a believable reach of it. */
      const d = Math.min(0.72, Math.max(0.3, exact));
      const sole = centre.clone().addScaledVector(forward, d);
      /*
       * A club fixed to the lead hand must sit on the ball at address and meet it
       * again at impact. The animation's wrists differ between those two frames,
       * so the club is calibrated at both and the hand-local offset is blended
       * from one to the other across the backswing, where the club is far from
       * the ball and the change cannot be seen.
       */
      const spec = player.getState().spec;
      const calibrate = (t: number, length?: number) => {
        pose(t);
        const top = local(leadHand, a)
          .add(local(leadPalm, b))
          .multiplyScalar(0.5)
          .clone();
        const down = sole.clone().sub(top).normalize();
        if (down.y > -0.3) down.set(0, -1, 0);
        const butt = top.clone().addScaledVector(down, -0.06);
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
        const position = new Vector3(),
          quaternion = new Quaternion(),
          scale = new Vector3();
        new Matrix4()
          .multiplyMatrices(handInverse, clubMatrix)
          .decompose(position, quaternion, scale);
        return {
          position,
          quaternion,
          scale,
          length: length ?? sole.distanceTo(butt),
        };
      };
      const atAddress = calibrate(0);
      /* The hands sit higher at impact in this capture; the shaft grows a little to keep the sole down. */
      const atImpact = calibrate(timeFor(spec, 3));
      golfClub.fit(atAddress.length);
      golfClub.group.scale.copy(atAddress.scale);
      const from = timeFor(spec, 1),
        to = timeFor(spec, 2);
      blend = (t: number) => {
        const w = Math.min(
          1,
          Math.max(0, (t - from) / Math.max(1e-3, to - from)),
        );
        const k = w * w * (3 - 2 * w);
        golfClub.group.position.lerpVectors(
          atAddress.position,
          atImpact.position,
          k,
        );
        golfClub.group.quaternion.slerpQuaternions(
          atAddress.quaternion,
          atImpact.quaternion,
          k,
        );
        golfClub.fit(
          atAddress.length + (atImpact.length - atAddress.length) * k,
        );
      };
      leadHand.add(golfClub.group);
      blend(0);
      pose(0);
      /* The ball rests just ahead of the face at address. */
      ballLocal
        .copy(golfClub.ballOffset)
        .applyMatrix4(golfClub.head.matrixWorld)
        .applyMatrix4(modelInverse)
        .setY(0);
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
    target
      .clone()
      .transformDirection(model.matrixWorld)
      .setY(0)
      .normalize()
      .toArray(anchors, 12);
    anchors[15] = tee;
    runtime.current = {
      materials,
      duration,
      point,
      head: golfClub.head,
    };
    const update = () => {
      const { t } = player.getState();
      blend(t);
      pose(t);
      invalidate();
    };
    update();
    onReady(animation.name, duration);
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
    shot,
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
    r.head.getWorldPosition(r.point).toArray(anchors, 16);
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
