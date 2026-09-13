import {
  Color,
  DoubleSide,
  MeshStandardMaterial,
  type SkinnedMesh,
} from "three";
import type { Pressure, Region } from "@/lib/swing";
import { regionBones } from "@/lib/swing-data";
export const boneKey = (name: string) => name.replace(/mixamorig\d*:?/i, "");
export function heatmapMaterial(mesh: SkinnedMesh) {
  const values = new Float32Array(mesh.skeleton.bones.length);
  const regions = mesh.skeleton.bones.map(
    (b) =>
      (Object.entries(regionBones).find(([, names]) =>
        names.some((n) => boneKey(n) === boneKey(b.name)),
      )?.[0] ?? null) as Region | null,
  );
  const material = new MeshStandardMaterial({
    roughness: 0.8,
    metalness: 0,
    side: DoubleSide,
  });
  const uniforms = {
    uPressure: { value: values },
    uHeatmapMix: { value: 0 },
    uHeatMid: { value: new Color() },
    uHeatHigh: { value: new Color() },
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader =
      `uniform float uPressure[${values.length}]; varying float vPressure;\n${shader.vertexShader}`.replace(
        "#include <skinning_vertex>",
        `#include <skinning_vertex>\nvPressure=dot(skinWeight,vec4(uPressure[int(skinIndex.x)],uPressure[int(skinIndex.y)],uPressure[int(skinIndex.z)],uPressure[int(skinIndex.w)]));`,
      );
    shader.fragmentShader =
      `uniform float uHeatmapMix;uniform vec3 uHeatMid;uniform vec3 uHeatHigh;varying float vPressure;\n${shader.fragmentShader}`.replace(
        "#include <color_fragment>",
        "#include <color_fragment>\nvec3 thermal=vPressure<0.5?mix(diffuseColor.rgb,uHeatMid,vPressure*2.0):mix(uHeatMid,uHeatHigh,(vPressure-0.5)*2.0);diffuseColor.rgb=mix(diffuseColor.rgb,thermal,uHeatmapMix);",
      );
  };
  return {
    material,
    update: (
      p: Pressure,
      pressure: boolean,
      skeleton: boolean,
      colors: { body: string; mid: string; signal: string },
    ) => {
      regions.forEach((r, i) => {
        values[i] = r ? p[r] : 0;
      });
      uniforms.uHeatmapMix.value = pressure ? 1 : 0;
      uniforms.uHeatMid.value.set(colors.mid);
      uniforms.uHeatHigh.value.set(colors.signal);
      material.color.set(colors.body);
      material.transparent = skeleton;
      material.opacity = skeleton ? 0.15 : 1;
      material.depthWrite = !skeleton;
    },
  };
}
