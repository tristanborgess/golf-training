import { ArrowLeft, ArrowUpRight, Flag } from "lucide-react";
import { Glossary } from "@/components/range-details";
import { type Language, sources } from "@/lib/golf";

export default async function SourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = locale as Language;
  const t = (en: string, es: string) => (lang === "es" ? es : en);
  const notes = {
    flight: t(
      "Ball-flight fundamentals: face angle, club path, contact and carry. Centered-contact assumptions matter.",
      "Fundamentos del vuelo: ángulo de cara, trayectoria, contacto y vuelo. Importa la suposición de impacto centrado.",
    ),
    strike: t(
      "Iron contact and low-point practice. Not a diagnosis of every thin, heavy or hosel strike.",
      "Contacto con hierros y práctica del punto bajo. No diagnostica todo golpe delgado, pesado o de hosel.",
    ),
    bunker: t(
      "Greenside bunker starting points, with adjustments for different sand and lies.",
      "Referencias para bunker junto al green, con ajustes según arena y lie.",
    ),
    practice: t(
      "Practical putting, chipping and bunker exercises. Our short drills are editorial adaptations, not direct quotations.",
      "Ejercicios de putt, chip y bunker. Nuestros ejercicios breves son adaptaciones editoriales, no citas literales.",
    ),
    grip: t(
      "Neutral grip and clubface awareness. Knuckle counts are a visual reference, not an anatomical rule.",
      "Agarre neutro y conciencia de la cara. Los nudillos son una referencia visual, no una regla anatómica.",
    ),
  };
  return (
    <div className="range-app">
      <a className="skip-link" href="#main-content">
        {t("Skip to content", "Ir al contenido")}
      </a>
      <header className="site-header">
        <a className="wordmark" href={`/${lang}/`}>
          <span className="brand-mark">
            <Flag size={22} />
          </span>
          <span>
            Range<span className="wordmark-serif">Notes</span>.
          </span>
        </a>
        <a
          className="language-link"
          href={`/${lang === "en" ? "es" : "en"}/sources/`}
          lang={lang === "en" ? "es" : "en"}
        >
          {lang === "en" ? "ES" : "EN"}
        </a>
      </header>
      <main className="methodology" id="main-content">
        <a className="source-back" href={`/${lang}/`}>
          <ArrowLeft size={16} />
          {t("Back to your next shot", "Vuelve a tu siguiente golpe")}
        </a>
        <h1>
          {t("A useful starting point.", "Un punto de partida útil.")}
          <br />
          {t("Not the final word.", "No la última palabra.")}
        </h1>
        <p>
          {t(
            "Range Notes is a field guide for the moments between shots. It helps you check your setup, describe what the ball did, and try one manageable adjustment. It cannot watch your swing or establish a personal diagnosis.",
            "Range Notes es una guía para los momentos entre golpes. Te ayuda a revisar la postura, describir qué hizo la bola y probar un ajuste manejable. No puede observar tu swing ni establecer un diagnóstico personal.",
          )}
        </p>
        <h2>{t("How we use evidence", "Cómo usamos la evidencia")}</h2>
        <p>
          {t(
            "Two supplied research reports informed the initial scope. They are reference material, not authority on their own. The links below ground the main principles; wording, checkpoints, simplified drawings and drill adaptations are our editorial synthesis. No professional endorsement or independent coaching review is claimed.",
            "Dos informes de investigación aportados orientaron el alcance inicial. Son referencias, no autoridad por sí mismos. Los enlaces de abajo sustentan los principios principales; texto, puntos de control, dibujos simplificados y adaptaciones de ejercicios son nuestra síntesis editorial. No se afirma aval profesional ni revisión independiente por un instructor.",
          )}
        </p>
        <p>
          {t(
            "Ball flight suggests impact conditions, not a unique body movement. Face-and-path guidance assumes reasonably centered contact. Wind, slope, lie and off-center impact—especially with woods—can change the result. Left and right always describe what you saw; push, pull, slice and hook depend on handedness.",
            "El vuelo sugiere condiciones de impacto, no un movimiento corporal único. Las indicaciones de cara y trayectoria suponen un impacto razonablemente centrado. Viento, pendiente, lie e impactos descentrados, especialmente con maderas, pueden cambiar el resultado. Izquierda y derecha siempre describen lo observado; push, pull, slice y hook dependen de la mano dominante.",
          )}
        </p>
        <p>
          {t(
            "Setup positions, pressure percentages and rhythm ratios are starting references, not universal measurements. Adjust for your proportions, equipment and comfortable motion. Editorial golfer images illustrate the atmosphere and broad setup; use the labeled technical views for detail.",
            "Posiciones, porcentajes de presión y ritmos son referencias iniciales, no medidas universales. Ajusta según tus proporciones, equipo y movimiento cómodo. Las ilustraciones muestran el ambiente y la postura general; usa las vistas técnicas rotuladas para el detalle.",
          )}
        </p>
        <h2>{t("Sources you can inspect", "Fuentes que puedes consultar")}</h2>
        <ul className="source-list">
          {Object.entries(sources).map(([id, source]) => (
            <li key={id}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label[lang]} <ArrowUpRight size={14} />
                <span className="sr-only">
                  {t("(opens in a new tab)", "(abre en otra pestaña)")}
                </span>
              </a>
              <p>{notes[id as keyof typeof notes]}</p>
            </li>
          ))}
        </ul>
        <h2 id="distances">
          {t("Distances are not a scorecard", "Las distancias no te califican")}
        </h2>
        <p>
          {t(
            "Your measured carry is more useful than a population average. Carry stops at first landing; total also includes bounce and roll. Save a typical solid strike, not your longest. We store the original value in metres and convert only for display, so repeated unit changes do not change it.",
            "Tu vuelo medido es más útil que un promedio. Vuelo termina en la primera caída; total incluye bote y rodada. Guarda un impacto sólido típico, no el más largo. Guardamos el valor original en metros y lo convertimos solo para mostrarlo; cambiar unidades no lo modifica.",
          )}
        </p>
        <p>
          {t(
            "Optional reference numbers come from the supplied research brief. Iron and wedge endpoints were attributed there to Shot Scope data for female and male 15-handicap golfers via secondary reporting. Driver examples span swing speeds. These are not personal prediction intervals, targets, or independently verified current averages; some clubs have no comparable benchmark.",
            "Las referencias opcionales provienen del informe aportado. Los extremos de hierros y wedges se atribuyeron a datos de Shot Scope para mujeres y hombres de hándicap 15 mediante fuentes secundarias. Los ejemplos de driver abarcan distintas velocidades. No son intervalos de predicción personal, metas ni promedios actuales verificados independientemente; algunos palos no tienen referencia comparable.",
          )}
        </p>
        <h2>{t("Practice comfortably", "Practica con comodidad")}</h2>
        <p>
          {t(
            "This is general golf education, not individualized coaching or medical advice. Warm up, use a comfortable range of motion and stop if you feel pain. Keep sticks, tees and other practice aids safely clear of your swing and nearby players. Use line-in-sand drills only in practice areas. Persistent misses are a reason to work with a qualified golf coach; pain is a reason to seek appropriate healthcare.",
            "Esto es educación general de golf, no instrucción individual ni consejo médico. Calienta, usa un rango de movimiento cómodo y detente si sientes dolor. Mantén varillas, tees y otros apoyos lejos del swing y de otros jugadores. Usa ejercicios con líneas en la arena solo en zonas de práctica. Los fallos persistentes justifican acudir a un instructor; el dolor, buscar atención de salud adecuada.",
          )}
        </p>
        <h2>
          {t("Small footprint. Your device.", "Poco equipaje. Tu dispositivo.")}
        </h2>
        <p>
          {t(
            "Carries and preferences stay in this browser. There are no accounts, uploads, remote analytics or diagnosis histories. Feedback is temporary and sends nothing. Clear your data in Settings or your browser. Offline access works after “Ready offline” appears; external source links still need a connection. Browser storage can be evicted, so keep a separate copy of important distances.",
            "Vuelos y preferencias quedan en este navegador. No hay cuentas, subidas, analítica remota ni historiales de diagnóstico. La valoración es temporal y no envía nada. Borra tus datos en Ajustes o en el navegador. El uso sin conexión funciona cuando aparece “Listo sin conexión”; los enlaces externos aún necesitan conexión. El navegador puede eliminar almacenamiento, así que conserva aparte tus distancias importantes.",
          )}
        </p>
        <h2>{t("A shared vocabulary", "Un vocabulario común")}</h2>
        <Glossary lang={lang} />
      </main>
    </div>
  );
}
