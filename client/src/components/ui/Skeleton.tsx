import { cn } from '../../lib/utils';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

interface SkeletonProps { className?: string; }

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-200', className)} />;
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?:        React.ReactNode;
  title:        string;
  description?: string;
  action?:      React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-100 text-surface-400">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-surface-900">{title}</p>
      {description && <p className="mt-1 text-sm text-surface-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── StatsCard ────────────────────────────────────────────────────────────────

interface StatsCardProps {
  title:     string;
  value:     string | number;
  icon:      React.ReactNode;
  iconColor: string;
  delta?:    string;
  loading?:  boolean;
}

export function StatsCard({ title, value, icon, iconColor, delta, loading }: StatsCardProps) {
  if (loading) return <SkeletonCard />;
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-surface-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-surface-900">{value}</p>
          {delta && <p className="mt-1 text-xs text-surface-500">{delta}</p>}
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconColor)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
