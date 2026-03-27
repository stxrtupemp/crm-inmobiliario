import { Fragment, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const sizes = {
  sm:   'max-w-md',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-[95vw]',
} as const;

interface ModalProps {
  open:       boolean;
  onClose:    () => void;
  title?:     string;
  size?:      keyof typeof sizes;
  children:   ReactNode;
  footer?:    ReactNode;
  className?: string;
  // Prevent closing on backdrop click (e.g. forms with unsaved data)
  static?:    boolean;
}

export function Modal({
  open,
  onClose,
  title,
  size     = 'md',
  children,
  footer,
  className,
  static: isStatic = false,
}: ModalProps) {
  if (!open) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in"
        onClick={isStatic ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={cn(
            'relative w-full rounded-2xl bg-white shadow-modal animate-in',
            'flex flex-col max-h-[90vh]',
            sizes[size],
            className,
          )}
        >
          {/* Header */}
          {title && (
            <div className="flex shrink-0 items-center justify-between border-b border-surface-100 px-6 py-4">
              <h2 className="text-base font-semibold text-surface-900">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-surface-100 px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

interface ConfirmProps {
  open:         boolean;
  onClose:      () => void;
  onConfirm:    () => void;
  title:        string;
  description?: string;
  confirmLabel?: string;
  danger?:      boolean;
  loading?:     boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  danger       = false,
  loading      = false,
}: ConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" static={loading}>
      {description && <p className="text-sm text-surface-600">{description}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-lg border border-surface-300 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50',
            danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700',
          )}
        >
          {loading ? 'Procesando…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
