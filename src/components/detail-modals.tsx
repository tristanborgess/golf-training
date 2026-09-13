"use client";
import { type ReactNode, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Language } from "@/lib/golf";

/**
 * One wrapper for every layer above the viewer. The menu is a sheet (bottom on
 * phones, right-hand panel from 768px); details open in a centred dialog.
 */
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
  const closeLabel = lang === "en" ? "Close" : "Cerrar";
  const handlers = {
    "aria-describedby": undefined,
    onEscapeKeyDown: (event: KeyboardEvent) => {
      const enlarged = document.querySelector<HTMLDialogElement>(
        "dialog.diagram-dialog[open]",
      );
      if (enlarged) {
        event.preventDefault();
        enlarged.close();
      }
    },
    onOpenAutoFocus: () => {
      restoreFocus.current = document.activeElement as HTMLElement;
    },
    onCloseAutoFocus: (event: Event) => {
      event.preventDefault();
      const target = restoreFocus.current?.isConnected
        ? restoreFocus.current
        : document.getElementById("range-menu");
      target?.focus();
    },
  };
  const onOpenChange = (value: boolean) => {
    if (!value) onClose();
  };
  if (sheet)
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          closeLabel={closeLabel}
          className="menu-sheet inset-x-0 bottom-0 max-h-[90svh] overflow-y-auto rounded-t-3xl border-t px-6 pb-[calc(28px+env(safe-area-inset-bottom))] pt-4 md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-[400px] md:rounded-none md:border-l md:border-t-0 md:pt-6 md:data-[state=closed]:slide-out-to-right md:data-[state=open]:slide-in-from-right"
          {...handlers}
        >
          <div className="sheet-handle md:hidden" aria-hidden="true" />
          <SheetHeader className="mb-6 text-left">
            <SheetTitle className="modal-title">{title}</SheetTitle>
          </SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeLabel={closeLabel}
        className="detail-modal block max-h-[92svh] w-[min(840px,94vw)] max-w-none overflow-y-auto rounded-2xl p-5 sm:p-8"
        {...handlers}
      >
        <DialogHeader className="mb-6 text-left">
          <DialogTitle className="modal-title">{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
