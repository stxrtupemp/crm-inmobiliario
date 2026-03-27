import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { PaginationMeta } from '../../lib/api';

interface PaginationProps {
  meta:       PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ meta, onPageChange, className }: PaginationProps) {
  const { page, total_pages, total, limit, has_prev, has_next } = meta;

  if (total_pages <= 1) return null;

  // Build page number windows: always show first, last, current ± 1
  const pages = buildPageRange(page, total_pages);

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  return (
    <div className={cn('flex items-center justify-between gap-4 text-sm', className)}>
      {/* Count */}
      <p className="text-surface-500">
        Mostrando{' '}
        <span className="font-medium text-surface-900">{from}–{to}</span>
        {' '}de{' '}
        <span className="font-medium text-surface-900">{total}</span>
      </p>

      {/* Controls */}
      <nav className="flex items-center gap-1" aria-label="Paginación">
        <PageBtn
          onClick={() => onPageChange(page - 1)}
          disabled={!has_prev}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </PageBtn>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-surface-400 select-none">
              …
            </span>
          ) : (
            <PageBtn
              key={p}
              onClick={() => onPageChange(p as number)}
              active={p === page}
            >
              {p}
            </PageBtn>
          ),
        )}

        <PageBtn
          onClick={() => onPageChange(page + 1)}
          disabled={!has_next}
          aria-label="Página siguiente"
        >
          <ChevronRight size={16} />
        </PageBtn>
      </nav>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PageBtn({
  children,
  active,
  disabled,
  onClick,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2',
        'text-sm font-medium transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-40',
        active
          ? 'bg-primary-600 text-white'
          : 'text-surface-600 hover:bg-surface-100',
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function buildPageRange(current: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const delta = 1;
  const range: Array<number | '…'> = [];
  const left  = current - delta;
  const right = current + delta;

  let last = 0;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= left && i <= right)) {
      if (last && i - last > 1) range.push('…');
      range.push(i);
      last = i;
    }
  }

  return range;
}
