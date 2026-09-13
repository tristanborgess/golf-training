import { useSyncExternalStore } from "react";
import type { Player } from "./player-store";
export function useSwingPlayer(player: Player) {
  return useSyncExternalStore(
    player.subscribe,
    player.getSnapshot,
    player.getSnapshot,
  );
}
