"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Shared modal shell for the dashboard. Owns the cross-cutting behaviour every
 * dialog needs so the callers only describe their content:
 *
 *  - portals to <body>, so no ancestor's overflow/transform/stacking can clip
 *    or trap it (the old inline overlays sat inside the settings grid);
 *  - a solid, dimmed + blurred backdrop, so page content never bleeds through
 *    the panel (the frosted-glass panels used to show the page text underneath);
 *  - locks body scroll while open and restores it on close;
 *  - Escape and backdrop-click close, both suppressed while `busy` (mid-submit);
 *  - fade/pop entrance (.modal-backdrop / .modal-panel), off under reduced motion.
 *
 * The panel itself is the caller's own element (usually a <form>) styled with
 * MODAL_PANEL, so useActionState submits keep working and each dialog keeps its
 * own layout. Give that element role="dialog" and aria-modal for semantics.
 */
export function Modal({
  open,
  onClose,
  busy = false,
  closeOnBackdrop = true,
  className = "",
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** In flight: suppress Escape + backdrop close so a submit can't be lost. */
  busy?: boolean;
  closeOnBackdrop?: boolean;
  /** Extra classes for the backdrop (e.g. custom alignment). */
  className?: string;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Read busy/onClose through refs so the scroll-lock + Escape effect below only
  // re-runs on open/close, not on every render. Callers pass an inline onClose
  // (new ref each render) and a changing busy flag; without this the effect
  // would tear down and rebuild on each keystroke, re-firing focus restore.
  const onCloseRef = useRef(onClose);
  const busyRef = useRef(busy);
  useEffect(() => {
    onCloseRef.current = onClose;
    busyRef.current = busy;
  });

  useEffect(() => {
    if (!open) return;

    // Lock body scroll, remembering whatever was there before.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Return focus to whatever launched the modal once it closes.
    const opener = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busyRef.current) {
        onCloseRef.current();
        return;
      }
      // Trap Tab inside the panel so aria-modal is honest: focus can't wander
      // out to the (portaled-away) page behind the dialog.
      if (e.key === "Tab") {
        const root = rootRef.current;
        if (!root) return;
        const items = root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (items.length === 0) {
          e.preventDefault();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !root.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !root.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open]);

  // Move focus into the panel on open, unless the content already grabbed it
  // (e.g. an autoFocus input). Keeps keyboard users inside the dialog.
  useEffect(() => {
    if (!open) return;
    const root = rootRef.current;
    if (!root || root.contains(document.activeElement)) return;
    const dialog = root.querySelector<HTMLElement>('[role="dialog"]');
    if (dialog) {
      dialog.tabIndex = -1;
      dialog.focus();
    }
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={rootRef}
      className={`modal-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/50 p-4 backdrop-blur-sm ${className}`}
      onClick={(e) => {
        if (closeOnBackdrop && !busy && e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

/**
 * Panel surface shared by every dashboard modal: solid white (opaque, so the
 * dimmed page never shows through), the brand's asymmetric card silhouette
 * (.shape-card), a soft elevation shadow, and the pop-in animation.
 */
export const MODAL_PANEL =
  "modal-panel shape-card border border-neutral-200 bg-white shadow-[var(--shadow-pop)]";
