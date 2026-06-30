import React, { useEffect, useRef } from 'react';

type ModalProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ open, title, description, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    lastFocusRef.current = document.activeElement as HTMLElement | null;
    const container = dialogRef.current;
    const focusable = container?.querySelector<HTMLElement>('button, textarea, input, [href], [tabindex]:not([tabindex="-1"])');
    focusable?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !container) return;

      const nodes = Array.from(
        container.querySelectorAll<HTMLElement>('button, textarea, input, select, a[href], [tabindex]:not([tabindex="-1"])')
      ).filter(el => !el.hasAttribute('disabled'));

      if (!nodes.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      lastFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="escrow-modal-title"
        aria-describedby="escrow-modal-desc"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl outline-none"
        onMouseDown={e => e.stopPropagation()}
      >
        <h2 id="escrow-modal-title" className="text-xl font-bold text-gray-900">
          {title}
        </h2>
        <p id="escrow-modal-desc" className="mt-2 text-sm text-gray-600">
          {description}
        </p>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
