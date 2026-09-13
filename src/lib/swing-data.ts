import { c } from "./golf";
import type { Region } from "./swing";
export const phaseNames = [
  c("Address", "Colocación"),
  c("Takeaway", "Inicio"),
  c("Top", "Arriba"),
  c("Impact", "Impacto"),
  c("Finish", "Final"),
];
export const fullCues = [
  c(
    "Balanced and relaxed, ball in position.",
    "Equilibrado y relajado, bola en su sitio.",
  ),
  c(
    "Club, arms and chest start back together.",
    "Palo, brazos y pecho inician juntos.",
  ),
  c(
    "Chest turned, pressure into the trail side.",
    "Pecho girado, presión en el lado trasero.",
  ),
  c(
    "Pressure on the lead foot, hands ahead of the ball.",
    "Presión en el pie delantero, manos por delante de la bola.",
  ),
  c(
    "Balanced on the lead leg, chest facing the target.",
    "Equilibrado sobre la pierna delantera, pecho hacia el objetivo.",
  ),
];
export const partialTopCue = c(
  "A shorter turn; pressure stays forward.",
  "Giro más corto; la presión se mantiene adelante.",
);
export const puttCues = [
  c(
    "Eyes over the ball, arms hanging.",
    "Ojos sobre la bola, brazos colgando.",
  ),
  c("Shoulders rock the putter back.", "Los hombros llevan el putter atrás."),
  c("A brief, unhurried pause.", "Una pausa breve y sin prisa."),
  c(
    "Face square, stroke through the ball.",
    "Cara cuadrada, el golpe atraviesa la bola.",
  ),
  c(
    "Hold the finish and let the ball roll.",
    "Mantén el final y deja rodar la bola.",
  ),
];

// Authored coaching, grounded in the PGA setup/grip and TrackMan sources in golf.ts.
// These are teaching keyframes, never a measurement of a player's body.
export const leadKeyframes = {
  full: [0.5, 0.4, 0.3, 0.8, 0.95],
  chip: [0.6, 0.62, 0.65, 0.8, 0.9],
  putt: [0.5, 0.5, 0.5, 0.5, 0.5],
};
export const regionBones: Record<Region, string[]> = {
  leadFoot: ["mixamorig:LeftFoot", "mixamorig:LeftToeBase"],
  trailFoot: ["mixamorig:RightFoot", "mixamorig:RightToeBase"],
  leadLeg: ["mixamorig:LeftUpLeg", "mixamorig:LeftLeg"],
  trailLeg: ["mixamorig:RightUpLeg", "mixamorig:RightLeg"],
  pelvis: ["mixamorig:Hips"],
  torso: [
    "mixamorig:Spine",
    "mixamorig:Spine1",
    "mixamorig:Spine2",
    "mixamorig:Neck",
  ],
  leadArm: [
    "mixamorig:LeftShoulder",
    "mixamorig:LeftArm",
    "mixamorig:LeftForeArm",
    "mixamorig:LeftHand",
  ],
  trailArm: [
    "mixamorig:RightShoulder",
    "mixamorig:RightArm",
    "mixamorig:RightForeArm",
    "mixamorig:RightHand",
  ],
  head: ["mixamorig:Head"],
};

/**
 * Runtime clips. `raw` is the exported animation's full length in seconds; `trim`
 * is the window actually shown, as fractions of that length (the captures hold a
 * static finish for a long tail), and `duration` is the trimmed length. Markers are
 * fractions of the trimmed window, measured from the clubhead path: Takeaway when
 * the head first lifts, Top at its highest point, Impact where it meets the ball.
 */
const clip = (
  source: string,
  raw: number,
  trim: [number, number],
  markers: [number, number, number],
) => ({
  source,
  raw,
  trim,
  duration: raw * (trim[1] - trim[0]),
  markers: { 0: 0, 1: markers[0], 2: markers[1], 3: markers[2], 4: 1 },
});
export const clipData = {
  full: clip("golf-drive-2.fbx", 3.4, [0.03, 0.62], [0.153, 0.37, 0.525]),
  chip: clip("golf-chip-2.fbx", 58 / 30, [0, 0.7], [0.143, 0.414, 0.571]),
  putt: clip("golf-putt-3.fbx", 2.4, [0, 0.66], [0.152, 0.394, 0.606]),
};
