"use client";

import { ArrowRight, Check, ChevronDown, CircleHelp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GolfDiagram } from "@/components/golf-diagrams";
import {
  type Advice,
  availableFaults,
  type Club,
  type Direction,
  directionCopy,
  flightAdvice,
  fromMetres,
  type Language,
  type Shot,
  sources,
  toMetres,
  track,
  type Unit,
} from "@/lib/golf";
import type { Phase } from "@/lib/swing";

export function UnitControl({
  unit,
  onChange,
  lang,
}: {
  unit: Unit;
  onChange: (unit: Unit) => void;
  lang: Language;
}) {
  return (
    <fieldset className="segmented units">
      <legend>
        {lang === "en" ? "Distance units" : "Unidades de distancia"}
      </legend>
      {(["yd", "m"] as Unit[]).map((u) => (
        <button
          type="button"
          aria-pressed={unit === u}
          key={u}
          onClick={() => onChange(u)}
        >
          {u}
        </button>
      ))}
    </fieldset>
  );
}

export function CarryField({
  club,
  value,
  unit,
  lang,
  onSave,
}: {
  club: Club;
  value: number | undefined;
  unit: Unit;
  lang: Language;
  onSave: (value: number | null) => void;
}) {
  const [draft, setDraft] = useState(
    value === undefined
      ? ""
      : fromMetres(value, unit).toFixed(1).replace(/\.0$/, ""),
  );
  const [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  const original = useRef(draft);
  const t = (en: string, es: string) => (lang === "es" ? es : en);
  const id = `carry-${club.id}`;
  return (
    <form
      className="carry-form"
      onSubmit={(event) => {
        event.preventDefault();
        const numeric = Number(draft.replace(",", "."));
        if (
          draft.trim() !== "" &&
          (!Number.isFinite(numeric) ||
            numeric <= 0 ||
            toMetres(numeric, unit) > 500)
        ) {
          setError(
            t(
              "Enter a positive distance up to 500 m (546.8 yd).",
              "Introduce una distancia positiva de hasta 500 m (546.8 yd).",
            ),
          );
          return;
        }
        if (draft !== original.current) {
          onSave(draft.trim() === "" ? null : toMetres(numeric, unit));
          original.current = draft;
        }
        setError("");
        setSaved(true);
      }}
    >
      <label htmlFor={id}>
        <span className="club-code">{club.short}</span>
        {club.name[lang]}
        <span className="carry-unit">{unit}</span>
      </label>
      <div className="carry-input-row">
        <input
          id={id}
          inputMode="decimal"
          value={draft}
          placeholder="—"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => {
            setDraft(e.target.value);
            setSaved(false);
            setError("");
          }}
        />
        <button type="submit" className="outline-button">
          {saved ? <Check size={17} /> : null}
          {saved ? t("Saved", "Guardado") : t("Save", "Guardar")}
        </button>
      </div>
      {error && (
        <p role="alert" className="field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
      {saved && (
        <output className="sr-only">
          {t("Carry saved locally", "Vuelo guardado localmente")}
        </output>
      )}
    </form>
  );
}
export function CarryReference({
  club,
  unit,
  lang,
}: {
  club: Club;
  unit: Unit;
  lang: Language;
}) {
  const t = (en: string, es: string) => (lang === "es" ? es : en);
  return (
    <div className="carry-reference">
      <h4>{t("Reference, not a target", "Referencia, no objetivo")}</h4>
      {club.carry ? (
        <>
          <p>
            {club.carry
              .map((n) => Math.round(unit === "yd" ? n : toMetres(n, "yd")))
              .join("–")}{" "}
            {unit}
          </p>
          <small>
            {club.system === "driver"
              ? t(
                  "Illustrative driver carry across different swing speeds, from the supplied research. Not an amateur average.",
                  "Vuelo ilustrativo con driver para distintas velocidades, de la investigación aportada. No es un promedio amateur.",
                )
              : t(
                  "Endpoints reported for female and male 15-handicap golfers in the supplied research, attributed to Shot Scope through secondary reporting. Not a personal range or performance target.",
                  "Extremos reportados para golfistas mujeres y hombres de hándicap 15 en la investigación aportada, atribuidos a Shot Scope por fuentes secundarias. No son un rango personal ni una meta.",
                )}
          </small>
        </>
      ) : (
        <small>
          {t(
            "No comparable carry benchmark verified for this club. Add your measured carry instead.",
            "No hay un vuelo de referencia comparable verificado para este palo. Añade tu vuelo medido.",
          )}
        </small>
      )}
      <a href={`/${lang}/sources/#distances`}>
        {t("How to read these numbers", "Cómo interpretar estas cifras")}
      </a>
    </div>
  );
}
function SourceLink({
  source,
  lang,
}: {
  source: keyof typeof sources;
  lang: Language;
}) {
  return (
    <a
      className="source-link"
      href={sources[source].url}
      target="_blank"
      rel="noreferrer"
    >
      {sources[source].label[lang]} <ArrowRight size={14} />
      <span className="sr-only">
        {lang === "en" ? "(opens in a new tab)" : "(abre en otra pestaña)"}
      </span>
    </a>
  );
}
export function Glossary({
  lang,
  hand = "right",
}: {
  lang: Language;
  hand?: "left" | "right";
}) {
  const t = (en: string, es: string) => (lang === "es" ? es : en);
  const terms = [
    [
      t("Lead / trail", "Delantero / trasero"),
      t(
        `Lead is the target side: your ${hand === "right" ? "left" : "right"} side. Trail is the other side.`,
        `Delantero es el lado del objetivo: tu lado ${hand === "right" ? "izquierdo" : "derecho"}. Trasero es el opuesto.`,
      ),
    ],
    [
      t("Start line / curve", "Salida / curva"),
      t(
        "Start line is the direction immediately after impact. Curve is the later bend in flight, not where it finally lands.",
        "Salida es la dirección justo después del impacto. Curva es el cambio posterior del vuelo, no dónde acaba.",
      ),
    ],
    [
      t("Face / path", "Cara / trayectoria"),
      t(
        "Face is where the striking surface points at impact. Path is the direction the clubhead travels through impact.",
        "Cara es hacia dónde apunta la superficie de golpeo en el impacto. Trayectoria es la dirección en que viaja la cabeza.",
      ),
    ],
    [
      t("Slice / hook", "Slice / hook"),
      t(
        `A slice curves toward your trail side (${hand === "right" ? "right" : "left"}); a hook curves toward your lead side (${hand === "right" ? "left" : "right"}). A gentle intentional version is a fade or draw.`,
        `Un slice curva hacia el lado trasero (${hand === "right" ? "derecha" : "izquierda"}); un hook hacia el delantero (${hand === "right" ? "izquierda" : "derecha"}). Su versión suave e intencional es fade o draw.`,
      ),
    ],
    [
      t("Push / pull", "Push / pull"),
      t(
        "A push starts toward your trail side; a pull starts toward your lead side. Compound names also describe the curve.",
        "Un push sale hacia el lado trasero; un pull hacia el delantero. Los nombres compuestos también describen la curva.",
      ),
    ],
    [
      t("Carry / total", "Vuelo / total"),
      t(
        "Carry ends at the first landing. Total distance also includes bounce and roll.",
        "Vuelo termina en la primera caída. La distancia total también incluye bote y rodada.",
      ),
    ],
    [
      t("Loft / bounce / low point", "Loft / bounce / punto bajo"),
      t(
        "Loft is the face’s upward angle. Bounce is the sole geometry that helps a wedge glide. Low point is the bottom of the swing arc.",
        "Loft es la inclinación hacia arriba de la cara. Bounce es la geometría de la suela que ayuda al wedge a deslizar. Punto bajo es el fondo del arco del swing.",
      ),
    ],
    [
      t("Chip / pitch / lie", "Chip / pitch / lie"),
      t(
        "A chip flies low and rolls farther; a pitch flies higher and rolls less. Lie describes how the ball rests on the ground.",
        "Un chip vuela bajo y rueda más; un pitch vuela alto y rueda menos. Lie describe cómo reposa la bola en el suelo.",
      ),
    ],
  ];
  return (
    <dl className="glossary">
      {terms.map(([term, definition]) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>{definition}</dd>
        </div>
      ))}
    </dl>
  );
}
export function Diagnosis({
  onShowSwing,
  club,
  shot,
  hand,
  lang,
}: {
  onShowSwing: (phase: Phase) => void;
  club: Club;
  shot: Shot;
  hand: "left" | "right";
  lang: Language;
}) {
  const t = (en: string, es: string) => (lang === "es" ? es : en);
  const [start, setStart] = useState<Direction | null>(null),
    [curve, setCurve] = useState<Direction | null>(null),
    [selected, setSelected] = useState<Advice | null>(null),
    [feedback, setFeedback] = useState<boolean | null>(null);
  const putt = club.system === "putter";
  const result =
    selected ??
    (start !== null && (putt || curve !== null)
      ? flightAdvice(start, curve ?? 0, hand, putt)
      : null);
  const resultId = result?.id;
  useEffect(() => {
    if (resultId) {
      track({ type: "diagnosis_completed", kind: resultId });
      setFeedback(null);
    }
  }, [resultId]);
  const reset = () => {
    setStart(null);
    setCurve(null);
    setSelected(null);
    setFeedback(null);
  };
  return (
    <div className="diagnosis">
      <details className="disclosure compact-definition">
        <summary>
          <span>
            <CircleHelp size={17} />
            {t(
              "Start line, curve, slice… what do they mean?",
              "Salida, curva, slice… ¿qué significan?",
            )}
          </span>
          <ChevronDown size={16} />
        </summary>
        <div className="disclosure-body">
          <Glossary lang={lang} hand={hand} />
        </div>
      </details>
      <div className="direction-questions">
        <fieldset>
          <legend>
            <span className="step-number">1</span>
            {t("Where did it start?", "¿Hacia dónde salió?")}
          </legend>
          <p>
            {t(
              "Watch the first part of flight, relative to your target.",
              "Observa la primera parte del vuelo respecto al objetivo.",
            )}
          </p>
          <div>
            {([-1, 0, 1] as Direction[]).map((n) => (
              <button
                type="button"
                key={n}
                aria-pressed={start === n && !selected}
                onClick={() => {
                  setStart(n);
                  setSelected(null);
                }}
              >
                <FlightGlyph direction={n} />
                {directionCopy[String(n)][lang]}
              </button>
            ))}
          </div>
        </fieldset>
        {!putt && (
          <fieldset>
            <legend>
              <span className="step-number">2</span>
              {t("Which way did it curve?", "¿Hacia dónde curvó?")}
            </legend>
            <p>
              {t(
                "Look for the bend after the initial start line.",
                "Busca la curva después de la salida inicial.",
              )}
            </p>
            <div>
              {([-1, 0, 1] as Direction[]).map((n) => (
                <button
                  type="button"
                  key={n}
                  aria-pressed={curve === n && !selected}
                  onClick={() => {
                    setCurve(n);
                    setSelected(null);
                  }}
                >
                  <FlightGlyph direction={n} curve />
                  {n === 0
                    ? t("No curve", "Sin curva")
                    : directionCopy[String(n)][lang]}
                </button>
              ))}
            </div>
          </fieldset>
        )}
      </div>
      <div className="contact-picker">
        <h3>
          {t(
            "Or was it the contact or distance?",
            "¿O fue el contacto o la distancia?",
          )}
        </h3>
        <div className="fault-options">
          {availableFaults(club, shot).map((fault) => (
            <button
              key={fault.id}
              type="button"
              aria-pressed={selected?.id === fault.id}
              onClick={() => setSelected(fault)}
            >
              {fault.title[lang]}
            </button>
          ))}
        </div>
      </div>
      {result ? (
        <section
          className="diagnosis-result"
          aria-label={t("Shot guidance", "Guía del golpe")}
        >
          <div className="result-top">
            <div>
              <span className="result-label">
                {t("Your next-shot note", "Tu nota para el siguiente golpe")}
              </span>
              <h3 aria-live="polite">{result.title[lang]}</h3>
              <p>{result.definition[lang]}</p>
            </div>
            <button type="button" className="text-button" onClick={reset}>
              {t("Start again", "Empezar de nuevo")}
            </button>
          </div>
          <div className="result-spread">
            <div className="result-steps">
              <h4>{t("Try this first", "Prueba esto primero")}</h4>
              <p>{result.fix[lang]}</p>
              <h4>{t("One useful drill", "Un ejercicio útil")}</h4>
              <p>{result.drill[lang]}</p>
            </div>
            {result.diagram === "sequence" ? (
              <button
                type="button"
                className="outline-button"
                onClick={() =>
                  onShowSwing(
                    result.id === "long" || result.id === "short" ? 2 : 3,
                  )
                }
              >
                {t("Show in the swing", "Ver en el swing")}
              </button>
            ) : (
              <GolfDiagram
                kind={result.diagram}
                club={club}
                shot={shot}
                hand={hand}
                lang={lang}
                start={start ?? 0}
                curve={putt ? 0 : (curve ?? 0)}
                fault={result.id}
              />
            )}
          </div>
          <details className="disclosure">
            <summary>
              {t(
                "Understand why & see sources",
                "Entiende por qué y consulta fuentes",
              )}
              <ChevronDown size={17} />
            </summary>
            <div className="disclosure-body">
              <p>{result.why[lang]}</p>
              <p>
                {t(
                  "Try one change for a few balls. If the pattern persists, a coach can check the strike and movement directly.",
                  "Prueba un cambio durante unas bolas. Si el patrón persiste, un instructor puede revisar impacto y movimiento directamente.",
                )}
              </p>
              <SourceLink source={result.source} lang={lang} />
              <Glossary lang={lang} hand={hand} />
            </div>
          </details>
          <div className="helpfulness">
            <span className="helpfulness-question">
              {feedback === null
                ? t(
                    "Did this help your next shot?",
                    "¿Ayudó a tu siguiente golpe?",
                  )
                : t(
                    "Noted for this session. Nothing was sent.",
                    "Anotado para esta sesión. No se envió nada.",
                  )}
            </span>
            {[true, false].map((value) => (
              <button
                type="button"
                key={String(value)}
                aria-pressed={feedback === value}
                onClick={() => {
                  setFeedback(value);
                  track({ type: "helpfulness", helpful: value });
                }}
              >
                {value ? t("Yes", "Sí") : t("Not yet", "Aún no")}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <p className="diagnosis-placeholder">
          {t(
            putt
              ? "Choose the start direction or a distance issue to see your next step."
              : "Choose a start line and curve—or a contact issue—to see your next step.",
            putt
              ? "Elige la salida o un problema de distancia para ver el siguiente paso."
              : "Elige salida y curva, o un problema de contacto, para ver el siguiente paso.",
          )}
        </p>
      )}
    </div>
  );
}
function FlightGlyph({
  direction,
  curve = false,
}: {
  direction: Direction;
  curve?: boolean;
}) {
  return (
    <svg viewBox="0 0 60 42" width="60" height="42" aria-hidden="true">
      <path
        d="M 30 38 V 4"
        stroke="currentColor"
        opacity=".2"
        strokeDasharray="3 4"
      />
      <path
        d={
          curve
            ? `M 30 36 Q 30 13 ${30 + direction * 22} 5`
            : `M 30 36 L ${30 + direction * 18} 5`
        }
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="30" cy="36" r="3" fill="currentColor" />
    </svg>
  );
}
