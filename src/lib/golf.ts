export type Language = "en" | "es";
export type Copy = { en: string; es: string };
export const c = (en: string, es: string): Copy => ({ en, es });
export type Hand = "right" | "left";
export type Direction = -1 | 0 | 1;
export type Unit = "yd" | "m";
export type System = "driver" | "wood" | "iron" | "putter";
export type Shot = "stock" | "chip" | "pitch" | "bunker";
export const shotNames: Record<Shot, Copy> = {
  stock: c("Stock shot", "Golpe normal"),
  chip: c("Chip", "Chip"),
  pitch: c("Pitch", "Pitch"),
  bunker: c("Bunker", "Bunker"),
};
export type Club = {
  id: string;
  name: Copy;
  short: string;
  group: Copy;
  system: System;
  loft: string;
  ball: number;
  width: number;
  carry: [number, number] | null;
  use: Copy;
};
const woods = c("Woods", "Maderas"),
  irons = c("Irons", "Hierros"),
  wedges = c("Wedges", "Wedges");
export const clubs: Club[] = [
  {
    id: "driver",
    name: c("Driver", "Driver"),
    short: "D",
    group: woods,
    system: "driver",
    loft: "9–12.5°",
    ball: 0.92,
    width: 1.18,
    carry: [176, 245],
    use: c(
      "Tee shots with room for distance.",
      "Salidas con espacio para buscar distancia.",
    ),
  },
  {
    id: "3wood",
    name: c("3-wood", "Madera 3"),
    short: "3W",
    group: woods,
    system: "wood",
    loft: "14–16°",
    ball: 0.8,
    width: 1.08,
    carry: null,
    use: c(
      "Long fairway shots and controlled tee shots.",
      "Golpes largos desde fairway y salidas controladas.",
    ),
  },
  {
    id: "5wood",
    name: c("5-wood", "Madera 5"),
    short: "5W",
    group: woods,
    system: "wood",
    loft: "18–19°",
    ball: 0.75,
    width: 1.03,
    carry: null,
    use: c(
      "A higher flight for long approaches.",
      "Un vuelo más alto para acercamientos largos.",
    ),
  },
  {
    id: "hybrid",
    name: c("3H / 4H hybrid", "Híbrido 3H / 4H"),
    short: "H",
    group: c("Hybrids", "Híbridos"),
    system: "wood",
    loft: "19–24°",
    ball: 0.68,
    width: 1,
    carry: null,
    use: c(
      "An easier-launching alternative to a long iron.",
      "Una alternativa al hierro largo que facilita elevar la bola.",
    ),
  },
  ...[4, 5, 6, 7, 8, 9].map(
    (n): Club => ({
      id: `${n}iron`,
      name: c(`${n}-iron`, `Hierro ${n}`),
      short: `${n}i`,
      group: irons,
      system: "iron",
      loft: (
        {
          4: "21–24°",
          5: "25–27°",
          6: "30–31°",
          7: "34–35°",
          8: "37–39°",
          9: "41–43°",
        } as Record<number, string>
      )[n],
      ball: n < 6 ? 0.6 : 0.5,
      width: n < 8 ? 1 : 0.88,
      carry: (
        {
          4: [150, 186],
          5: [140, 169],
          6: [129, 162],
          7: [119, 154],
          8: [110, 146],
          9: [95, 136],
        } as Record<number, [number, number]>
      )[n],
      use:
        n < 6
          ? c(
              "Long approaches from a clean lie.",
              "Acercamientos largos desde un lie limpio.",
            )
          : c(
              "A controlled approach. Let the loft provide height.",
              "Un acercamiento controlado. Deja que el loft dé altura.",
            ),
    }),
  ),
  ...(["pw", "gw", "sw", "lw"] as const).map(
    (id): Club => ({
      id,
      name: c(
        {
          pw: "Pitching wedge",
          gw: "Gap wedge",
          sw: "Sand wedge",
          lw: "Lob wedge",
        }[id],
        {
          pw: "Pitching wedge",
          gw: "Gap wedge",
          sw: "Sand wedge",
          lw: "Lob wedge",
        }[id],
      ),
      short: id.toUpperCase(),
      group: wedges,
      system: "iron",
      loft: { pw: "44–47°", gw: "50–52°", sw: "54–58°", lw: "58–64°" }[id],
      ball: 0.5,
      width: 0.82,
      carry: (
        { pw: [76, 121], gw: [64, 104], sw: [46, 84], lw: null } as Record<
          string,
          [number, number] | null
        >
      )[id],
      use: c(
        "Control carry on short approaches; choose the shot for the lie.",
        "Controla el vuelo en acercamientos cortos; elige el golpe según el lie.",
      ),
    }),
  ),
  {
    id: "putter",
    name: c("Putter", "Putter"),
    short: "P",
    group: c("Putting", "Putting"),
    system: "putter",
    loft: "1.5–4.5°",
    ball: 0.6,
    width: 0.93,
    carry: null,
    use: c(
      "Roll the ball on the green or a smooth fringe.",
      "Haz rodar la bola en el green o en un borde liso.",
    ),
  },
];
export const isWedge = (club: Club) =>
  ["pw", "gw", "sw", "lw"].includes(club.id);
export function getSetup(club: Club, shot: Shot = "stock") {
  const putt = club.system === "putter",
    driver = club.system === "driver";
  const bunker = shot === "bunker",
    chip = shot === "chip",
    pitch = shot === "pitch";
  const partial = chip || pitch || bunker;
  return {
    ball: bunker ? 0.8 : chip ? 0.4 : pitch ? 0.5 : club.ball,
    width: chip || pitch ? 0.65 : bunker ? 1.1 : club.width,
    leadPressure: bunker
      ? 70
      : chip
        ? 65
        : pitch
          ? 55
          : driver
            ? 45
            : isWedge(club)
              ? 55
              : 50,
    stance: partial
      ? c(
          bunker
            ? "Stable, slightly open stance; settle your feet into the sand."
            : "Narrow and balanced. Give your chest room to turn.",
          bunker
            ? "Postura estable y algo abierta; asienta los pies en la arena."
            : "Estrecha y equilibrada. Deja espacio para girar el pecho.",
        )
      : driver
        ? c(
            "Feet slightly wider than your shoulders.",
            "Pies algo más separados que los hombros.",
          )
        : club.width < 0.9
          ? c(
              "Feet just inside shoulder width.",
              "Pies un poco más juntos que los hombros.",
            )
          : c(
              "Feet about shoulder width, knees soft.",
              "Pies al ancho de los hombros y rodillas suaves.",
            ),
    position: bunker
      ? c(
          "Forward of center. Your entry point is in the sand behind the ball.",
          "Adelante del centro. El punto de entrada está en la arena detrás de la bola.",
        )
      : chip
        ? c(
            "A little behind center for a basic running chip.",
            "Un poco detrás del centro para un chip rodado básico.",
          )
        : driver
          ? c(
              "Inside the lead heel. Tee about half the ball above the crown.",
              "Dentro del talón delantero. Deja media bola sobre la corona del driver.",
            )
          : club.ball > 0.65
            ? c(
                "Forward of center, behind the lead heel.",
                "Adelante del centro, detrás del talón delantero.",
              )
            : club.ball > 0.5
              ? c(
                  "Slightly forward of center.",
                  "Ligeramente adelante del centro.",
                )
              : c(
                  "Near the center of your stance.",
                  "Cerca del centro de tu postura.",
                ),
    posture: putt
      ? c(
          "Hinge comfortably; eyes over or just inside the ball. Keep your lower body quiet.",
          "Inclínate cómodamente; ojos sobre o apenas dentro de la bola. Mantén quieta la parte inferior del cuerpo.",
        )
      : driver
        ? c(
            "Hinge at the hips and tilt gently away from the target. Avoid leaning onto the trail leg during the strike.",
            "Inclínate desde la cadera y suavemente lejos del objetivo. Evita quedarte sobre la pierna trasera al golpear.",
          )
        : c(
            "Hinge from your hips with soft knees. Let the arms hang; keep balance through the middle of your feet.",
            "Inclínate desde las caderas con rodillas suaves. Deja colgar los brazos y equilibra el peso en el centro de los pies.",
          ),
    intent: bunker
      ? c(
          "Splash sand from just behind the ball onto the green. Keep the swing moving through.",
          "Lanza al green la arena justo detrás de la bola. Continúa el movimiento del swing.",
        )
      : chip
        ? c(
            "A compact turn and ball-first contact. Let the ball roll toward your target.",
            "Un giro compacto e impacto primero con la bola. Deja que ruede hacia el objetivo.",
          )
        : pitch
          ? c(
              "A shorter, flowing swing. Brush the turf and let the loft lift the ball.",
              "Un swing corto y fluido. Roza el césped y deja que el loft eleve la bola.",
            )
          : putt
            ? c(
                "A quiet, rhythmic stroke. Control pace with stroke length.",
                "Un golpe tranquilo y rítmico. Controla la velocidad con su amplitud.",
              )
            : driver
              ? c(
                  "Sweep through the teed ball. Favor centered contact over extra effort.",
                  "Barre a través de la bola en el tee. Prioriza el impacto centrado sobre el esfuerzo extra.",
                )
              : club.system === "wood"
                ? c(
                    "Ball first, then a shallow brush of turf. A hybrid can strike slightly down.",
                    "Primero bola y luego un roce ligero del césped. Con híbrido puedes golpear ligeramente hacia abajo.",
                  )
                : c(
                    "Ball first, then turf. Allow pressure to move toward the lead foot.",
                    "Primero bola y luego césped. Deja que la presión avance hacia el pie delantero.",
                  ),
    grip: putt
      ? c(
          "Try reverse overlap: lead index over the trail fingers. Hold securely with relaxed wrists.",
          "Prueba el agarre superpuesto inverso: índice delantero sobre los dedos traseros. Sujeta con firmeza y muñecas relajadas.",
        )
      : c(
          "Start neutral: about two lead-hand knuckles visible; the handle rests across the fingers. Hold securely without squeezing.",
          "Empieza neutro: unos dos nudillos de la mano delantera visibles; el mango cruza los dedos. Sujeta con firmeza sin apretar demasiado.",
        ),
    tempo:
      putt || partial
        ? c(
            "Keep back and through connected. Explore a gentle 2:1 rhythm; comfort matters more than a number.",
            "Conecta la ida y la vuelta. Explora un ritmo suave de 2:1; la comodidad importa más que una cifra.",
          )
        : c(
            "Try three counts back, one through. A 3:1 rhythm is a practice reference, not a requirement.",
            "Prueba tres tiempos atrás y uno adelante. El ritmo 3:1 es una referencia de práctica, no una obligación.",
          ),
  };
}
export const directionCopy: Record<string, Copy> = {
  "-1": c("Left", "Izquierda"),
  "0": c("Straight", "Recto"),
  "1": c("Right", "Derecha"),
};
export function flightName(
  start: Direction,
  curve: Direction,
  hand: Hand,
): string {
  const sign = hand === "right" ? 1 : -1;
  const s = start * sign,
    k = curve * sign;
  if (!s && !k) return "Straight";
  const prefix = s < 0 ? "Pull" : s > 0 ? "Push" : "Straight";
  return k ? `${prefix}-${k > 0 ? "slice" : "hook"}` : prefix;
}
export function flightLabel(name: string, lang: Language) {
  if (lang === "en") return name;
  return (
    (
      {
        Straight: "Recto",
        Pull: "Pull",
        Push: "Push",
        "Straight-slice": "Slice desde el objetivo",
        "Straight-hook": "Hook desde el objetivo",
      } as Record<string, string>
    )[name] ?? name
  );
}
export type Advice = {
  id: string;
  title: Copy;
  definition: Copy;
  fix: Copy;
  drill: Copy;
  why: Copy;
  source: "flight" | "strike" | "bunker" | "practice" | "grip";
  diagram: "flight" | "impact" | "sequence" | "grip";
  kinds: System[];
  shots?: Shot[];
};
const all: System[] = ["driver", "wood", "iron", "putter"];
const ground: System[] = ["wood", "iron"];
export const faults: Advice[] = [
  {
    id: "fat",
    title: c("Heavy / fat", "Pesado / fat"),
    definition: c(
      "The club met the ground before the ball. The low point may be too far back.",
      "El palo tocó el suelo antes que la bola. El punto bajo puede estar demasiado atrás.",
    ),
    fix: c(
      "Rehearse brushing the turf on the target side of the ball.",
      "Ensaya rozar el césped del lado del objetivo después de la bola.",
    ),
    drill: c(
      "Mark a line on the turf. Make five small swings with the first brush just past the line, then add a ball on it.",
      "Marca una línea en el césped. Haz cinco swings cortos rozando justo después de la línea y luego añade una bola sobre ella.",
    ),
    why: c(
      "Pressure staying back is one possible cause. Ball position and loss of posture can also move contact behind the ball.",
      "Quedarte atrás es una posible causa. La posición de la bola y perder la postura también pueden retrasar el contacto.",
    ),
    source: "strike",
    diagram: "impact",
    kinds: ground,
    shots: ["stock", "pitch"],
  },
  {
    id: "thin",
    title: c("Thin / topped", "Delgado / topado"),
    definition: c(
      "The leading edge caught the ball too high, or the club struck above its center.",
      "El borde del palo alcanzó la bola demasiado arriba o golpeó por encima de su centro.",
    ),
    fix: c(
      "Keep your chest at a comfortable height and turn through. Let the loft lift the ball.",
      "Mantén el pecho a una altura cómoda y gira. Deja que el loft eleve la bola.",
    ),
    drill: c(
      "Make five half-swings trying to brush the turf just beyond the ball. Notice the contact, not the distance.",
      "Haz cinco medios swings intentando rozar el césped justo después de la bola. Observa el contacto, no la distancia.",
    ),
    why: c(
      "A low point too far back or standing up early can contribute. A thin shot alone cannot identify the cause.",
      "Un punto bajo retrasado o levantarte pronto pueden influir. Un golpe delgado por sí solo no identifica la causa.",
    ),
    source: "strike",
    diagram: "impact",
    kinds: ground,
    shots: ["stock", "pitch"],
  },
  {
    id: "shank",
    title: c("Shank / hosel strike", "Shank / golpe de hosel"),
    definition: c(
      "The ball contacts the hosel, where the shaft joins the head, and can shoot sharply sideways.",
      "La bola toca el hosel, donde la varilla se une a la cabeza, y puede salir de lado bruscamente.",
    ),
    fix: c(
      "Check strike location and maintain space between your hips and the ball.",
      "Comprueba la zona de impacto y conserva espacio entre la cadera y la bola.",
    ),
    drill: c(
      "Place a soft headcover outside the ball with room for the club. Make slow half-swings without touching it.",
      "Pon una funda blanda fuera de la bola dejando espacio al palo. Haz medios swings lentos sin tocarla.",
    ),
    why: c(
      "Moving toward the ball is one possible cause, not the only one. Check contact before changing your swing path.",
      "Acercarte a la bola es una posible causa, no la única. Comprueba el contacto antes de cambiar la trayectoria.",
    ),
    source: "strike",
    diagram: "impact",
    kinds: ground,
  },
  {
    id: "sky",
    title: c("Pop-up / sky ball", "Globo / pop-up"),
    definition: c(
      "A very high, short drive can come from contact high on the face or crown.",
      "Una salida muy alta y corta puede venir de un impacto alto en la cara o corona.",
    ),
    fix: c(
      "Check tee height and ball position before changing your swing. Start with half the ball above the crown.",
      "Revisa la altura del tee y la bola antes de cambiar el swing. Empieza con media bola sobre la corona.",
    ),
    drill: c(
      "Hit five easy drives and inspect the contact mark after each. Aim to find the middle of the face.",
      "Pega cinco drives suaves y revisa la marca de cada impacto. Busca el centro de la cara.",
    ),
    why: c(
      "A steep delivery can contribute, but tee height and impact location matter too. Avoid forcing an upward hit.",
      "Un ataque vertical puede influir, pero también la altura del tee y el impacto. Evita forzar un golpe ascendente.",
    ),
    source: "strike",
    diagram: "impact",
    kinds: ["driver"],
  },
  {
    id: "chip-heavy",
    title: c("Chunked chip", "Chip pesado"),
    definition: c(
      "The wedge entered the turf before reaching the ball.",
      "El wedge entró al césped antes de llegar a la bola.",
    ),
    fix: c(
      "Keep a little pressure on the lead side and turn your chest through the shot.",
      "Mantén algo de presión delante y gira el pecho a través del golpe.",
    ),
    drill: c(
      "Land five small chips on a towel a few paces away. Listen for clean contact before increasing distance.",
      "Haz caer cinco chips pequeños sobre una toalla a pocos pasos. Escucha un contacto limpio antes de aumentar la distancia.",
    ),
    why: c(
      "Hanging back, stopping the turn or changing wrist angles can move the low point. Start with a small, repeatable motion.",
      "Quedarte atrás, frenar el giro o cambiar las muñecas puede mover el punto bajo. Empieza con un movimiento corto y repetible.",
    ),
    source: "practice",
    diagram: "impact",
    kinds: ["iron"],
    shots: ["chip"],
  },
  {
    id: "chip-blade",
    title: c("Bladed chip", "Chip filoso"),
    definition: c(
      "The leading edge caught the middle of the ball, sending it low and fast.",
      "El borde alcanzó el centro de la bola y salió baja y rápida.",
    ),
    fix: c(
      "Let the club brush the grass. Resist trying to scoop the ball upward.",
      "Deja que el palo roce el césped. Evita intentar levantar la bola con las manos.",
    ),
    drill: c(
      "Without a ball, brush the same patch of turf five times. Add a ball and keep the same small turn.",
      "Sin bola, roza la misma zona cinco veces. Añade una bola y conserva ese giro corto.",
    ),
    why: c(
      "Rising through impact or an early low point can both produce a blade. Check posture and balance.",
      "Levantarte en el impacto o tocar fondo antes de tiempo pueden producir este golpe. Revisa postura y equilibrio.",
    ),
    source: "strike",
    diagram: "impact",
    kinds: ["iron"],
    shots: ["chip"],
  },
  {
    id: "bunker-short",
    title: c("Left in the sand", "Se quedó en la arena"),
    definition: c(
      "Too much sand or too little speed through it can leave the ball in the bunker.",
      "Demasiada arena o poca velocidad al atravesarla pueden dejar la bola en el bunker.",
    ),
    fix: c(
      "Choose an entry point just behind the ball and finish the swing through the sand.",
      "Elige una entrada justo detrás de la bola y termina el swing a través de la arena.",
    ),
    drill: c(
      "Draw a line in the sand and splash a shallow strip from it toward the green. Repeat five times, then add a ball ahead of the line.",
      "Traza una línea en la arena y lanza una capa fina desde ella hacia el green. Repite cinco veces y añade una bola delante de la línea.",
    ),
    why: c(
      "Deceleration is one possibility. Depth of entry, sand firmness and face position also change the result.",
      "Frenar es una posibilidad. La profundidad, la firmeza de la arena y la cara también cambian el resultado.",
    ),
    source: "bunker",
    diagram: "impact",
    kinds: ["iron"],
    shots: ["bunker"],
  },
  {
    id: "bunker-blade",
    title: c("Bladed out of the bunker", "Filazo desde bunker"),
    definition: c(
      "The club hit the ball first, instead of taking the intended layer of sand.",
      "El palo golpeó primero la bola en lugar de tomar la capa de arena prevista.",
    ),
    fix: c(
      "Aim for the sand behind the ball and keep your height through the swing.",
      "Apunta a la arena detrás de la bola y conserva tu altura durante el swing.",
    ),
    drill: c(
      "Practice the line-in-the-sand drill without a ball. Make your entry point repeatable before adding one.",
      "Practica con una línea en la arena sin bola. Repite el punto de entrada antes de añadirla.",
    ),
    why: c(
      "Firm sand may need a different face and bounce choice. The standard splash setup is not universal.",
      "La arena firme puede necesitar otra cara y bounce. La postura de salida estándar no es universal.",
    ),
    source: "bunker",
    diagram: "impact",
    kinds: ["iron"],
    shots: ["bunker"],
  },
  {
    id: "short",
    title: c("Too short", "Muy corto"),
    definition: c(
      "The ball did not reach the distance you intended.",
      "La bola no alcanzó la distancia prevista.",
    ),
    fix: c(
      "Check centered contact first. For a full shot, consider more club; for a putt, allow a longer flowing stroke.",
      "Comprueba primero el impacto centrado. En golpe completo, usa más palo; en putt, permite un movimiento más amplio y fluido.",
    ),
    drill: c(
      "Choose three progressively farther targets. Hit one ball to each with a comfortable rhythm, then repeat.",
      "Elige tres objetivos cada vez más lejos. Pega una bola a cada uno con ritmo cómodo y repite.",
    ),
    why: c(
      "Carry varies with contact, wind, temperature and lie. Compare against your own stock distance rather than an average.",
      "El vuelo cambia con impacto, viento, temperatura y lie. Compara con tu distancia normal, no con un promedio.",
    ),
    source: "practice",
    diagram: "sequence",
    kinds: all,
  },
  {
    id: "long",
    title: c("Too long", "Muy largo"),
    definition: c(
      "The ball carried or rolled farther than you intended.",
      "La bola voló o rodó más de lo previsto.",
    ),
    fix: c(
      "Use less club or a shorter controlled swing. For a putt, reduce stroke length while keeping rhythm.",
      "Usa menos palo o un swing más corto y controlado. En putt, acorta el golpe conservando el ritmo.",
    ),
    drill: c(
      "Pick a landing zone and hit five shorter swings. Observe carry separately from roll.",
      "Elige una zona de caída y haz cinco swings cortos. Observa el vuelo por separado de la rodada.",
    ),
    why: c(
      "A flyer lie, wind or firm ground can add distance. Check the conditions before changing technique.",
      "Un lie flyer, viento o suelo firme pueden añadir distancia. Revisa las condiciones antes de cambiar la técnica.",
    ),
    source: "practice",
    diagram: "sequence",
    kinds: all,
  },
  {
    id: "high",
    title: c("Too high", "Muy alto"),
    definition: c(
      "The flight is higher than intended; height alone is not necessarily a fault.",
      "El vuelo es más alto de lo previsto; la altura por sí sola no es un error.",
    ),
    fix: c(
      "For a lower approach, try more club and a shorter, controlled swing. Avoid forcing the hands far ahead.",
      "Para un acercamiento bajo, prueba más palo y un swing corto y controlado. Evita forzar las manos muy adelante.",
    ),
    drill: c(
      "Compare three normal shots with three controlled half-swings. Note height, strike and carry.",
      "Compara tres golpes normales con tres medios swings controlados. Observa altura, impacto y vuelo.",
    ),
    why: c(
      "Delivered loft, strike and wind influence height. Loft printed on a club is not the loft delivered at impact.",
      "El loft entregado, impacto y viento influyen en la altura. El loft impreso no es el loft en el impacto.",
    ),
    source: "flight",
    diagram: "flight",
    kinds: ["driver", "wood", "iron"],
  },
  {
    id: "low",
    title: c("Too low", "Muy bajo"),
    definition: c(
      "The flight launches lower than intended, which can also follow thin contact.",
      "El vuelo sale más bajo de lo previsto, también por un impacto delgado.",
    ),
    fix: c(
      "Check contact and ball position; choose more loft when needed. Let the club lift the ball.",
      "Revisa impacto y posición de bola; elige más loft si hace falta. Deja que el palo eleve la bola.",
    ),
    drill: c(
      "Hit five easy shots from a clean lie and compare the center-face strikes. Do not scoop to add height.",
      "Pega cinco golpes suaves desde un lie limpio y compara los impactos centrados. No cucharees para dar altura.",
    ),
    why: c(
      "Contact, delivered loft and conditions all matter. A low shot is not proof that the ball was too far back.",
      "Contacto, loft entregado y condiciones importan. Un golpe bajo no prueba que la bola estuviera muy atrás.",
    ),
    source: "flight",
    diagram: "flight",
    kinds: ["driver", "wood", "iron"],
  },
];
export function availableFaults(club: Club, shot: Shot) {
  return faults
    .filter(
      (f) =>
        f.kinds.includes(club.system) && (!f.shots || f.shots.includes(shot)),
    )
    .map((fault) => {
      if (club.system === "putter")
        return {
          ...fault,
          fix:
            fault.id === "short"
              ? c(
                  "Let the stroke travel a little farther back and through. Keep a comfortable, even rhythm.",
                  "Deja que el golpe recorra un poco más de distancia atrás y adelante. Conserva un ritmo cómodo y uniforme.",
                )
              : c(
                  "Shorten the stroke while keeping the same comfortable rhythm. Avoid an abrupt stop.",
                  "Acorta el golpe conservando el mismo ritmo cómodo. Evita frenarlo de repente.",
                ),
          drill: c(
            "On a flat practice green, roll one ball to each of three progressively farther targets. Repeat, matching stroke length to distance.",
            "En un green de práctica plano, rueda una bola a cada uno de tres objetivos progresivamente más lejanos. Repite ajustando amplitud a distancia.",
          ),
          why: c(
            "Green speed, slope and off-center contact change distance. Read the surface before changing your stroke.",
            "Velocidad del green, pendiente e impactos descentrados cambian la distancia. Lee la superficie antes de cambiar el golpe.",
          ),
        };
      if (club.system === "driver" && fault.id === "high")
        return {
          ...fault,
          fix: c(
            "Check the strike mark and tee height first. Compare easy, centered drives before changing loft or delivery.",
            "Revisa primero la marca de impacto y la altura del tee. Compara drives suaves y centrados antes de cambiar loft o ataque.",
          ),
        };
      return fault;
    });
}
export function flightAdvice(
  start: Direction,
  curve: Direction,
  hand: Hand,
  putt = false,
): Advice {
  const name = flightName(start, putt ? 0 : curve, hand);
  const open = curve * (hand === "right" ? 1 : -1) > 0;
  const side = directionCopy[String(start)],
    bend = directionCopy[String(curve)];
  return {
    id: `flight-${start}-${curve}-${hand}-${putt}`,
    title: c(
      putt ? (start ? `${name} putt` : "Straight putt") : name,
      putt
        ? start
          ? `Putt ${name.toLowerCase()}`
          : "Putt recto"
        : flightLabel(name, "es"),
    ),
    definition: putt
      ? c(
          `The putt started ${side.en.toLowerCase()}. This describes the start line, not the later break on the green.`,
          `El putt salió ${start === 0 ? "recto" : `hacia la ${side.es.toLowerCase()}`}. Esto describe la salida, no la caída posterior del green.`,
        )
      : c(
          `Started ${side.en.toLowerCase()}, ${curve ? `curved ${bend.en.toLowerCase()}` : "with no visible curve"}. A small, intentional curve can be a useful fade or draw.`,
          `Salió ${start === 0 ? "recto" : `a la ${side.es.toLowerCase()}`}, ${curve ? `curvó a la ${bend.es.toLowerCase()}` : "sin curva visible"}. Una curva pequeña e intencional puede ser un fade o draw útil.`,
        ),
    fix:
      !start && !curve
        ? c(
            "Keep the same setup and rhythm. Choose a target and check whether the pattern repeats.",
            "Conserva postura y ritmo. Elige un objetivo y comprueba si repites el patrón.",
          )
        : c(
            "Aim the face at a close intermediate target, then align your body parallel. Start with small, centered strikes.",
            "Apunta la cara a un objetivo cercano y alinea el cuerpo en paralelo. Empieza con golpes cortos y centrados.",
          ),
    drill: putt
      ? c(
          "On a flat patch, place two tees just wider than the ball a short distance ahead. Roll five putts through the gate.",
          "En una zona plana, pon dos tees algo más separados que la bola a poca distancia delante. Rueda cinco putts por la puerta.",
        )
      : c(
          "Lay an alignment stick safely outside your swing. Hit five half-shots, watching the first part of flight before the curve.",
          "Coloca una varilla de alineación fuera del swing. Pega cinco medios golpes observando primero la salida y después la curva.",
        ),
    why: putt
      ? c(
          "Face aim largely influences the start line. Green slope then changes the roll; do not diagnose a push or pull from the final resting place.",
          "La cara influye mucho en la salida. La pendiente cambia después la rodada; no diagnostiques push o pull por el lugar donde acaba.",
        )
      : c(
          `With centered contact, the face largely sets the start line. ${curve ? `This curve is consistent with a face ${open ? "open" : "closed"} relative to the path.` : "Little curve suggests face and path were closely matched."} Wind, lie and off-center strikes—especially with woods—can change the picture.`,
          `Con impacto centrado, la cara determina gran parte de la salida. ${curve ? `Esta curva es compatible con una cara ${open ? "abierta" : "cerrada"} respecto a la trayectoria.` : "Poca curva sugiere cara y trayectoria similares."} Viento, lie e impactos descentrados, especialmente con maderas, pueden cambiarlo.`,
        ),
    source: "flight",
    diagram: "flight",
    kinds: all,
  };
}
export const sources = {
  flight: {
    label: c(
      "Trackman · face, path & flight",
      "Trackman · cara, trayectoria y vuelo",
    ),
    url: "https://www.trackman.com/blog/6-trackman-numbers-all-amateur-golfers-should-know",
  },
  strike: {
    label: c("PGA · cleaner iron contact", "PGA · impacto limpio con hierros"),
    url: "https://www.pga.com/story/stop-topping-it-two-tips-to-hit-crispy-iron-shots",
  },
  bunker: {
    label: c("PGA · bunker technique", "PGA · técnica de bunker"),
    url: "https://www.pga.com/story/how-to-hit-any-bunker-shot",
  },
  practice: {
    label: c(
      "PGA · putting, chipping & bunker drills",
      "PGA · ejercicios de putt, chip y bunker",
    ),
    url: "https://www.pga.com/story/5-simple-drills-every-golfer-should-know-and-use",
  },
  grip: {
    label: c(
      "PGA · neutral grip & face control",
      "PGA · agarre neutro y control de cara",
    ),
    url: "https://www.pga.com/story/hit-the-golf-ball-where-you-want",
  },
};
export function toMetres(value: number, unit: Unit) {
  return unit === "yd" ? value * 0.9144 : value;
}
export function fromMetres(value: number, unit: Unit) {
  return unit === "yd" ? value / 0.9144 : value;
}
export type Preferences = {
  version: 1;
  club: string;
  hand: Hand;
  unit: Unit;
  carries: Record<string, number>;
};
export const defaults: Preferences = {
  version: 1,
  club: "7iron",
  hand: "right",
  unit: "yd",
  carries: {},
};
export const storageKey = "range-notes:v1";
export function parsePreferences(raw: string | null): Preferences {
  try {
    const p = JSON.parse(raw ?? "null");
    if (!p || p.version !== 1) return { ...defaults, carries: {} };
    const carries: Record<string, number> = {};
    for (const club of clubs) {
      const value = p.carries?.[club.id];
      if (
        club.system !== "putter" &&
        typeof value === "number" &&
        Number.isFinite(value) &&
        value > 0 &&
        value <= 500
      )
        carries[club.id] = value;
    }
    return {
      version: 1,
      club: clubs.some((c) => c.id === p.club) ? p.club : defaults.club,
      hand: p.hand === "left" ? "left" : "right",
      unit: p.unit === "m" ? "m" : "yd",
      carries,
    };
  } catch {
    return { ...defaults, carries: {} };
  }
}
type Event =
  | { type: "club_selected"; club: string }
  | { type: "diagnosis_completed"; kind: string }
  | { type: "helpfulness"; helpful: boolean };
// Deliberately no transport, persistence or personal data. A launch task can attach an aggregate sink.
export function track(_event: Event): void {}
