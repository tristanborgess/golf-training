"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { type ReactNode, useRef } from "react";
import type { Language } from "@/lib/golf";
export function DetailModal({
  open,
  onClose,
  title,
  lang,
  children,
  sheet = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  lang: Language;
  children: ReactNode;
  sheet?: boolean;
}) {
  const restoreFocus = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-backdrop" />
        <Dialog.Content
          className={sheet ? "menu-sheet" : "detail-modal"}
          aria-describedby={undefined}
          onEscapeKeyDown={(event) => {
            const enlarged = document.querySelector<HTMLDialogElement>(
              "dialog.diagram-dialog[open]",
            );
            if (enlarged) {
              event.preventDefault();
              enlarged.close();
            }
          }}
          onOpenAutoFocus={() => {
            restoreFocus.current = document.activeElement as HTMLElement;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const target = restoreFocus.current?.isConnected
              ? restoreFocus.current
              : document.getElementById("range-menu");
            target?.focus();
          }}
        >
          <div className="sheet-handle" />
          <div className="modal-heading">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close
              className="icon-button"
              aria-label={lang === "en" ? "Close" : "Cerrar"}
            >
              <X size={21} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
