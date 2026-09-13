"use client";

import {
  ArrowDownToLine,
  Check,
  Flag,
  Menu,
  Moon,
  Sun,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  type Drawing,
  drawingNames,
  GolfDiagram,
} from "@/components/golf-diagrams";
import {
  clubs,
  defaults,
  getSetup,
  isWedge,
  type Language,
  type Preferences,
  parsePreferences,
  type Shot,
  storageKey,
  track,
} from "@/lib/golf";
import type { Phase } from "@/lib/swing";
import { DetailModal } from "./detail-modals";
import { type Detail, detailNames, MenuSheet } from "./menu-sheet";
import {
  CarryField,
  CarryReference,
  Diagnosis,
  Glossary,
  UnitControl,
} from "./range-details";
import { SwingViewer } from "./swing-viewer/swing-viewer";

type View = Detail;
type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
const validViews: View[] = [
  "viewer",
  "setup",
  "fix",
  "bag",
  "settings",
  "grip",
  "impact",
  "flight",
  "carry",
];

export function RangeNotes({ lang }: { lang: Language }) {
  const t = (en: string, es: string) => (lang === "es" ? es : en);
  const [prefs, setPrefs] = useState<Preferences>({ ...defaults, carries: {} });
  const [loaded, setLoaded] = useState(false),
    [storageError, setStorageError] = useState(false);
  const [view, setView] = useState<View>("viewer"),
    [shot, setShot] = useState<Shot>("stock");
  const [drawing, setDrawing] = useState<Drawing>("overhead"),
    [grip, setGrip] = useState(1);
  const [offline, setOffline] = useState(false),
    [cacheState, setCacheState] = useState("preparing");
  const [install, setInstall] = useState<InstallPrompt | null>(null),
    [installNote, setInstallNote] = useState(false),
    [resetting, setResetting] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const club = clubs.find((c) => c.id === prefs.club) ?? clubs[7];
  const setup = getSetup(club, shot);
  const [menu, setMenu] = useState(false);
  const [poseRequest, setPoseRequest] = useState<{
    phase: Phase;
    nonce: number;
  }>({ phase: 0, nonce: 0 });
  useEffect(() => {
    try {
      const parsed = parsePreferences(localStorage.getItem(storageKey));
      const params = new URLSearchParams(location.search);
      const requestedClub = params.get("club"),
        look = params.get("look");
      if (requestedClub && clubs.some((c) => c.id === requestedClub))
        parsed.club = requestedClub;
      if (["front", "side", "top", "back"].includes(look ?? ""))
        parsed.look = look as Preferences["look"];
      if (
        !localStorage.getItem(storageKey) &&
        matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        parsed.speed = 0.5;
      setPrefs(parsed);
      const phase = Number(params.get("phase"));
      if (Number.isInteger(phase) && phase >= 0 && phase <= 4)
        setPoseRequest({ phase: phase as Phase, nonce: 1 });
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
    setMenu(false);
    const url = new URL(location.href);
    url.searchParams.set("view", next);
    window.history.replaceState(null, "", url);
  };
  const chooseClub = (id: string) => {
    setPrefs((p) => ({ ...p, club: id }));
    setShot("stock");

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
    <div className="range-app viewer-app">
      <a className="skip-link" href="#main-content">
        {t("Skip to the tool", "Ir a la herramienta")}
      </a>
      <header className="site-header">
        <a className="wordmark" href={`/${lang}/`} aria-label="Range Notes">
          <span className="brand-mark">
            <Flag size={22} />
          </span>
          <span>
            Range<span className="wordmark-serif">Notes</span>
            <span className="brand-period">.</span>
          </span>
        </a>
        <button
          type="button"
          className="icon-button"
          onClick={() => setMenu(true)}
          id="range-menu"
          aria-label={t("Menu", "Menú")}
        >
          <Menu size={23} />
        </button>
      </header>
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
      <main id="main-content" tabIndex={-1}>
        <h1 className="sr-only">
          {t("Explore your swing", "Explora tu swing")}
        </h1>
        <SwingViewer
          initialized={loaded}
          club={club}
          shot={shot}
          hand={prefs.hand}
          lang={lang}
          overlays={prefs.overlays}
          look={prefs.look}
          speed={prefs.speed}
          poseRequest={poseRequest}
          onMenu={() => setMenu(true)}
          onShot={setShot}
          onPreferences={(patch) => setPrefs((p) => ({ ...p, ...patch }))}
        />
      </main>
      <MenuSheet
        open={menu}
        onClose={() => setMenu(false)}
        lang={lang}
        club={club.id}
        onClub={chooseClub}
        onDetail={changeView}
      />
      <DetailModal
        open={view !== "viewer"}
        onClose={() => changeView("viewer")}
        title={detailNames[view][lang]}
        lang={lang}
      >
        {view === "fix" && (
          <Diagnosis
            key={`${club.id}-${shot}`}
            club={club}
            shot={shot}
            hand={prefs.hand}
            lang={lang}
            onShowSwing={(phase) => {
              setPrefs((p) => ({
                ...p,
                overlays: { ...p.overlays, skeleton: true },
              }));
              setPoseRequest((p) => ({ phase, nonce: p.nonce + 1 }));
              changeView("viewer");
            }}
          />
        )}
        {["setup", "grip", "impact", "flight"].includes(view) && (
          <>
            {view === "setup" && (
              <div className="drawing-tabs">
                {(["overhead", "face", "line"] as Drawing[]).map((d) => (
                  <button
                    type="button"
                    key={d}
                    aria-pressed={drawing === d}
                    onClick={() => setDrawing(d)}
                  >
                    {drawingNames[d][lang]}
                  </button>
                ))}
              </div>
            )}
            <GolfDiagram
              kind={view === "setup" ? drawing : (view as Drawing)}
              club={club}
              shot={shot}
              hand={prefs.hand}
              lang={lang}
              grip={grip}
            />
            {view === "grip" && (
              <>
                <div className="grip-controls">
                  {[
                    t("Weak", "Débil"),
                    t("Neutral", "Neutro"),
                    t("Strong", "Fuerte"),
                  ].map((label, n) => (
                    <button
                      type="button"
                      key={label}
                      aria-pressed={grip === n}
                      onClick={() => setGrip(n)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p>{setup.grip[lang]}</p>
              </>
            )}
            {view === "setup" && (
              <>
                <dl className="full-checklist">
                  {[
                    [t("Stance", "Postura"), setup.stance[lang]],
                    [
                      t("Ball position", "Posición de bola"),
                      setup.position[lang],
                    ],
                    [t("Posture", "Inclinación"), setup.posture[lang]],
                    [
                      t("Pressure", "Presión"),
                      t(
                        `Around ${setup.leadPressure}% lead-side. Authored coaching model, not a measurement.`,
                        `Alrededor de ${setup.leadPressure}% delante. Modelo didáctico, no una medición.`,
                      ),
                    ],
                    [t("Grip", "Agarre"), setup.grip[lang]],
                    [t("Tempo", "Ritmo"), setup.tempo[lang]],
                    [t("Intent", "Intención"), setup.intent[lang]],
                    [t("Use", "Uso"), club.use[lang]],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <details className="disclosure">
                  <summary>
                    {t(
                      "See the setup illustration",
                      "Ver la ilustración de postura",
                    )}
                  </summary>
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
                    width={1536}
                    height={1024}
                    alt={t(
                      "Illustrative address, not a measured technical diagram.",
                      "Colocación ilustrativa, no un dibujo técnico medido.",
                    )}
                  />
                </details>
                <details className="disclosure">
                  <summary>
                    {t("Understand the terms", "Entiende los términos")}
                  </summary>
                  <Glossary lang={lang} hand={prefs.hand} />
                </details>
              </>
            )}
          </>
        )}
        {view === "carry" &&
          (club.system === "putter" ? (
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
              <CarryReference club={club} unit={prefs.unit} lang={lang} />
            </>
          ))}
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
              <h3>{t("Handedness", "Mano dominante")}</h3>
              <div className="theme-controls">
                {(["right", "left"] as const).map((hand) => (
                  <button
                    type="button"
                    key={hand}
                    aria-pressed={prefs.hand === hand}
                    onClick={() => setPrefs((p) => ({ ...p, hand }))}
                  >
                    {hand === "right"
                      ? t("Right-handed", "Diestro")
                      : t("Left-handed", "Zurdo")}
                  </button>
                ))}
              </div>
            </div>
            <div className="setting-row">
              <h3>{t("Language", "Idioma")}</h3>
              <a
                href={`/${lang === "en" ? "es" : "en"}/?view=settings`}
                lang={lang === "en" ? "es" : "en"}
              >
                {lang === "en" ? "Español" : "English"}
              </a>
            </div>
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
      </DetailModal>
      <span className="offline-status viewer-offline">
        {cacheState === "ready" && <Check size={13} />} {readyLabel}
      </span>
    </div>
  );
}
