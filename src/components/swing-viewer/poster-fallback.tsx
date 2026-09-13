"use client";
import Image from "next/image";
import type { Language } from "@/lib/golf";
import type { Player } from "./player-store";
import { useSwingPlayer } from "./use-swing-player";
export function PosterFallback({
  player,
  hand,
  label,
  lang,
  failed,
}: {
  player: Player;
  hand: string;
  label: string;
  lang: Language;
  failed: boolean;
}) {
  const { phase } = useSwingPlayer(player);
  return (
    <div className="poster-fallback">
      <Image
        src={`/models/poster/${player.getState().spec.clip}/${phase}.png`}
        width={720}
        height={960}
        alt={label}
        priority
        style={{ transform: hand === "left" ? "scaleX(-1)" : undefined }}
      />
      {failed && (
        <p>
          {lang === "en"
            ? "3D unavailable. Use the phases to explore the swing."
            : "3D no disponible. Explora el swing con las fases."}
        </p>
      )}
    </div>
  );
}
