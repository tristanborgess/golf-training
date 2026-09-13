"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import {
  Bone,
  type Group,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  type Object3D,
  SphereGeometry,
  Vector3,
} from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { boneKey } from "./heatmap-material";

const names = new Set([
  "Hips",
  "Spine",
  "Spine1",
  "Spine2",
  "Neck",
  "Head",
  "LeftShoulder",
  "LeftArm",
  "LeftForeArm",
  "LeftHand",
  "RightShoulder",
  "RightArm",
  "RightForeArm",
  "RightHand",
  "LeftUpLeg",
  "LeftLeg",
  "LeftFoot",
  "LeftToeBase",
  "RightUpLeg",
  "RightLeg",
  "RightFoot",
  "RightToeBase",
]);
export function SkeletonOverlay({
  model,
  visible,
  color,
}: {
  model: Object3D;
  visible: boolean;
  color: string;
}) {
  const group = useRef<Group>(null),
    size = useThree((s) => s.size);
  const data = useRef<{
    bones: Bone[];
    positions: Float32Array;
    lines: LineSegments2;
    joints: InstancedMesh;
    point: Vector3;
    matrix: Matrix4;
  } | null>(null);
  useEffect(() => {
    const bones: Bone[] = [];
    model.traverse((o) => {
      if (
        o instanceof Bone &&
        names.has(boneKey(o.name)) &&
        o.parent instanceof Bone
      )
        bones.push(o);
    });
    const positions = new Float32Array(bones.length * 6),
      geometry = new LineSegmentsGeometry();
    geometry.setPositions(positions);
    const material = new LineMaterial({
      color,
      linewidth: 3,
      depthTest: false,
    });
    material.resolution.set(size.width, size.height);
    const lines = new LineSegments2(geometry, material);
    lines.frustumCulled = false;
    lines.renderOrder = 3;
    const joints = new InstancedMesh(
      new SphereGeometry(0.016, 8, 6),
      new MeshBasicMaterial({ color, depthTest: false }),
      bones.length,
    );
    joints.frustumCulled = false;
    joints.renderOrder = 4;
    group.current?.add(lines, joints);
    data.current = {
      bones,
      positions,
      lines,
      joints,
      point: new Vector3(),
      matrix: new Matrix4(),
    };
    return () => {
      lines.removeFromParent();
      joints.removeFromParent();
      geometry.dispose();
      material.dispose();
      joints.geometry.dispose();
      (joints.material as MeshBasicMaterial).dispose();
    };
  }, [model, color, size.width, size.height]);
  useFrame(() => {
    const d = data.current;
    if (!d || !visible) return;
    model.updateMatrixWorld(true);
    d.bones.forEach((b, i) => {
      b.getWorldPosition(d.point);
      d.point.toArray(d.positions, i * 6);
      d.matrix.makeTranslation(d.point);
      d.joints.setMatrixAt(i, d.matrix);
      b.parent?.getWorldPosition(d.point);
      d.point.toArray(d.positions, i * 6 + 3);
    });
    d.lines.geometry.setPositions(d.positions);
    d.joints.instanceMatrix.needsUpdate = true;
  });
  return <group ref={group} visible={visible} />;
}
