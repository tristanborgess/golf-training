"use client";

import { Maximize2, X } from "lucide-react";
import { type ReactNode, useId, useRef } from "react";
import {
  type Club,
  type Copy,
  c,
  type Direction,
  getSetup,
  type Hand,
  type Language,
  type Shot,
} from "@/lib/golf";

export type Drawing =
  | "overhead"
  | "face"
  | "line"
  | "sequence"
  | "flight"
  | "impact"
  | "grip";
export const drawingNames: Record<Drawing, Copy> = {
  overhead: c("Stance & ball", "Postura y bola"),
  face: c("Face-on", "De frente"),
  line: c("Down the line", "Desde atrás"),
  sequence: c("Swing sequence", "Secuencia"),
  flight: c("Face & path", "Cara y trayectoria"),
  impact: c("Clean contact", "Contacto limpio"),
  grip: c("Grip", "Agarre"),
};
/** Where the reader is standing for each drawing. Shown in the panel heading and inside the SVG. */
export const viewpoints: Record<Drawing, Copy> = {
  overhead: c(
    "Top view · looking down at yourself",
    "Vista superior · tú desde arriba",
  ),
  face: c("Front view · facing you", "Vista frontal · de frente a ti"),
  line: c(
    "From behind · looking at the target",
    "Desde atrás · mirando al objetivo",
  ),
  sequence: c(
    "Front view · five moments of one swing",
    "Vista frontal · cinco momentos de un swing",
  ),
  flight: c("Top view · you at the bottom", "Vista superior · tú abajo"),
  impact: c(
    "Side view · target to the right",
    "Vista lateral · objetivo a la derecha",
  ),
  grip: c(
    "Your view · looking down at the lead hand",
    "Tu vista · mirando la mano delantera",
  ),
};
const sideViewpoint = c(
  "Side view · watching the flight",
  "Vista lateral · viendo el vuelo",
);
export const phaseNames = [
  c("Address", "Colocación"),
  c("Takeaway", "Inicio"),
  c("Top", "Arriba"),
  c("Impact", "Impacto"),
  c("Finish", "Final"),
];
const fullCues = [
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
const partialTopCue = c(
  "A shorter turn; pressure stays forward.",
  "Giro más corto; la presión se mantiene adelante.",
);
const puttCues = [
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

type Props = {
  kind: Drawing;
  club: Club;
  hand: Hand;
  lang: Language;
  shot?: Shot;
  frame?: number;
  start?: Direction;
  curve?: Direction;
  fault?: string;
  grip?: number;
};
type Anchor = "start" | "middle" | "end";
type Ctx = {
  id: string;
  club: Club;
  shot: Shot;
  setup: ReturnType<typeof getSetup>;
  flip: boolean;
  lang: Language;
  text: (en: string, es: string) => string;
  /** Mirror an x coordinate for left-handers. Use for text, which must never be flipped. */
  X: (x: number) => number;
  /** Mirror a text anchor for left-handers. */
  A: (a: Anchor) => Anchor;
  mirrored: string | undefined;
};
const ink = "var(--diagram-ink)",
  green = "var(--diagram-green)",
  orange = "var(--signal)",
  blue = "var(--diagram-blue)",
  quiet = "var(--diagram-muted)",
  fill = "var(--diagram-fill)",
  paper = "var(--paper)";

export function GolfDiagram(props: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const en = props.lang === "en";
  const title = `${drawingNames[props.kind][props.lang]} · ${en ? "enlarged" : "ampliado"}`;
  return (
    <div className="diagram-view">
      <DiagramContent
        {...props}
        onEnlarge={() => dialog.current?.showModal()}
      />
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: a native dialog already closes with Escape; the click only adds backdrop dismissal */}
      <dialog
        ref={dialog}
        className="diagram-dialog"
        aria-label={title}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        <div className="dialog-heading">
          <h2>{drawingNames[props.kind][props.lang]}</h2>
          <button
            type="button"
            className="outline-button"
            onClick={() => dialog.current?.close()}
          >
            <X size={15} />
            {en ? "Close" : "Cerrar"}
          </button>
        </div>
        <DiagramContent {...props} />
      </dialog>
    </div>
  );
}

function DiagramContent({
  kind,
  club,
  hand,
  lang,
  shot = "stock",
  frame = 0,
  start = 0,
  curve = 0,
  fault,
  grip = 1,
  onEnlarge,
}: Props & { onEnlarge?: () => void }) {
  const id = useId().replace(/:/g, "");
  const setup = getSetup(club, shot);
  const flip = hand === "left";
  const text = (en: string, es: string) => (lang === "es" ? es : en);
  const ctx: Ctx = {
    id,
    club,
    shot,
    setup,
    flip,
    lang,
    text,
    X: (x) => (flip ? 640 - x : x),
    A: (a) => (!flip || a === "middle" ? a : a === "start" ? "end" : "start"),
    mirrored: flip ? "translate(640 0) scale(-1 1)" : undefined,
  };
  const sideView = kind === "flight" && (fault === "high" || fault === "low");
  const viewpoint = (sideView ? sideViewpoint : viewpoints[kind])[lang];
  const explanations: Record<Drawing, Copy> = {
    overhead: setup.position,
    face: setup.posture,
    line: c(
      "The toe line runs parallel to the target line. Arms hang with space from the body.",
      "La línea de los pies es paralela al objetivo. Los brazos cuelgan con espacio respecto al cuerpo.",
    ),
    sequence:
      club.system === "putter"
        ? c(
            "A compact putting stroke: set up, back, pause, contact, through. No full-swing weight shift.",
            "Un putt compacto: postura, atrás, pausa, contacto y adelante. Sin transferencia de peso de swing completo.",
          )
        : c(
            "Five schematic checkpoints of one swing. Your proportions and comfortable range of movement will differ.",
            "Cinco puntos de referencia esquemáticos de un swing. Tus proporciones y rango cómodo de movimiento serán distintos.",
          ),
    flight: sideView
      ? c(
          "Solid orange is the flight you reported; dashed blue is a comparison, not a prescribed height.",
          "Naranja continuo es el vuelo que reportaste; azul discontinuo es una comparación, no una altura obligatoria.",
        )
      : c(
          "Where the face points sets the start line; the curve comes from the path being left or right of the face. Geometry is illustrative, not a measurement.",
          "Hacia dónde apunta la cara marca la salida; la curva viene de que la trayectoria vaya a la izquierda o derecha de la cara. La geometría ilustra, no mide.",
        ),
    impact:
      club.system === "putter"
        ? c(
            "Strike near the center of the putter face with a level or gently rising stroke.",
            "Impacta cerca del centro de la cara con un golpe nivelado o ligeramente ascendente.",
          )
        : c(
            "Solid green is the intended arc; dashed orange shows the miss. Turf, tee and sand each need a different low point.",
            "Verde continuo es el arco buscado; naranja discontinuo muestra el fallo. Césped, tee y arena requieren puntos bajos diferentes.",
          ),
    grip: c(
      "Strength means how far the hand is rotated on the handle, not how hard you squeeze. Knuckle counts are a starting reference.",
      "Fuerte significa cuánto gira la mano sobre el mango, no cuánto aprietas. Los nudillos son solo una referencia inicial.",
    ),
  };
  const svgTitle = `${drawingNames[kind][lang]} · ${club.name[lang]} · ${text(
    flip ? "Left-handed" : "Right-handed",
    flip ? "Zurdo" : "Diestro",
  )}`;
  return (
    <figure className="technical-figure">
      <svg
        viewBox="0 0 640 360"
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
        className="golf-diagram"
      >
        <title id={`${id}-title`}>{svgTitle}</title>
        <desc id={`${id}-desc`}>{explanations[kind][lang]}</desc>
        <defs>
          <marker
            id={`${id}-arrow`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={blue} />
          </marker>
          <marker
            id={`${id}-orange`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={orange} />
          </marker>
          <pattern
            id={`${id}-sand`}
            width="9"
            height="9"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.1" fill={quiet} />
            <circle cx="6.5" cy="6" r="1.1" fill={quiet} />
          </pattern>
        </defs>
        <text x="24" y="28" className="diagram-small">
          {viewpoint.toUpperCase()}
        </text>
        {kind === "overhead" && <Overhead {...ctx} />}
        {kind === "face" && <FaceOn {...ctx} />}
        {kind === "line" && <DownTheLine {...ctx} />}
        {kind === "sequence" && <Sequence {...ctx} frame={frame} />}
        {kind === "flight" &&
          (sideView ? (
            <Trajectory {...ctx} high={fault === "high"} />
          ) : (
            <Flight {...ctx} start={start} curve={curve} />
          ))}
        {kind === "impact" &&
          (fault === "shank" || fault === "sky" ? (
            <ClubFace {...ctx} fault={fault} />
          ) : (
            <Impact {...ctx} fault={fault} />
          ))}
        {kind === "grip" && <Grip {...ctx} grip={grip} />}
      </svg>
      <figcaption>{explanations[kind][lang]}</figcaption>
      {onEnlarge && (
        <button type="button" className="diagram-expand" onClick={onEnlarge}>
          <Maximize2 size={14} />
          {text("Enlarge", "Ampliar")}
        </button>
      )}
    </figure>
  );
}

/** A label with a thin leader line from just below its first (or last) letter to a point. */
function Note({
  x,
  y,
  anchor = "start",
  color,
  small,
  to,
  children,
}: {
  x: number;
  y: number;
  anchor?: Anchor;
  color?: string;
  small?: boolean;
  to?: [number, number];
  children: ReactNode;
}) {
  const ox = anchor === "end" ? x - 2 : anchor === "middle" ? x : x + 2;
  return (
    <>
      {to && (
        <path
          d={`M ${ox} ${y + 5} L ${to[0]} ${to[1]}`}
          stroke={quiet}
          strokeWidth="1.2"
          fill="none"
        />
      )}
      <text
        x={x}
        y={y}
        textAnchor={anchor}
        fill={color}
        className={small ? "diagram-small" : undefined}
      >
        {children}
      </text>
    </>
  );
}

/** "TARGET →" in the top-right corner, mirrored for left-handers when asked. */
function TargetArrow({
  id,
  X,
  A,
  text,
  y = 44,
  mirror = true,
}: Ctx & { y?: number; mirror?: boolean }) {
  const fx = mirror ? X : (x: number) => x,
    fa = mirror ? A : (a: Anchor) => a;
  const x1 = fx(482),
    x2 = fx(566);
  return (
    <>
      <path
        d={`M ${x1} ${y} H ${x2}`}
        stroke={blue}
        strokeWidth="2"
        markerEnd={`url(#${id}-arrow)`}
      />
      <text
        x={fx(566)}
        y={y - 10}
        textAnchor={fa("end")}
        fill={blue}
        className="diagram-small"
      >
        {text("TARGET", "OBJETIVO")}
      </text>
    </>
  );
}

function Flag({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <path d={`M ${x} ${y} V ${y - 28}`} stroke={color} strokeWidth="2" />
      <path d={`M ${x} ${y - 28} l 17 5 l -17 5 z`} fill={color} />
    </g>
  );
}

function Overhead({ id, setup, flip, X, A, text, mirrored }: Ctx) {
  const edge = 120 * setup.width;
  const ball = 320 + (setup.ball - 0.5) * 260 * setup.width;
  const hx = 330;
  const widthWord =
    setup.width > 1.1
      ? text("WIDER THAN SHOULDERS", "MÁS ANCHO QUE LOS HOMBROS")
      : setup.width >= 1
        ? text("SHOULDER WIDTH", "ANCHO DE HOMBROS")
        : setup.width >= 0.85
          ? text("JUST INSIDE SHOULDERS", "ALGO MENOS QUE LOS HOMBROS")
          : text("NARROW STANCE", "POSTURA ESTRECHA");
  const ballWord =
    setup.ball > 0.85
      ? text("BALL · INSIDE LEAD HEEL", "BOLA · TALÓN DELANTERO")
      : setup.ball > 0.65
        ? text("BALL · FORWARD", "BOLA · ADELANTE")
        : setup.ball > 0.5
          ? text("BALL · SLIGHTLY FORWARD", "BOLA · ALGO ADELANTE")
          : setup.ball === 0.5
            ? text("BALL · CENTER", "BOLA · CENTRO")
            : text("BALL · A LITTLE BACK", "BOLA · ALGO ATRÁS");
  const targetWord = text("TARGET LINE", "LÍNEA DEL OBJETIVO");
  return (
    <>
      <g transform={mirrored}>
        <rect
          x="256"
          y="58"
          width="128"
          height="26"
          rx="13"
          fill={fill}
          stroke={ink}
          strokeWidth="2"
        />
        <circle
          cx="320"
          cy="71"
          r="18"
          fill={paper}
          stroke={ink}
          strokeWidth="2"
        />
        <path
          d={`M 266 84 L ${hx} 172 M 374 84 L ${hx} 172`}
          stroke={ink}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <rect
          x={320 - edge - 19}
          y="106"
          width="38"
          height="76"
          rx="18"
          fill={fill}
          stroke={ink}
          strokeWidth="2"
          transform={`rotate(-6 ${320 - edge} 144)`}
        />
        <rect
          x={320 + edge - 19}
          y="106"
          width="38"
          height="76"
          rx="18"
          fill={fill}
          stroke={green}
          strokeWidth="2.5"
          transform={`rotate(20 ${320 + edge} 144)`}
        />
        <path d="M 80 182 H 560" stroke={quiet} strokeDasharray="4 6" />
        <path
          d={`M ${320 - edge} 198 V 210 M ${320 - edge} 204 H ${320 + edge} M ${320 + edge} 198 V 210`}
          stroke={ink}
          strokeWidth="1.2"
          fill="none"
        />
        <path d="M 320 192 V 304" stroke={quiet} strokeDasharray="3 5" />
        <path
          d="M 70 262 H 570"
          stroke={blue}
          strokeWidth="2"
          markerEnd={`url(#${id}-arrow)`}
        />
        <path
          d={`M ${hx} 172 L ${ball} 244`}
          stroke={ink}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <rect x={ball - 11} y="243" width="22" height="8" rx="2" fill={ink} />
        <circle
          cx={ball}
          cy="262"
          r="9"
          fill={orange}
          stroke={paper}
          strokeWidth="3"
        />
      </g>
      <text x={X(320 + edge)} y="98" textAnchor="middle" fill={green}>
        {text("LEAD FOOT", "PIE DELANTERO")}
      </text>
      <text x={X(320 - edge)} y="98" textAnchor="middle">
        {text("TRAIL FOOT", "PIE TRASERO")}
      </text>
      <text x={X(562)} y="196" textAnchor={A("end")} className="diagram-small">
        {text("TOE LINE", "LÍNEA DE LOS PIES")}
      </text>
      <text
        x={X(320 - edge - 12)}
        y="208"
        textAnchor={A("end")}
        className="diagram-small"
      >
        {widthWord}
      </text>
      <text
        x={X(70)}
        y="246"
        textAnchor={A("start")}
        fill={blue}
        className="diagram-small"
      >
        {flip ? `← ${targetWord}` : `${targetWord} →`}
      </text>
      <text
        x={X(ball - 15)}
        y="282"
        textAnchor={A("end")}
        fill={orange}
        className="diagram-small"
      >
        {ballWord}
      </text>
      <text x="320" y="322" textAnchor="middle" className="diagram-small">
        {text("CENTER OF STANCE", "CENTRO DE LA POSTURA")}
      </text>
    </>
  );
}

function FaceOn(ctx: Ctx) {
  const { club, setup, X, A, text, mirrored } = ctx;
  const f = 70 * setup.width;
  const driver = club.system === "driver";
  const tilt = driver ? -10 : 0;
  const ballX = 320 + (setup.ball - 0.5) * 2 * f * 0.9;
  const hx = driver ? 322 : 326;
  const kneeX = 30 + (f - 30) * 0.7;
  const lead = setup.leadPressure,
    trail = 100 - lead;
  const bar = (cx: number, pct: number, color: string) => (
    <>
      <rect
        x={cx - 35}
        y="312"
        width="70"
        height="6"
        rx="3"
        fill={quiet}
        opacity="0.45"
      />
      <rect
        x={cx - 35}
        y="312"
        width={(70 * pct) / 100}
        height="6"
        rx="3"
        fill={color}
      />
    </>
  );
  return (
    <>
      <g transform={mirrored} strokeLinecap="round" strokeLinejoin="round">
        <path d="M 100 296 H 540" stroke={quiet} />
        {bar(320 - f, trail, ink)}
        {bar(320 + f, lead, green)}
        <path
          d={`M 296 188 L ${320 - kneeX} 244 L ${320 - f} 292 M 344 188 L ${320 + kneeX} 244 L ${320 + f} 292`}
          stroke={ink}
          strokeWidth="9"
          fill="none"
        />
        <path
          d={`M ${320 - f - 20} 294 h 40 M ${320 + f - 20} 294 h 40`}
          stroke={ink}
          strokeWidth="6"
        />
        <path
          d={`M ${320 + tilt - 42} 116 L ${320 + tilt + 42} 116 L 350 188 L 290 188 Z`}
          fill={fill}
          stroke={ink}
          strokeWidth="2"
        />
        <path
          d={`M 320 188 L ${320 + tilt} 112`}
          stroke={green}
          strokeWidth="2.5"
          strokeDasharray="5 5"
        />
        <circle
          cx={320 + tilt}
          cy="88"
          r="22"
          fill={paper}
          stroke={ink}
          strokeWidth="2"
        />
        <path
          d={`M ${320 + tilt - 34} 122 L ${hx} 222 M ${320 + tilt + 34} 122 L ${hx} 222`}
          stroke={ink}
          strokeWidth="6"
          fill="none"
        />
        <path
          d={`M ${hx} 222 L ${ballX - 4} 286`}
          stroke={green}
          strokeWidth="3.5"
        />
        <path
          d={`M ${ballX - 18} 291 H ${ballX - 4}`}
          stroke={ink}
          strokeWidth="6"
        />
        <circle cx={ballX + 2} cy="289" r="7" fill={orange} />
      </g>
      <text x={X(96)} y="150" textAnchor={A("start")}>
        {text("TRAIL SIDE", "LADO TRASERO")}
      </text>
      <text x={X(544)} y="150" textAnchor={A("end")} fill={green}>
        {text("LEAD SIDE", "LADO DELANTERO")}
      </text>
      <Note
        x={X(470)}
        y={250}
        anchor={A("start")}
        small
        to={[X(320 + kneeX + 3), 245]}
      >
        {text("SOFT KNEES", "RODILLAS SUAVES")}
      </Note>
      {driver ? (
        <Note
          x={X(96)}
          y={104}
          anchor={A("start")}
          small
          color={green}
          to={[X(313), 150]}
        >
          {text(
            "SPINE TILTS AWAY FROM TARGET",
            "COLUMNA INCLINADA LEJOS DEL OBJETIVO",
          )}
        </Note>
      ) : (
        <Note
          x={X(96)}
          y={104}
          anchor={A("start")}
          small
          color={green}
          to={[X(320), 150]}
        >
          {text("SPINE LEVEL, ARMS HANG", "COLUMNA CENTRADA, BRAZOS COLGANDO")}
        </Note>
      )}
      <text
        x={X(320 - f)}
        y="340"
        textAnchor="middle"
        className="diagram-small"
      >
        {`≈${trail}% ${text("TRAIL", "TRASERO")}`}
      </text>
      <text
        x={X(320 + f)}
        y="340"
        textAnchor="middle"
        fill={green}
        className="diagram-small"
      >
        {`≈${lead}% ${text("LEAD", "DELANTERO")}`}
      </text>
      <TargetArrow {...ctx} />
    </>
  );
}

function DownTheLine(ctx: Ctx) {
  const { X, A, text, mirrored } = ctx;
  return (
    <>
      <g transform={mirrored} strokeLinecap="round" strokeLinejoin="round">
        <path d="M 236 300 L 309 53" stroke={quiet} strokeDasharray="6 8" />
        <path d="M 425 295 L 498 48" stroke={blue} strokeDasharray="6 8" />
        <Flag x={498} y={48} color={blue} />
        <g fill="none" stroke={ink}>
          <path
            d="M 270 285 L 301 222 L 272 179"
            strokeWidth="7"
            opacity="0.75"
          />
          <path d="M 250 285 L 278 221 L 251 176 L 311 110" strokeWidth="10" />
          <path d="M 236 289 h 30 M 256 289 h 30" strokeWidth="6" />
          <circle cx="329" cy="85" r="24" fill={paper} strokeWidth="2" />
          <path
            d="M 308 121 L 323 169 L 335 203 M 324 126 L 342 166 L 335 203"
            strokeWidth="6"
          />
          <path d="M 335 203 L 424 282" stroke={green} strokeWidth="3.5" />
          <path d="M 420 284 h 20" strokeWidth="7" />
          <path d="M 251 172 L 309 112" stroke={green} strokeWidth="3" />
          <path
            d="M 238 192 L 251 172"
            stroke={green}
            strokeWidth="2"
            strokeDasharray="3 4"
          />
        </g>
        <circle cx="443" cy="279" r="8" fill={orange} />
      </g>
      <Note
        x={X(96)}
        y={150}
        anchor={A("start")}
        color={green}
        to={[X(247), 178]}
      >
        {text("HINGE FROM THE HIPS", "FLEXIONA DESDE LA CADERA")}
      </Note>
      <Note x={X(96)} y={250} anchor={A("start")} to={[X(274), 222]}>
        {text("SOFT KNEES", "RODILLAS SUAVES")}
      </Note>
      <Note x={X(468)} y={250} anchor={A("start")} to={[X(340), 190]}>
        {text("ARMS HANG FREELY", "BRAZOS SUELTOS")}
      </Note>
      <text x={X(232)} y="326" textAnchor="middle" className="diagram-small">
        {text("TOE LINE", "LÍNEA DE LOS PIES")}
      </text>
      <text
        x={X(464)}
        y="326"
        textAnchor="middle"
        fill={blue}
        className="diagram-small"
      >
        {text("TARGET LINE", "LÍNEA DEL OBJETIVO")}
      </text>
      <text
        x={X(520)}
        y="36"
        textAnchor={A("start")}
        fill={blue}
        className="diagram-small"
      >
        {text("TARGET", "OBJETIVO")}
      </text>
    </>
  );
}

type Pose = {
  head: [number, number];
  shT: [number, number];
  shL: [number, number];
  hipT: [number, number];
  hipL: [number, number];
  kneeT: [number, number];
  kneeL: [number, number];
  ankT: [number, number];
  ankL: [number, number];
  hands: [number, number];
  club: [number, number];
};
const address: Pose = {
  head: [0, 42],
  shT: [-36, 90],
  shL: [36, 90],
  hipT: [-22, 160],
  hipL: [22, 160],
  kneeT: [-30, 215],
  kneeL: [30, 215],
  ankT: [-40, 280],
  ankL: [40, 280],
  hands: [6, 186],
  club: [8, 276],
};
const fullSwing: Pose[] = [
  address,
  {
    ...address,
    shT: [-34, 92],
    shL: [38, 88],
    hands: [-40, 184],
    club: [-82, 172],
  },
  {
    ...address,
    head: [-2, 42],
    shT: [-32, 86],
    shL: [32, 100],
    hipT: [-26, 160],
    hipL: [18, 160],
    kneeT: [-34, 214],
    hands: [-40, 66],
    club: [40, 30],
  },
  {
    ...address,
    head: [-4, 44],
    shT: [-30, 92],
    shL: [40, 90],
    hipT: [-12, 158],
    hipL: [34, 156],
    kneeT: [-14, 218],
    kneeL: [36, 214],
    hands: [22, 182],
    club: [8, 276],
  },
  {
    head: [12, 42],
    shT: [-2, 90],
    shL: [28, 88],
    hipT: [10, 158],
    hipL: [34, 156],
    kneeT: [-4, 222],
    kneeL: [36, 214],
    ankT: [-26, 278],
    ankL: [40, 280],
    hands: [14, 70],
    club: [-40, 34],
  },
];
const puttStroke: Pose[] = [
  address,
  { ...address, hands: [-14, 188], club: [-14, 278] },
  { ...address, hands: [-22, 190], club: [-24, 278] },
  { ...address, hands: [4, 186], club: [6, 276] },
  { ...address, hands: [24, 188], club: [28, 274] },
];
const mix = (a: Pose, b: Pose, t: number): Pose =>
  Object.fromEntries(
    (Object.keys(a) as (keyof Pose)[]).map((k) => [
      k,
      [a[k][0] + (b[k][0] - a[k][0]) * t, a[k][1] + (b[k][1] - a[k][1]) * t],
    ]),
  ) as Pose;

function Sequence(ctx: Ctx & { frame: number }) {
  const { club, shot, flip, lang, frame } = ctx;
  const putt = club.system === "putter",
    partial = shot !== "stock",
    driver = club.system === "driver";
  const poses = putt
    ? puttStroke
    : partial
      ? fullSwing.map((p) => ({
          ...mix(address, p, 0.55),
          ankT: address.ankT,
          ankL: address.ankL,
        }))
      : fullSwing;
  const ballX = driver ? 30 : putt ? 8 : 8;
  const cellW = 124,
    s = 0.74;
  const cue = putt
    ? puttCues[frame]
    : partial && frame === 2
      ? partialTopCue
      : fullCues[frame];
  return (
    <>
      {poses.map((p, i) => {
        const cx = 10 + cellW * i + cellW / 2;
        const selected = i === frame;
        const onGround = p.club[1] > 260;
        const ball =
          putt && i === 4 ? [58, 282] : i === 4 ? null : [ballX, 282];
        return (
          <g key={phaseNames[i].en}>
            {selected && (
              <rect
                x={cx - cellW / 2 + 2}
                y="52"
                width={cellW - 4}
                height="254"
                rx="10"
                fill={fill}
                opacity="0.55"
              />
            )}
            <g opacity={selected ? 1 : 0.42}>
              <path d={`M ${cx - 50} 262 H ${cx + 50}`} stroke={quiet} />
              <g
                transform={`translate(${cx} 262) scale(${flip ? -s : s} ${s}) translate(0 -280)`}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              >
                <path
                  d={`M ${p.hipT[0]} ${p.hipT[1]} L ${p.kneeT[0]} ${p.kneeT[1]} L ${p.ankT[0]} ${p.ankT[1]}`}
                  stroke={ink}
                  strokeWidth="12"
                />
                <path
                  d={`M ${p.hipL[0]} ${p.hipL[1]} L ${p.kneeL[0]} ${p.kneeL[1]} L ${p.ankL[0]} ${p.ankL[1]}`}
                  stroke={ink}
                  strokeWidth="12"
                />
                <path
                  d={`M ${p.shT[0]} ${p.shT[1]} L ${p.shL[0]} ${p.shL[1]} L ${p.hipL[0]} ${p.hipL[1]} L ${p.hipT[0]} ${p.hipT[1]} Z`}
                  fill={fill}
                  stroke={ink}
                  strokeWidth="3"
                />
                <circle
                  cx={p.head[0]}
                  cy={p.head[1]}
                  r="24"
                  fill={paper}
                  stroke={ink}
                  strokeWidth="3"
                />
                <path
                  d={`M ${p.shT[0]} ${p.shT[1] + 6} L ${p.hands[0]} ${p.hands[1]} M ${p.shL[0]} ${p.shL[1] + 6} L ${p.hands[0]} ${p.hands[1]}`}
                  stroke={ink}
                  strokeWidth="8"
                />
                <path
                  d={`M ${p.hands[0]} ${p.hands[1]} L ${onGround ? p.club[0] - 6 : p.club[0]} ${p.club[1]}`}
                  stroke={green}
                  strokeWidth="5"
                />
                {onGround ? (
                  <path
                    d={`M ${p.club[0] - 18} 278 H ${p.club[0]}`}
                    stroke={ink}
                    strokeWidth="10"
                  />
                ) : (
                  <circle cx={p.club[0]} cy={p.club[1]} r="7" fill={ink} />
                )}
                {ball && (
                  <circle cx={ball[0] + 6} cy={ball[1]} r="7" fill={orange} />
                )}
              </g>
            </g>
            <text
              x={cx}
              y="300"
              textAnchor="middle"
              fill={selected ? green : undefined}
              className={
                selected ? "diagram-small diagram-strong" : "diagram-small"
              }
            >
              {`${i + 1} · ${phaseNames[i][lang].toUpperCase()}`}
            </text>
          </g>
        );
      })}
      <text x="320" y="340" textAnchor="middle" className="diagram-caption">
        {`${String(frame + 1).padStart(2, "0")} — ${cue[lang]}`}
      </text>
    </>
  );
}

function Flight(ctx: Ctx & { start: Direction; curve: Direction }) {
  const { id, X, A, text, start, curve } = ctx;
  const dxp = start * 40 - curve * 50;
  const len = Math.hypot(dxp, 110),
    ux = dxp / len,
    uy = -110 / len;
  const endX = 320 + start * 80 + curve * 125;
  const q = (t: number): [number, number] => [
    (1 - t) ** 2 * 320 + 2 * t * (1 - t) * (320 + start * 80) + t * t * endX,
    (1 - t) ** 2 * 268 + 2 * t * (1 - t) * 150 + t * t * 60,
  ];
  const flightMid = q(0.38);
  return (
    <>
      <path d="M 320 258 V 54" stroke={quiet} strokeDasharray="4 6" />
      <Flag x={320} y={48} color={blue} />
      <text x="334" y="46" fill={blue} className="diagram-small">
        {text("TARGET", "OBJETIVO")}
      </text>
      <text x="70" y="160" className="diagram-small">
        {`← ${text("LEFT", "IZQUIERDA")}`}
      </text>
      <text x="570" y="160" textAnchor="end" className="diagram-small">
        {`${text("RIGHT", "DERECHA")} →`}
      </text>
      <g>
        <rect
          x={X(250) - 15}
          y="240"
          width="30"
          height="13"
          rx="6"
          fill={fill}
          stroke={ink}
          strokeWidth="1.5"
        />
        <rect
          x={X(250) - 15}
          y="277"
          width="30"
          height="13"
          rx="6"
          fill={fill}
          stroke={ink}
          strokeWidth="1.5"
        />
        <text
          x={X(226)}
          y="269"
          textAnchor={A("end")}
          className="diagram-small"
        >
          {text("YOU", "TÚ")}
        </text>
      </g>
      <path
        d={`M ${320 - ux * 62} ${268 - uy * 62} L ${320 + ux * 96} ${268 + uy * 96}`}
        stroke={blue}
        strokeWidth="3"
        markerEnd={`url(#${id}-arrow)`}
      />
      <rect
        x="294"
        y="274"
        width="52"
        height="9"
        rx="2"
        fill={green}
        transform={`rotate(${start * 14} 320 278)`}
      />
      <circle
        cx="320"
        cy="268"
        r="8"
        fill={paper}
        stroke={ink}
        strokeWidth="2"
      />
      <path
        d={`M 320 268 Q ${320 + start * 80} 150 ${endX} 60`}
        stroke={orange}
        strokeWidth="4"
        fill="none"
        markerEnd={`url(#${id}-orange)`}
      />
      <Note x={70} y={100} color={orange} to={flightMid}>
        {text("BALL FLIGHT", "VUELO DE LA BOLA")}
      </Note>
      <Note
        x={570}
        y={100}
        anchor="end"
        color={blue}
        to={[320 + ux * 58, 268 + uy * 58]}
      >
        {text("CLUB PATH", "TRAYECTORIA DEL PALO")}
      </Note>
      <Note
        x={X(570)}
        y={300}
        anchor={A("end")}
        color={green}
        to={[X(345), 278]}
      >
        {text("CLUBFACE", "CARA DEL PALO")}
      </Note>
      <rect x="70" y="332" width="10" height="10" rx="2" fill={green} />
      <text x="88" y="341" className="diagram-small">
        {text("FACE SETS THE START LINE", "LA CARA MARCA LA SALIDA")}
      </text>
      <rect x="330" y="332" width="10" height="10" rx="2" fill={blue} />
      <text x="348" y="341" className="diagram-small">
        {text(
          "PATH VS FACE SETS THE CURVE",
          "TRAYECTORIA VS CARA MARCA LA CURVA",
        )}
      </text>
    </>
  );
}

function Trajectory(ctx: Ctx & { high: boolean }) {
  const { text, high } = ctx;
  const control = high ? -20 : 170;
  const apex = (280 + control) / 2;
  return (
    <>
      <path d="M 60 282 H 580" stroke={ink} strokeWidth="1.5" />
      <g stroke={ink} strokeWidth="3" strokeLinecap="round" fill="none">
        <circle cx="78" cy="238" r="8" fill={paper} strokeWidth="2" />
        <path d="M 78 246 V 266 M 78 266 L 70 280 M 78 266 L 86 280 M 70 254 L 92 262" />
      </g>
      <circle cx="100" cy="279" r="6" fill={orange} />
      <path
        d="M 100 279 Q 320 90 550 280"
        stroke={blue}
        strokeWidth="2"
        strokeDasharray="6 8"
        fill="none"
      />
      <path
        d={`M 100 279 Q 320 ${control} 550 280`}
        fill="none"
        stroke={orange}
        strokeWidth="4"
      />
      <text
        x="320"
        y={apex - 12}
        textAnchor="middle"
        fill={orange}
        className="diagram-small"
      >
        {text("YOUR SHOT", "TU GOLPE")}
      </text>
      <text
        x="320"
        y={high ? 200 : 173}
        textAnchor="middle"
        fill={blue}
        className="diagram-small"
      >
        {text("TYPICAL FLIGHT", "VUELO HABITUAL")}
      </text>
      <TargetArrow {...ctx} mirror={false} />
    </>
  );
}

function Impact(ctx: Ctx & { fault?: string }) {
  const { id, club, shot, text, fault } = ctx;
  const putt = club.system === "putter",
    driver = club.system === "driver",
    bunker = shot === "bunker";
  const fat = fault === "fat" || fault === "chip-heavy";
  const thin =
    fault === "thin" || fault === "chip-blade" || fault === "bunker-blade";
  const arc = putt
    ? "M 85 237 Q 320 258 555 225"
    : driver
      ? "M 70 115 Q 165 274 255 231 T 570 95"
      : bunker
        ? "M 75 86 Q 239 266 320 271 Q 411 277 559 155"
        : "M 75 75 Q 258 212 320 250 Q 397 298 562 121";
  const lowX = driver ? 255 : bunker ? 340 : 352;
  const lowWord = putt
    ? text("LEVEL THROUGH THE BALL", "NIVELADO A TRAVÉS DE LA BOLA")
    : driver
      ? text("LOW POINT · BEFORE THE BALL", "PUNTO BAJO · ANTES DE LA BOLA")
      : bunker
        ? text("LOW POINT · UNDER THE BALL", "PUNTO BAJO · BAJO LA BOLA")
        : text(
            "LOW POINT · JUST AFTER THE BALL",
            "PUNTO BAJO · JUSTO TRAS LA BOLA",
          );
  const caption = putt
    ? text("CENTER CONTACT · SMOOTH ROLL", "IMPACTO CENTRADO · RODADA SUAVE")
    : driver
      ? text(
          "SWEEP UP THROUGH THE TEED BALL",
          "BARRE HACIA ARRIBA LA BOLA EN EL TEE",
        )
      : bunker
        ? text(
            "SAND FIRST · A FEW CM BEHIND THE BALL",
            "PRIMERO ARENA · UNOS CM DETRÁS DE LA BOLA",
          )
        : text("BALL FIRST · TURF AFTER", "PRIMERO BOLA · DESPUÉS CÉSPED");
  return (
    <>
      <rect
        x="60"
        y="257"
        width="520"
        height="14"
        fill={bunker ? `url(#${id}-sand)` : fill}
      />
      <path d="M 60 257 H 580" stroke={ink} strokeWidth="2" />
      {!putt && !driver && !bunker && (
        <path d="M 324 257 Q 354 272 386 257 Z" fill={quiet} opacity="0.7" />
      )}
      {bunker && (
        <path d="M 282 257 Q 340 286 404 257 Z" fill={quiet} opacity="0.7" />
      )}
      {driver && <path d="M 320 214 V 256" stroke={ink} strokeWidth="3" />}
      <path
        d={arc}
        stroke={green}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {fat && (
        <>
          <path
            d="M 60 122 Q 191 300 255 268 Q 330 230 451 125"
            stroke={orange}
            strokeWidth="3"
            strokeDasharray="6 7"
            fill="none"
          />
          <path d="M 214 262 V 276" stroke={orange} strokeWidth="2" />
          <text
            x="206"
            y="296"
            textAnchor="end"
            fill={orange}
            className="diagram-small"
          >
            {text("GROUND FIRST", "PRIMERO EL SUELO")}
          </text>
        </>
      )}
      {thin && (
        <>
          <path
            d="M 67 88 Q 320 373 565 125"
            stroke={orange}
            strokeWidth="3"
            strokeDasharray="6 7"
            fill="none"
          />
          <text
            x="320"
            y="188"
            textAnchor="middle"
            fill={orange}
            className="diagram-small"
          >
            {text(
              "ARC BOTTOMS OUT TOO HIGH",
              "EL ARCO TOCA FONDO DEMASIADO ALTO",
            )}
          </text>
        </>
      )}
      {!putt && (
        <>
          <path d={`M ${lowX} 262 V 276`} stroke={green} strokeWidth="2" />
          <text
            x={lowX}
            y="296"
            textAnchor="middle"
            fill={green}
            className="diagram-small"
          >
            {lowWord}
          </text>
        </>
      )}
      {putt && (
        <text
          x="320"
          y="296"
          textAnchor="middle"
          fill={green}
          className="diagram-small"
        >
          {lowWord}
        </text>
      )}
      {bunker && (
        <>
          <path d="M 286 250 V 236" stroke={orange} strokeWidth="2" />
          <text
            x="286"
            y="226"
            textAnchor="middle"
            fill={orange}
            className="diagram-small"
          >
            {text("ENTRY POINT", "PUNTO DE ENTRADA")}
          </text>
        </>
      )}
      <circle
        cx="320"
        cy={driver ? 201 : 245}
        r="12"
        fill={paper}
        stroke={ink}
        strokeWidth="2"
      />
      <text x="320" y="330" textAnchor="middle" fill={green}>
        {caption}
      </text>
      <TargetArrow {...ctx} mirror={false} />
    </>
  );
}

function ClubFace(ctx: Ctx & { fault: string }) {
  const { text, fault } = ctx;
  const shank = fault === "shank";
  return (
    <>
      <path
        d="M 203 192 L 178 61 L 193 57 L 225 170 Q 387 119 445 189 Q 471 257 390 279 L 220 273 Q 193 244 203 192 Z"
        fill={fill}
        stroke={ink}
        strokeWidth="3"
      />
      {[190, 208, 226, 244].map((y) => (
        <path key={y} d={`M 260 ${y} H 416`} stroke={quiet} />
      ))}
      <circle cx="335" cy="218" r="13" fill={green} />
      <circle
        cx={shank ? 214 : 335}
        cy={shank ? 193 : 151}
        r="12"
        fill={orange}
      />
      <text x="170" y="44" className="diagram-small">
        {text("HOSEL", "HOSEL")}
      </text>
      <text x="455" y="300" className="diagram-small">
        {text("TOE", "PUNTA")}
      </text>
      <text x="192" y="300" textAnchor="end" className="diagram-small">
        {text("HEEL", "TALÓN")}
      </text>
      <text x="335" y="315" textAnchor="middle" fill={green}>
        {text("CENTER CONTACT", "IMPACTO CENTRADO")}
      </text>
      <Note
        x={320}
        y={36}
        anchor="middle"
        color={orange}
        to={shank ? [226, 190] : [335, 139]}
      >
        {shank
          ? text("HOSEL CONTACT", "CONTACTO DE HOSEL")
          : text("HIGH FACE / CROWN CONTACT", "CONTACTO ALTO / CORONA")}
      </Note>
    </>
  );
}

function Grip(ctx: Ctx & { grip: number }) {
  const { X, A, text, mirrored, grip } = ctx;
  const visible = [1, 2, 3][grip];
  const vx = [0, 40, 80][grip];
  const vWord = [
    text("V: TO YOUR CHIN", "V: HACIA LA BARBILLA"),
    text("V: TO YOUR TRAIL SHOULDER", "V: HACIA EL HOMBRO TRASERO"),
    text("V: BEYOND YOUR TRAIL SHOULDER", "V: MÁS ALLÁ DEL HOMBRO TRASERO"),
  ][grip];
  const strength = [
    text("WEAK · ABOUT 1 KNUCKLE", "DÉBIL · UN NUDILLO"),
    text("NEUTRAL · ABOUT 2 KNUCKLES", "NEUTRO · UNOS 2 NUDILLOS"),
    text("STRONG · ABOUT 3 KNUCKLES", "FUERTE · UNOS 3 NUDILLOS"),
  ][grip];
  return (
    <>
      <g transform={mirrored}>
        <path d="M 320 62 V 20" stroke={ink} strokeWidth="4" />
        <rect
          x="296"
          y="52"
          width="48"
          height="278"
          rx="14"
          fill={fill}
          stroke={ink}
          strokeWidth="2"
        />
        <g transform={`rotate(${(grip - 1) * 14} 320 200)`}>
          <path
            d="M 236 268 L 240 176 Q 246 150 272 144 L 336 132 Q 352 130 356 146 L 352 228 Q 346 252 322 258 L 300 272 Z"
            fill={paper}
            stroke={ink}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <rect
            x={322 + (grip - 1) * 5}
            y="150"
            width="18"
            height="88"
            rx="9"
            fill={paper}
            stroke={ink}
            strokeWidth="2"
          />
          {[0, 1, 2, 3].map((n) => (
            <circle
              key={n}
              cx={266 + n * 23}
              cy={148 - n * 4.6}
              r="6"
              fill={n >= 4 - visible ? green : paper}
              stroke={n >= 4 - visible ? green : quiet}
              strokeWidth="1.5"
            />
          ))}
        </g>
        <path
          d={`M 332 146 L ${332 + vx} 84`}
          stroke={green}
          strokeWidth="2"
          strokeDasharray="5 4"
        />
      </g>
      <text
        x={X(340 + vx)}
        y="78"
        textAnchor={A("start")}
        fill={green}
        className="diagram-small"
      >
        {vWord}
      </text>
      <Note
        x={X(96)}
        y={150}
        anchor={A("start")}
        color={green}
        to={[X(238), 200]}
      >
        {text("LEAD HAND", "MANO DELANTERA")}
      </Note>
      <Note x={X(566)} y={126} anchor={A("end")} small to={[X(322), 146]}>
        {text("KNUCKLES YOU CAN SEE", "NUDILLOS QUE VES")}
      </Note>
      <Note x={X(566)} y={196} anchor={A("end")} small to={[X(343), 196]}>
        {text("THUMB ON THE HANDLE", "PULGAR SOBRE EL MANGO")}
      </Note>
      <Note x={X(566)} y={266} anchor={A("end")} small to={[X(322), 262]}>
        {text("HANDLE ACROSS THE FINGERS", "MANGO A TRAVÉS DE LOS DEDOS")}
      </Note>
      <text x="320" y="352" textAnchor="middle">
        {strength}
      </text>
    </>
  );
}
