"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Скрыть заголовок визуально (оставить для скринридеров). */
  hideTitle?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Модальное окно на нативном <dialog>: фокус удерживается внутри,
 * Esc и клик по подложке закрывают окно, прокрутка страницы блокируется.
 */
export function Modal({ open, onClose, title, hideTitle, children, footer, className }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-1.5rem)] max-w-2xl overflow-hidden rounded-panel bg-pearl p-0 text-ink shadow-[0_40px_90px_-30px_rgb(42_33_48/0.45)] open:animate-fade-up",
        className,
      )}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col">
          <div className="flex items-start justify-between gap-4 px-6 pt-5 sm:px-8 sm:pt-7">
            <h2 id={titleId} className={cn("pt-1 text-2xl", hideTitle && "sr-only")}>
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 ml-auto inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink"
              aria-label="Закрыть"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8">{children}</div>
          {footer && <div className="border-t border-line bg-pearl px-6 py-4 sm:px-8">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
