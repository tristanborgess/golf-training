"use client";
import { ChevronRight } from "lucide-react";
import { clubs, type Language } from "@/lib/golf";
import { DetailModal } from "./detail-modals";
export type Detail =
  | "viewer"
  | "setup"
  | "grip"
  | "impact"
  | "flight"
  | "carry"
  | "fix"
  | "bag"
  | "settings";
export const detailNames = {
  viewer: { en: "Swing", es: "Swing" },
  setup: { en: "Setup checklist", es: "Lista de postura" },
  grip: { en: "Grip", es: "Agarre" },
  impact: { en: "Contact", es: "Contacto" },
  flight: { en: "Face and path", es: "Cara y trayectoria" },
  carry: { en: "Carry", es: "Vuelo" },
  fix: { en: "Fix a shot", es: "Corrige un golpe" },
  bag: { en: "Your bag", es: "Tu bolsa" },
  settings: { en: "Settings", es: "Ajustes" },
};
export function MenuSheet({
  open,
  onClose,
  lang,
  club,
  onClub,
  onDetail,
}: {
  open: boolean;
  onClose: () => void;
  lang: Language;
  club: string;
  onClub: (id: string) => void;
  onDetail: (detail: Detail) => void;
}) {
  return (
    <DetailModal
      open={open}
      onClose={onClose}
      title={lang === "en" ? "Menu" : "Menú"}
      lang={lang}
      sheet
    >
      <section className="menu-section">
        <h3>{lang === "en" ? "Club" : "Palo"}</h3>
        {[...new Set(clubs.map((c) => c.group.en))].map((group) => (
          <div className="menu-clubs" key={group}>
            <h4>{clubs.find((c) => c.group.en === group)?.group[lang]}</h4>
            {clubs
              .filter((c) => c.group.en === group)
              .map((c) => (
                <button
                  type="button"
                  key={c.id}
                  aria-pressed={club === c.id}
                  onClick={() => {
                    onClub(c.id);
                    onClose();
                  }}
                >
                  <span>{c.short}</span>
                  {c.name[lang]}
                </button>
              ))}
          </div>
        ))}
      </section>
      <section className="menu-section">
        <h3>{lang === "en" ? "This swing" : "Este swing"}</h3>
        {(["setup", "grip", "impact", "flight", "carry"] as Detail[]).map(
          (d) => (
            <button
              type="button"
              className="menu-row"
              key={d}
              onClick={() => onDetail(d)}
            >
              {detailNames[d][lang]}
              <ChevronRight size={17} />
            </button>
          ),
        )}
      </section>
      <section className="menu-section">
        {(["fix", "bag", "settings"] as Detail[]).map((d) => (
          <button
            type="button"
            className="menu-row"
            key={d}
            onClick={() => onDetail(d)}
          >
            {detailNames[d][lang]}
            <ChevronRight size={17} />
          </button>
        ))}
        <a className="menu-row" href={`/${lang}/sources/`}>
          {lang === "en" ? "The approach" : "El método"}
          <ChevronRight size={17} />
        </a>
        <a
          className="menu-row"
          href={`/${lang === "en" ? "es" : "en"}/`}
          lang={lang === "en" ? "es" : "en"}
        >
          {lang === "en" ? "Español" : "English"}
        </a>
      </section>
      <p className="menu-disclaimer">
        {lang === "en"
          ? "General educational guidance. Warm up, move comfortably and stop if you feel pain."
          : "Guía educativa general. Calienta, muévete cómodamente y detente si sientes dolor."}
      </p>
    </DetailModal>
  );
}
