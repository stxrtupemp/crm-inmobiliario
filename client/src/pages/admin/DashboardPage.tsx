import { Building2, Users, CheckSquare, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '../../hooks/useQueries';
import { StatsCard, SkeletonCard, Skeleton } from '../../components/ui/Skeleton';
import { DealStatusBadge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';

// ─── Deal pipeline bar chart (pure Tailwind) ──────────────────────────────────

const PIPELINE_COLS = [
  { key: 'LEAD',        label: 'Lead',        color: 'bg-indigo-500' },
  { key: 'CONTACT',     label: 'Contacto',    color: 'bg-amber-500'  },
  { key: 'VISIT',       label: 'Visita',      color: 'bg-blue-500'   },
  { key: 'NEGOTIATION', label: 'Negociación', color: 'bg-violet-500' },
  { key: 'CLOSING',     label: 'Cierre',      color: 'bg-pink-500'   },
  { key: 'WON',         label: 'Ganado',      color: 'bg-green-500'  },
  { key: 'LOST',        label: 'Perdido',     color: 'bg-red-400'    },
];

type DealStat = { status: string; count: number; total_amount: number };

function PipelineChart({ stats }: { stats: DealStat[] }) {
  const max = Math.max(...stats.map((s) => s.count), 1);

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-semibold text-surface-900">Pipeline por etapa</h3>
      <div className="flex items-end gap-3 h-32">
        {PIPELINE_COLS.map((col) => {
          const stat  = stats.find((s) => s.status === col.key);
          const count = stat?.count ?? 0;
          const pct   = Math.round((count / max) * 100);
          return (
            <div key={col.key} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-semibold text-surface-700">{count}</span>
              <div className="w-full flex items-end" style={{ height: '80px' }}>
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${col.color}`}
                  style={{ height: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                />
              </div>
              <span className="text-2xs text-surface-500 text-center leading-tight">
                {col.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Recent deals table ───────────────────────────────────────────────────────

type RecentDeal = {
  id: string; status: string; amount: number | null;
  expected_close: string | null; created_at: string;
  property: { id: string; title: string; city: string };
  client:   { id: string; name: string };
};

function RecentDeals({ deals }: { deals: RecentDeal[] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
        <h3 className="text-sm font-semibold text-surface-900">Últimos deals</h3>
        <Link to="/admin/deals" className="text-xs text-primary-600 hover:underline">Ver todos</Link>
      </div>
      {deals.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-surface-500">Sin deals recientes</p>
      ) : (
        <div className="divide-y divide-surface-100">
          {deals.map((deal) => (
            <Link
              key={deal.id}
              to={`/admin/deals`}
              className="flex items-center gap-4 px-5 py-3 hover:bg-surface-50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-surface-900">{deal.property.title}</p>
                <p className="text-xs text-surface-500">{deal.client.name} · {deal.property.city}</p>
              </div>
              <div className="shrink-0 text-right">
                <DealStatusBadge status={deal.status} />
                {deal.amount && (
                  <p className="mt-0.5 text-xs text-surface-500">{formatCurrency(deal.amount)}</p>
                )}
              </div>
              <div className="hidden shrink-0 text-xs text-surface-400 sm:block">
                {deal.expected_close ? formatDate(deal.expected_close) : '—'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { data, isLoading } = useDashboardStats();

  const stats        = data as Record<string, unknown> | undefined;
  const dealStats    = (stats?.deals_by_status as DealStat[]) ?? [];
  const recentDeals  = (stats?.recent_deals as RecentDeal[]) ?? [];

  const availableProps = (stats?.properties_by_status as { status: string; count: number }[])
    ?.find((p) => p.status === 'AVAILABLE')?.count ?? 0;

  const newLeads = (stats?.deals_by_status as DealStat[])
    ?.find((d) => d.status === 'LEAD')?.count ?? 0;

  return (
    <div className="space-y-6 animate-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="text-sm text-surface-500">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatsCard
              title="Propiedades activas"
              value={availableProps}
              icon={<Building2 size={20} className="text-primary-600" />}
              iconColor="bg-primary-100"
            />
            <StatsCard
              title="Nuevos leads"
              value={newLeads}
              icon={<Users size={20} className="text-violet-600" />}
              iconColor="bg-violet-100"
            />
            <StatsCard
              title="Tareas pendientes"
              value={String(stats?.tasks_pending ?? 0)}
              icon={<CheckSquare size={20} className="text-amber-600" />}
              iconColor="bg-amber-100"
              delta={stats?.tasks_overdue ? `${stats.tasks_overdue as number} vencidas` : undefined}
            />
            <StatsCard
              title="Mensajes sin leer"
              value={String(stats?.unread_contacts ?? 0)}
              icon={<MessageSquare size={20} className="text-green-600" />}
              iconColor="bg-green-100"
            />
          </>
        )}
      </div>

      {/* Pipeline chart + recent deals */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        {isLoading ? (
          <>
            <div className="card p-5"><Skeleton className="h-44 w-full" /></div>
            <div className="card p-5"><Skeleton className="h-44 w-full" /></div>
          </>
        ) : (
          <>
            <PipelineChart stats={dealStats} />
            <RecentDeals deals={recentDeals} />
          </>
        )}
      </div>
    </div>
  );
}
