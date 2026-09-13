"use client";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import {
  AnimationMixer,
  BoxGeometry,
  CylinderGeometry,
  Group,
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
import type { Club, Preferences } from "@/lib/golf";
import { pressureAt } from "@/lib/swing";
import { heatmapMaterial } from "./heatmap-material";
import type { Player } from "./player-store";
import { SkeletonOverlay } from "./skeleton-overlay";
export type Colors = {
  body: string;
  mid: string;
  signal: string;
  green: string;
  blue: string;
  ground: string;
};
export function Golfer({
  player,
  feet,
  club,
  hand,
  overlays,
  colors,
  onReady,
}: {
  feet: Float32Array;
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
    mixer: AnimationMixer;
    materials: ReturnType<typeof heatmapMaterial>[];
    club: Object3D;
    hand: Object3D | null;
    direction: Vector3;
    quaternion: Quaternion;
  } | null>(null);
  const group = useRef<Group>(null),
    invalidate = useThree((s) => s.invalidate);
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
    const shaft = new Mesh(
      new CylinderGeometry(0.009, 0.009, 0.95, 8),
      new MeshStandardMaterial({ color: colors.blue, roughness: 0.5 }),
    );
    shaft.position.y = -0.475;
    const head = new Mesh(
      club.system === "driver" || club.system === "wood"
        ? new SphereGeometry(0.08, 12, 8)
        : new BoxGeometry(club.system === "putter" ? 0.18 : 0.12, 0.035, 0.065),
      new MeshStandardMaterial({ color: colors.blue }),
    );
    head.position.set(0.035, -0.94, 0);
    shaft.add(head);
    head.position.y = -0.465;
    // Orient from the wrist through the middle finger: stable grip in the authored rig.
    const wrist =
      model.getObjectByName("mixamorigRightHand") ??
      model.getObjectByName("mixamorig:RightHand") ??
      null;
    const tip =
      model.getObjectByName("mixamorigRightHandMiddle1") ??
      model.getObjectByName("mixamorig:RightHandMiddle1") ??
      null;
    const object = new Group();
    object.add(shaft);
    model.add(object);
    runtime.current = {
      mixer,
      materials,
      club: object,
      hand: wrist,
      direction: new Vector3(),
      quaternion: new Quaternion(),
    };
    const update = () => {
      const state = player.getState();
      action.time = state.t * animation.duration;
      mixer.update(0);
      model.updateMatrixWorld(true);
      if (wrist) {
        wrist.getWorldPosition(object.position);
        model.worldToLocal(object.position);
        if (tip) {
          const direction = model
            .worldToLocal(tip.getWorldPosition(new Vector3()))
            .sub(object.position)
            .normalize();
          object.quaternion.setFromUnitVectors(
            new Vector3(0, -1, 0),
            direction,
          );
        }
      }
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
      object.removeFromParent();
      shaft.geometry.dispose();
      shaft.material.dispose();
      head.geometry.dispose();
      head.material.dispose();
    };
  }, [
    model,
    gltf.animations,
    clip,
    club.system,
    colors.blue,
    invalidate,
    onReady,
    player,
  ]);
  useFrame(() => {
    const r = runtime.current;
    if (!r) return;
    const point = r.direction;
    for (const [i, side] of ["Left", "Right"].entries()) {
      const foot =
        model.getObjectByName(`mixamorig${side}Foot`) ??
        model.getObjectByName(`mixamorig:${side}Foot`);
      foot?.getWorldPosition(point);
      point.toArray(feet, i * 3);
    }
    for (const m of r.materials)
      m.update(
        pressureAt(player.getState().spec, player.getState().t),
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
        <group ref={group} rotation={[0, Math.PI / 2, 0]}>
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
