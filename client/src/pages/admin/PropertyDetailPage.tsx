import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Pencil, MapPin, Bed, Bath, Car, Maximize2, Trash2, Plus, ChevronLeft } from 'lucide-react';
import { useProperty, useNotes, useCreateNote, useDeleteNote, useTasks, useDeals } from '../../hooks/useQueries';
import { Button } from '../../components/ui/Button';
import { PropertyStatusBadge, DealStatusBadge, Badge, PriorityBadge } from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui/Modal';
import { PageSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/Skeleton';
import { formatCurrency, formatDate, formatArea, timeAgo, initials } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';

// ─── Notes panel ─────────────────────────────────────────────────────────────
function NotesPanel({ entityId }: { entityId: string }) {
  const [content, setContent] = useState('');
  const { data }      = useNotes('PROPERTY', entityId);
  const createMut     = useCreateNote();
  const deleteMut     = useDeleteNote('PROPERTY', entityId);
  const notes         = (data?.data ?? []) as Record<string,unknown>[];

  const submit = () => {
    if (!content.trim()) return;
    createMut.mutate({ content, entity_type: 'PROPERTY', entity_id: entityId }, {
      onSuccess: () => setContent(''),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <textarea
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Añadir nota…"
          className="field-base flex-1 resize-none"
        />
        <Button size="sm" onClick={submit} loading={createMut.isPending} disabled={!content.trim()}>
          Añadir
        </Button>
      </div>
      {notes.length === 0 && <EmptyState title="Sin notas" description="Añade la primera nota sobre esta propiedad." />}
      {notes.map((note) => {
        const author = note['author'] as { id: string; name: string; avatar_url: string | null };
        return (
          <div key={note['id'] as string} className="flex gap-3 rounded-xl bg-surface-50 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-700 text-xs font-semibold text-white">
              {initials(author.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-surface-700">{author.name}</span>
                <span className="text-2xs text-surface-400">{timeAgo(note['created_at'] as string)}</span>
              </div>
              <p className="mt-1 text-sm text-surface-700 whitespace-pre-wrap">{note['content'] as string}</p>
            </div>
            <button onClick={() => deleteMut.mutate(note['id'] as string)} className="shrink-0 rounded p-1 text-surface-300 hover:text-red-500"><Trash2 size={14} /></button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tasks panel ─────────────────────────────────────────────────────────────
function TasksPanel({ propertyId }: { propertyId: string }) {
  const { data } = useTasks({ property_id: propertyId, limit: 20 });
  const tasks = (data?.data ?? []) as Record<string,unknown>[];
  if (tasks.length === 0) return <EmptyState title="Sin tareas vinculadas" />;
  return (
    <div className="space-y-2">
      {tasks.map((t) => (
        <div key={t['id'] as string} className="flex items-center gap-3 rounded-xl border border-surface-100 bg-white p-3">
          <span className={`h-4 w-4 rounded border-2 shrink-0 ${t['completed'] ? 'border-green-500 bg-green-500' : 'border-surface-300'}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${t['completed'] ? 'line-through text-surface-400' : 'text-surface-900'}`}>{t['title'] as string}</p>
            {t['due_date'] && <p className="text-xs text-surface-500">Vence: {formatDate(t['due_date'] as string)}</p>}
          </div>
          <PriorityBadge priority={t['priority'] as string} />
        </div>
      ))}
    </div>
  );
}

// ─── Deals panel ─────────────────────────────────────────────────────────────
function DealsPanel({ propertyId }: { propertyId: string }) {
  const { data } = useDeals({ property_id: propertyId, limit: 20 });
  const deals = (data?.data ?? []) as Record<string,unknown>[];
  if (deals.length === 0) return <EmptyState title="Sin deals vinculados" />;
  return (
    <div className="space-y-2">
      {deals.map((d) => {
        const client = d['client'] as { name: string };
        return (
          <div key={d['id'] as string} className="flex items-center justify-between rounded-xl border border-surface-100 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-surface-900">{client.name}</p>
              {d['amount'] && <p className="text-xs text-surface-500">{formatCurrency(d['amount'] as number)}</p>}
            </div>
            <DealStatusBadge status={d['status'] as string} />
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const TABS = ['Notas', 'Tareas', 'Deals'] as const;
type Tab = typeof TABS[number];

export function PropertyDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAdmin  = useAuthStore((s) => s.user?.role === 'ADMIN');
  const [tab, setTab] = useState<Tab>('Notas');

  const { data, isLoading } = useProperty(id ?? '');
  const p = data as Record<string,unknown> | undefined;

  if (isLoading) return <PageSpinner />;
  if (!p) return <p className="p-8 text-center text-surface-500">Propiedad no encontrada</p>;

  const images = (p['images'] as { url: string; is_cover: boolean }[]) ?? [];
  const cover  = images.find((i) => i.is_cover)?.url ?? images[0]?.url;
  const TYPE_LABELS: Record<string,string> = { APARTMENT:'Piso', HOUSE:'Casa', LAND:'Solar', COMMERCIAL:'Local', OFFICE:'Oficina' };

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <button onClick={() => navigate('/admin/properties')} className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-900">
        <ChevronLeft size={16} /> Propiedades
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-surface-900">{p['title'] as string}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-surface-500">
            <MapPin size={14} />
            <span>{p['address'] as string}, {p['city'] as string}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PropertyStatusBadge status={p['status'] as string} />
          <Button variant="secondary" size="sm" iconLeft={<Pencil size={14}/>}
            onClick={() => navigate(`/admin/properties/${id}/edit`)}>
            Editar
          </Button>
        </div>
      </div>

      {/* Gallery + info */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Gallery */}
        <div className="card overflow-hidden">
          {cover
            ? <img src={cover} className="h-72 w-full object-cover" alt={p['title'] as string} />
            : <div className="flex h-72 items-center justify-center bg-surface-100 text-surface-300">Sin imagen</div>
          }
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3">
              {images.slice(1).map((img, i) => (
                <img key={i} src={img.url} className="h-16 w-24 shrink-0 rounded-lg object-cover" alt="" />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="card p-5 space-y-4">
          <div>
            <p className="text-xs text-surface-500 uppercase tracking-wide">Precio</p>
            <p className="text-2xl font-bold text-surface-900">{formatCurrency(p['price'] as number, p['currency'] as string)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow icon={<Maximize2 size={14}/>} label="Superficie" value={formatArea(p['area_m2'] as number)} />
            <InfoRow icon={<Bed size={14}/>}        label="Habitaciones" value={p['bedrooms'] ? String(p['bedrooms']) : '—'} />
            <InfoRow icon={<Bath size={14}/>}       label="Baños"       value={p['bathrooms'] ? String(p['bathrooms']) : '—'} />
            <InfoRow icon={<Car size={14}/>}        label="Parking"     value={p['parking'] ? String(p['parking']) : '—'} />
          </div>
          <div className="border-t border-surface-100 pt-3 space-y-2">
            <InfoLine label="Tipo"      value={TYPE_LABELS[p['type'] as string] ?? p['type'] as string} />
            <InfoLine label="Operación" value={p['operation'] === 'SALE' ? 'Venta' : 'Alquiler'} />
            <InfoLine label="Zona"      value={p['zone'] as string ?? '—'} />
            <InfoLine label="Agente"    value={(p['agent'] as { name: string })?.name ?? '—'} />
            <InfoLine label="Publicado" value={formatDate(p['created_at'] as string)} />
          </div>
          {p['description'] && (
            <div className="border-t border-surface-100 pt-3">
              <p className="text-xs text-surface-500 mb-1">Descripción</p>
              <p className="text-sm text-surface-700 leading-relaxed">{p['description'] as string}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex border-b border-surface-100">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${tab === t ? 'border-b-2 border-primary-600 text-primary-600' : 'text-surface-500 hover:text-surface-900'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === 'Notas'  && <NotesPanel entityId={id!} />}
          {tab === 'Tareas' && <TasksPanel propertyId={id!} />}
          {tab === 'Deals'  && <DealsPanel propertyId={id!} />}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-surface-50 px-3 py-2">
      <span className="text-surface-400">{icon}</span>
      <div>
        <p className="text-2xs text-surface-400">{label}</p>
        <p className="text-sm font-semibold text-surface-900">{value}</p>
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-surface-500">{label}</span>
      <span className="font-medium text-surface-900">{value}</span>
    </div>
  );
}
