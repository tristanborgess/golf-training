"use client";

import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Flag,
  Globe2,
  Moon,
  Settings2,
  Sun,
  Target,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import {
  type Drawing,
  drawingNames,
  GolfDiagram,
  phaseNames,
} from "@/components/golf-diagrams";
import {
  type Advice,
  availableFaults,
  type Club,
  clubs,
  type Direction,
  defaults,
  directionCopy,
  flightAdvice,
  fromMetres,
  getSetup,
  isWedge,
  type Language,
  type Preferences,
  parsePreferences,
  type Shot,
  shotNames,
  sources,
  storageKey,
  toMetres,
  track,
  type Unit,
} from "@/lib/golf";

type View = "setup" | "fix" | "bag" | "settings";
type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
const validViews: View[] = ["setup", "fix", "bag", "settings"];

export function RangeNotes({ lang }: { lang: Language }) {
  const t = (en: string, es: string) => (lang === "es" ? es : en);
  const [prefs, setPrefs] = useState<Preferences>({ ...defaults, carries: {} });
  const [loaded, setLoaded] = useState(false),
    [storageError, setStorageError] = useState(false);
  const [view, setView] = useState<View>("setup"),
    [shot, setShot] = useState<Shot>("stock");
  const [drawing, setDrawing] = useState<Drawing>("overhead"),
    [frame, setFrame] = useState(0),
    [grip, setGrip] = useState(1);
  const [offline, setOffline] = useState(false),
    [cacheState, setCacheState] = useState("preparing");
  const [install, setInstall] = useState<InstallPrompt | null>(null),
    [installNote, setInstallNote] = useState(false),
    [resetting, setResetting] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const club = clubs.find((c) => c.id === prefs.club) ?? clubs[7];
  const setup = getSetup(club, shot);
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    try {
      setPrefs(parsePreferences(localStorage.getItem(storageKey)));
    } catch {
      setStorageError(true);
    }
    const requested = new URLSearchParams(location.search).get("view");
    if (validViews.includes(requested as View)) setView(requested as View);
    setLoaded(true);
    const onInstall = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallPrompt);
    };
    const connection = () => setOffline(!navigator.onLine);
    connection();
    window.addEventListener("beforeinstallprompt", onInstall);
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstall);
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
    };
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(prefs));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [prefs, loaded]);
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setCacheState("unavailable");
      return;
    }
    if (process.env.NODE_ENV !== "production") {
      setCacheState("development");
      return;
    }
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled)
        setCacheState((state) => (state === "ready" ? state : "error"));
    }, 45000);
    const query = (worker: ServiceWorker | null) => {
      if (!worker) return;
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        if (!cancelled) setCacheState(event.data?.ready ? "ready" : "error");
        channel.port1.close();
      };
      worker.postMessage({ type: "OFFLINE_STATUS" }, [channel.port2]);
    };
    const controller = () => query(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener("controllerchange", controller);
    navigator.serviceWorker
      .register("/sw.js")
      .then(async (registration) => {
        await navigator.serviceWorker.ready;
        query(registration.active);
      })
      .catch(() => {
        if (!cancelled) setCacheState("error");
      });
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        controller,
      );
    };
  }, []);
  const changeView = (next: View) => {
    setView(next);
    setResetting(false);
    window.history.replaceState(null, "", `/${lang}/?view=${next}`);
  };
  const chooseClub = (id: string) => {
    setPrefs((p) => ({ ...p, club: id }));
    setShot("stock");
    setFrame(0);
    track({ type: "club_selected", club: id });
  };
  const setCarry = (id: string, value: number | null) =>
    setPrefs((p) => {
      const carries = { ...p.carries };
      if (value === null) delete carries[id];
      else carries[id] = value;
      return { ...p, carries };
    });
  const saveForRange = async () => {
    setInstallNote(true);
    if (install) {
      await install.prompt();
      await install.userChoice;
      setInstall(null);
    }
  };
  const readyLabel =
    cacheState === "ready"
      ? t("Ready offline", "Listo sin conexión")
      : cacheState === "preparing"
        ? t("Preparing offline…", "Preparando uso sin conexión…")
        : cacheState === "development"
          ? t(
              "Offline available in production build",
              "Sin conexión disponible en build de producción",
            )
          : t(
              "Offline preparation unavailable — reload online",
              "No se pudo preparar — recarga con conexión",
            );

  return (
    <div className="range-app">
      <a className="skip-link" href="#main-content">
        {t("Skip to the tool", "Ir a la herramienta")}
      </a>
      <header className="site-header">
        <a className="wordmark" href={`/${lang}/`} aria-label="Range Notes">
          <span className="brand-mark">
            <Flag size={22} strokeWidth={1.8} />
          </span>
          <span>
            Range<span className="wordmark-serif">Notes</span>
            <span className="brand-period">.</span>
          </span>
        </a>
        <nav
          aria-label={t("Main navigation", "Navegación principal")}
          className="header-nav"
        >
          <button
            type="button"
            className={view === "bag" ? "nav-link selected" : "nav-link"}
            onClick={() => changeView("bag")}
          >
            <BookOpen size={17} />
            <span>{t("My bag", "Mi bolsa")}</span>
          </button>
          <a className="nav-link source-nav" href={`/${lang}/sources/`}>
            {t("The approach", "El método")}
          </a>
          <a
            className="language-link"
            lang={lang === "en" ? "es" : "en"}
            href={`/${lang === "en" ? "es" : "en"}/?view=${view}`}
            aria-label={t("Cambiar a español", "Switch to English")}
          >
            <Globe2 size={16} />
            {lang === "en" ? "ES" : "EN"}
          </a>
          <button
            type="button"
            className="icon-button"
            onClick={() => changeView("settings")}
            aria-label={t("Settings", "Ajustes")}
          >
            <Settings2 size={19} />
          </button>
        </nav>
      </header>
      <main id="main-content" ref={mainRef} tabIndex={-1}>
        <section className="intro" aria-labelledby="welcome-title">
          <div className="intro-copy">
            <h1 id="welcome-title">
              {t("A little clarity.", "Un poco de claridad.")}
              <br />
              <em>{t("A better next shot.", "Un mejor siguiente golpe.")}</em>
            </h1>
            <p>
              {t(
                "Find your setup. Understand your miss. Take one good thought to the next ball.",
                "Encuentra tu postura. Entiende tu fallo. Lleva una buena idea a la siguiente bola.",
              )}
            </p>
          </div>
          <div className="intro-art">
            <Image
              src="/images/setup-iron.jpg"
              alt={t(
                "Illustrated golfer preparing a shot at a quiet morning range.",
                "Golfista ilustrado preparando un golpe en un campo de práctica al amanecer.",
              )}
              width="1536"
              height="1024"
            />
            <span className="image-note">
              {t(
                "A field guide for your game.",
                "Una guía de campo para tu juego.",
              )}
            </span>
          </div>
        </section>
        <div className="entry-paths">
          <button
            type="button"
            className={`entry-path ${view === "setup" ? "active" : ""}`}
            aria-pressed={view === "setup"}
            onClick={() => changeView("setup")}
          >
            <span className="entry-icon">
              <Flag size={23} />
            </span>
            <span>
              <strong>{t("Set up a club", "Prepara un palo")}</strong>
              <small>
                {t("Start with the fundamentals", "Empieza por lo fundamental")}
              </small>
            </span>
            <ArrowRight size={21} />
          </button>
          <button
            type="button"
            className={`entry-path ${view === "fix" ? "active" : ""}`}
            aria-pressed={view === "fix"}
            onClick={() => changeView("fix")}
          >
            <span className="entry-icon">
              <Target size={24} />
            </span>
            <span>
              <strong>{t("Fix a shot", "Corrige un golpe")}</strong>
              <small>
                {t(
                  "Turn a miss into a useful next step",
                  "Convierte un fallo en un siguiente paso",
                )}
              </small>
            </span>
            <ArrowRight size={21} />
          </button>
        </div>
        {storageError && (
          <output className="notice">
            {t(
              "Your browser cannot save preferences. You can still use the tool; changes will last for this visit only.",
              "Tu navegador no puede guardar preferencias. Puedes usar la herramienta; los cambios durarán solo esta visita.",
            )}
          </output>
        )}
        {offline && (
          <output className="notice">
            <WifiOff size={16} />
            {t(
              "You’re offline. Saved guidance works here; source links need a connection.",
              "Estás sin conexión. Las guías guardadas funcionan; las fuentes necesitan conexión.",
            )}
          </output>
        )}
        {(view === "setup" || view === "fix") && (
          <>
            <section
              className="tool-controls"
              aria-label={t("Practice preferences", "Preferencias de práctica")}
            >
              <label className="mobile-club">
                {t("Your club", "Tu palo")}
                <select
                  value={club.id}
                  onChange={(e) => chooseClub(e.target.value)}
                >
                  {clubs.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name[lang]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="tool-heading">
                <span className="small-label">
                  {t("Your range companion", "Tu compañero de práctica")}
                </span>
                <span>
                  {t("One adjustment at a time.", "Un ajuste a la vez.")}
                </span>
              </div>
              <fieldset className="segmented">
                <legend>{t("Handedness", "Mano dominante")}</legend>
                <button
                  type="button"
                  aria-pressed={prefs.hand === "right"}
                  onClick={() => setPrefs((p) => ({ ...p, hand: "right" }))}
                >
                  {t("Right-handed", "Diestro")}
                </button>
                <button
                  type="button"
                  aria-pressed={prefs.hand === "left"}
                  onClick={() => setPrefs((p) => ({ ...p, hand: "left" }))}
                >
                  {t("Left-handed", "Zurdo")}
                </button>
              </fieldset>
              <UnitControl
                unit={prefs.unit}
                onChange={(unit) => setPrefs((p) => ({ ...p, unit }))}
                lang={lang}
              />
            </section>
            <div className="workbench">
              <aside
                className="club-rail"
                aria-label={t("Choose a club", "Elige un palo")}
              >
                <h2>{t("In the bag", "En la bolsa")}</h2>
                {[...new Set(clubs.map((x) => x.group.en))].map((group) => (
                  <div className="club-group" key={group}>
                    <h3>
                      {clubs.find((x) => x.group.en === group)?.group[lang]}
                    </h3>
                    <div>
                      {clubs
                        .filter((x) => x.group.en === group)
                        .map((item) => (
                          <button
                            type="button"
                            key={item.id}
                            className={
                              item.id === club.id
                                ? "club-option current"
                                : "club-option"
                            }
                            aria-pressed={item.id === club.id}
                            onClick={() => chooseClub(item.id)}
                          >
                            <span className="club-code">{item.short}</span>
                            <span>{item.name[lang]}</span>
                            {item.id === club.id && (
                              <span
                                className="club-selected"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
                <button
                  className="text-button rail-bag"
                  type="button"
                  onClick={() => changeView("bag")}
                >
                  {t("Set up my bag", "Configura mi bolsa")}
                  <ArrowRight size={16} />
                </button>
              </aside>
              <section className="practice-panel">
                <div className="club-title">
                  <div>
                    <h2>
                      {view === "setup"
                        ? club.name[lang]
                        : t("Let’s read that shot.", "Leamos ese golpe.")}
                    </h2>
                    <p>
                      {view === "setup"
                        ? club.use[lang]
                        : `${club.name[lang]} · ${t("What happened to the ball?", "¿Qué pasó con la bola?")}`}
                    </p>
                  </div>
                  <span className="loft-label">
                    {club.loft}
                    <small>loft</small>
                  </span>
                </div>
                {isWedge(club) && (
                  <fieldset className="shot-options">
                    <legend>{t("Shot type", "Tipo de golpe")}</legend>
                    {Object.entries(shotNames).map(([key, name]) => (
                      <button
                        type="button"
                        key={key}
                        aria-pressed={shot === key}
                        onClick={() => {
                          setShot(key as Shot);
                          setFrame(0);
                        }}
                      >
                        {name[lang]}
                      </button>
                    ))}
                  </fieldset>
                )}
                {view === "setup" ? (
                  <>
                    <div className="drawing-tabs">
                      {(Object.keys(drawingNames) as Drawing[]).map((kind) => (
                        <button
                          key={kind}
                          type="button"
                          aria-pressed={drawing === kind}
                          onClick={() => setDrawing(kind)}
                        >
                          {drawingNames[kind][lang]}
                        </button>
                      ))}
                    </div>
                    <div className="instruction-spread">
                      <div className="drawing-panel">
                        <GolfDiagram
                          kind={drawing}
                          club={club}
                          hand={prefs.hand}
                          lang={lang}
                          shot={shot}
                          frame={frame}
                          grip={grip}
                        />
                        {drawing === "sequence" && (
                          <div className="frame-controls">
                            <button
                              type="button"
                              aria-label={t("Previous phase", "Fase anterior")}
                              disabled={frame === 0}
                              onClick={() => setFrame((f) => f - 1)}
                            >
                              <ArrowLeft size={17} />
                            </button>
                            {phaseNames.map((phase, n) => (
                              <button
                                key={phase.en}
                                type="button"
                                aria-pressed={frame === n}
                                onClick={() => setFrame(n)}
                              >
                                <span>{n + 1}</span>
                                <small>{phase[lang]}</small>
                              </button>
                            ))}
                            <button
                              type="button"
                              aria-label={t("Next phase", "Siguiente fase")}
                              disabled={frame === 4}
                              onClick={() => setFrame((f) => f + 1)}
                            >
                              <ArrowRight size={17} />
                            </button>
                          </div>
                        )}
                        {drawing === "grip" && (
                          <>
                            <div className="grip-controls">
                              {[
                                t("Weak", "Débil"),
                                t("Neutral", "Neutro"),
                                t("Strong", "Fuerte"),
                              ].map((label, n) => (
                                <button
                                  key={label}
                                  type="button"
                                  aria-pressed={grip === n}
                                  onClick={() => setGrip(n)}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            {club.system === "putter" && (
                              <p className="diagram-extra">
                                {setup.grip[lang]}{" "}
                                {t(
                                  "The diagram compares lead-hand rotation for full swings; putting uses its own grip style.",
                                  "El dibujo compara rotación para swings completos; el putt usa su propio agarre.",
                                )}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      <div className="setup-checklist">
                        <h3>{t("Before you swing", "Antes del swing")}</h3>
                        {[
                          {
                            label: t("Build your base", "Construye tu base"),
                            value: setup.stance,
                          },
                          {
                            label: t("Place the ball", "Coloca la bola"),
                            value: setup.position,
                          },
                          {
                            label: t(
                              "Find your balance",
                              "Encuentra equilibrio",
                            ),
                            value: setup.posture,
                          },
                        ].map((item, n) => (
                          <div className="checkpoint" key={item.label}>
                            <span>{n + 1}</span>
                            <div>
                              <h4>{item.label}</h4>
                              <p>{item.value[lang]}</p>
                            </div>
                          </div>
                        ))}
                        <div className="swing-thought">
                          <span>
                            {t(
                              "Your one swing thought",
                              "Tu idea para el swing",
                            )}
                          </span>
                          <p>{setup.intent[lang]}</p>
                        </div>
                      </div>
                    </div>
                    <details className="disclosure editorial-reference">
                      <summary>
                        {t(
                          "See the setup illustration",
                          "Ver la ilustración de postura",
                        )}
                        <ChevronDown size={18} />
                      </summary>
                      <div className="disclosure-body">
                        <Image
                          className={
                            prefs.hand === "left" ? "mirrored-illustration" : ""
                          }
                          src={
                            club.system === "driver"
                              ? "/images/setup-driver-v2.jpg"
                              : club.system === "putter"
                                ? "/images/setup-putter-v2.jpg"
                                : isWedge(club)
                                  ? "/images/setup-wedge-v2.jpg"
                                  : "/images/setup-iron.jpg"
                          }
                          alt={t(
                            "The Range Notes golfer at address; a broad editorial reference, not a measured technical diagram.",
                            "El golfista de Range Notes en colocación; referencia editorial general, no un dibujo técnico medido.",
                          )}
                          width={1536}
                          height={1024}
                        />
                        <p>
                          {t(
                            "Illustrative address only. The wedge image shows a stock shot, not a chip or bunker splash. Use the technical views for your selected shot.",
                            "Colocación ilustrativa. El wedge muestra un golpe normal, no chip ni bunker. Usa las vistas técnicas para tu golpe elegido.",
                          )}
                        </p>
                      </div>
                    </details>
                    <div className="setup-detail-grid">
                      <details className="disclosure">
                        <summary>
                          {t(
                            "Grip, rhythm & pressure",
                            "Agarre, ritmo y presión",
                          )}
                          <ChevronDown size={18} />
                        </summary>
                        <div className="disclosure-body">
                          <h3>{t("Grip", "Agarre")}</h3>
                          <p>{setup.grip[lang]}</p>
                          <h3>{t("Rhythm", "Ritmo")}</h3>
                          <p>{setup.tempo[lang]}</p>
                          <h3>
                            {t("Pressure at address", "Presión al colocarte")}
                          </h3>
                          <p>
                            {t(
                              `Around ${setup.leadPressure}% lead-side is a starting feel, not a measurement to force. Keep your balance comfortable.`,
                              `Alrededor de ${setup.leadPressure}% delante es una sensación inicial, no una medida que debas forzar. Mantén un equilibrio cómodo.`,
                            )}
                          </p>
                          <SourceLink source="grip" lang={lang} />
                          <SourceLink source="flight" lang={lang} />
                        </div>
                      </details>
                      <details className="disclosure">
                        <summary>
                          {t(
                            "My carry & reference distances",
                            "Mi vuelo y distancias de referencia",
                          )}
                          <ChevronDown size={18} />
                        </summary>
                        <div className="disclosure-body">
                          {club.system === "putter" ? (
                            <p>
                              {t(
                                "For putting, record no carry. Practice roll and pace with a ladder of targets.",
                                "En putting no se registra vuelo. Practica rodada y velocidad con objetivos progresivos.",
                              )}
                            </p>
                          ) : (
                            <>
                              <CarryField
                                key={`${club.id}-${prefs.unit}`}
                                club={club}
                                value={prefs.carries[club.id]}
                                unit={prefs.unit}
                                lang={lang}
                                onSave={(value) => setCarry(club.id, value)}
                              />
                              <CarryReference
                                club={club}
                                unit={prefs.unit}
                                lang={lang}
                              />
                            </>
                          )}
                        </div>
                      </details>
                    </div>
                    <details className="disclosure definitions">
                      <summary>
                        <span>
                          <CircleHelp size={17} />
                          {t("Understand the terms", "Entiende los términos")}
                        </span>
                        <ChevronDown size={18} />
                      </summary>
                      <div className="disclosure-body">
                        <Glossary lang={lang} hand={prefs.hand} />
                        <a href={`/${lang}/sources/`}>
                          {t(
                            "Methodology and all sources",
                            "Método y todas las fuentes",
                          )}{" "}
                          <ArrowRight size={15} />
                        </a>
                      </div>
                    </details>
                  </>
                ) : (
                  <Diagnosis
                    key={`${club.id}-${shot}`}
                    club={club}
                    shot={shot}
                    hand={prefs.hand}
                    lang={lang}
                  />
                )}
              </section>
            </div>
          </>
        )}
        {view === "bag" && (
          <section className="standalone-panel">
            <div className="section-heading">
              <div>
                <h2>
                  {t("Your bag. Your distances.", "Tu bolsa. Tus distancias.")}
                </h2>
                <p>
                  {t(
                    "Carry is the distance before the first bounce. Use a typical solid strike—not your longest.",
                    "Vuelo es la distancia antes del primer bote. Usa un impacto sólido típico, no el más largo.",
                  )}
                </p>
              </div>
              <UnitControl
                unit={prefs.unit}
                onChange={(unit) => setPrefs((p) => ({ ...p, unit }))}
                lang={lang}
              />
            </div>
            <p className="privacy-line">
              {t(
                "Saved only in this browser. Blank means you have not measured it yet.",
                "Guardado solo en este navegador. Vacío significa que aún no lo has medido.",
              )}
            </p>
            <div className="bag-grid">
              {clubs
                .filter((club) => club.system !== "putter")
                .map((club) => (
                  <CarryField
                    key={`${club.id}-${prefs.unit}`}
                    club={club}
                    unit={prefs.unit}
                    value={prefs.carries[club.id]}
                    lang={lang}
                    onSave={(value) => setCarry(club.id, value)}
                  />
                ))}
            </div>
          </section>
        )}
        {view === "settings" && (
          <section className="standalone-panel settings-panel">
            <h2>{t("Make it yours.", "A tu manera.")}</h2>
            <p>
              {t(
                "A few preferences for wherever you practice.",
                "Algunas preferencias para donde sea que practiques.",
              )}
            </p>
            <div className="setting-row">
              <div>
                <h3>{t("Appearance", "Apariencia")}</h3>
                <p>
                  {t(
                    "Light for bright days. Dark for evening practice.",
                    "Claro para días luminosos. Oscuro para practicar de noche.",
                  )}
                </p>
              </div>
              <div className="theme-controls">
                <button
                  type="button"
                  aria-pressed={!loaded || resolvedTheme !== "dark"}
                  onClick={() => setTheme("light")}
                >
                  <Sun size={17} />
                  {t("Light", "Claro")}
                </button>
                <button
                  type="button"
                  aria-pressed={loaded && resolvedTheme === "dark"}
                  onClick={() => setTheme("dark")}
                >
                  <Moon size={17} />
                  {t("Dark", "Oscuro")}
                </button>
              </div>
            </div>
            <div className="setting-row">
              <div>
                <h3>{t("Distance units", "Unidades de distancia")}</h3>
                <p>
                  {t(
                    "Your saved carries convert automatically.",
                    "Tus vuelos guardados se convierten automáticamente.",
                  )}
                </p>
              </div>
              <UnitControl
                unit={prefs.unit}
                onChange={(unit) => setPrefs((p) => ({ ...p, unit }))}
                lang={lang}
              />
            </div>
            <div className="setting-row">
              <div>
                <h3>{t("Save for the range", "Guarda para practicar")}</h3>
                <output>{readyLabel}</output>
              </div>
              <button
                type="button"
                className="outline-button"
                onClick={saveForRange}
              >
                <ArrowDownToLine size={17} />
                {t("Save for the range", "Guarda para practicar")}
              </button>
            </div>
            {installNote && (
              <div className="notice">
                <p>
                  {t(
                    "On iPhone or iPad: Share → Add to Home Screen. On Android or desktop: use your browser’s Install app option when available. Wait for “Ready offline” before leaving your connection.",
                    "En iPhone o iPad: Compartir → Añadir a pantalla de inicio. En Android o escritorio: usa Instalar aplicación si está disponible. Espera a “Listo sin conexión” antes de desconectarte.",
                  )}
                </p>
                {cacheState === "error" && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => location.reload()}
                  >
                    {t("Try again online", "Reintentar con conexión")}
                  </button>
                )}
              </div>
            )}
            <div className="setting-row">
              <div>
                <h3>{t("Your data stays here", "Tus datos se quedan aquí")}</h3>
                <p>
                  {t(
                    "No accounts or tracking requests. Carries and preferences stay on this device. Clearing site data removes them.",
                    "Sin cuentas ni solicitudes de rastreo. Vuelos y preferencias quedan en este dispositivo. Borrar los datos del sitio los elimina.",
                  )}
                </p>
              </div>
              <button
                type="button"
                className="text-button"
                onClick={() => setResetting(true)}
              >
                {t("Reset preferences", "Restablecer preferencias")}
              </button>
            </div>
            {resetting && (
              <div className="notice">
                <p>
                  {t(
                    "Remove all saved carries and restore the default club, hand, units and light theme?",
                    "¿Eliminar todos los vuelos y restaurar palo, mano, unidades y tema claro?",
                  )}
                </p>
                <button
                  type="button"
                  className="solid-button"
                  onClick={() => {
                    setPrefs({ ...defaults, carries: {} });
                    setTheme("light");
                    setResetting(false);
                  }}
                >
                  {t("Reset this device", "Restablecer este dispositivo")}
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setResetting(false)}
                >
                  {t("Cancel", "Cancelar")}
                </button>
              </div>
            )}
          </section>
        )}
      </main>
      <footer className="site-footer">
        <div>
          <span className="footer-brand">Range Notes.</span>
          <p>
            {t(
              "One ball. One thought. Go again.",
              "Una bola. Una idea. Otra vez.",
            )}
          </p>
        </div>
        <div>
          <a href={`/${lang}/sources/`}>
            {t("Methodology & sources", "Método y fuentes")}
          </a>
          <p>
            {t(
              "General educational guidance. Warm up, move comfortably and stop if you feel pain.",
              "Guía educativa general. Calienta, muévete cómodamente y detente si sientes dolor.",
            )}
          </p>
          <span className="offline-status">
            {cacheState === "ready" ? <Check size={13} /> : <span />}
            {readyLabel}
          </span>
        </div>
      </footer>
    </div>
  );
}

function UnitControl({
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

function CarryField({
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
function CarryReference({
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
function Diagnosis({
  club,
  shot,
  hand,
  lang,
}: {
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
            <GolfDiagram
              kind={result.diagram}
              club={club}
              shot={shot}
              hand={hand}
              lang={lang}
              start={start ?? 0}
              curve={putt ? 0 : (curve ?? 0)}
              fault={result.id}
              frame={3}
            />
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
