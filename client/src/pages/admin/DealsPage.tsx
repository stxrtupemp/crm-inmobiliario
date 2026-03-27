import { useState, useRef } from 'react';
import { useDeals, usePatchDealStatus, useCreateDeal, useClients, useProperties } from '../../hooks/useQueries';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { DealStatusBadge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Plus, Building2, User } from 'lucide-react';

// ─── Pipeline columns ─────────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'LEAD',        label: 'Lead',        color: 'border-indigo-400 bg-indigo-50' },
  { key: 'CONTACT',     label: 'Contacto',    color: 'border-amber-400  bg-amber-50'  },
  { key: 'VISIT',       label: 'Visita',      color: 'border-blue-400   bg-blue-50'   },
  { key: 'NEGOTIATION', label: 'Negociación', color: 'border-violet-400 bg-violet-50' },
  { key: 'CLOSING',     label: 'Cierre',      color: 'border-pink-400   bg-pink-50'   },
  { key: 'WON',         label: 'Ganado',      color: 'border-green-400  bg-green-50'  },
  { key: 'LOST',        label: 'Perdido',     color: 'border-red-300    bg-red-50'    },
] as const;

type DealRecord = {
  id: string; status: string; amount: number | null; expected_close: string | null;
  property: { id: string; title: string; city: string };
  client:   { id: string; name: string };
  agent:    { id: string; name: string };
};

// ─── Deal card ────────────────────────────────────────────────────────────────
function DealCard({
  deal, onDragStart, onClick,
}: { deal: DealRecord; onDragStart: () => void; onClick: () => void }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="cursor-pointer rounded-xl bg-white border border-surface-200 p-3 shadow-card
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 space-y-2"
    >
      <p className="text-xs font-semibold text-surface-900 line-clamp-2">{deal.property.title}</p>
      <div className="flex items-center gap-1.5 text-xs text-surface-500">
        <Building2 size={11} /> {deal.property.city}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-surface-500">
        <User size={11} /> {deal.client.name}
      </div>
      <div className="flex items-center justify-between">
        {deal.amount
          ? <span className="text-xs font-semibold text-surface-900">{formatCurrency(deal.amount)}</span>
          : <span className="text-xs text-surface-400">Sin importe</span>}
        {deal.expected_close && (
          <span className="text-2xs text-surface-400">{formatDate(deal.expected_close)}</span>
        )}
      </div>
    </div>
  );
}

// ─── New deal modal ───────────────────────────────────────────────────────────
function NewDealModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ property_id: '', client_id: '', status: 'LEAD', amount: '' });
  const [formError, setFormError] = useState('');
  const { data: props }   = useProperties({ limit: 100, status: 'AVAILABLE' });
  const { data: clients } = useClients({ limit: 100 });
  const createMut = useCreateDeal();

  const propOpts   = [{ value: '', label: 'Propiedad' }, ...((props?.data ?? []) as DealRecord['property'][]).map((p) => ({ value: p.id, label: p.title }))];
  const clientOpts = [{ value: '', label: 'Cliente' },   ...((clients?.data ?? []) as DealRecord['client'][]).map((c) => ({ value: c.id, label: c.name }))];
  const statusOpts = COLUMNS.map((c) => ({ value: c.key, label: c.label }));

  const submit = async () => {
    setFormError('');
    if (!form.property_id || !form.client_id) {
      setFormError('Propiedad y cliente son obligatorios.');
      return;
    }
    const amount = form.amount ? Number(form.amount) : undefined;
    if (amount !== undefined && (isNaN(amount) || amount <= 0 || amount > 999_999_999_999.99)) {
      setFormError('Importe inválido (máx. 999.999.999.999,99 €).');
      return;
    }
    await createMut.mutateAsync({ ...form, amount });
    onClose();
    setForm({ property_id: '', client_id: '', status: 'LEAD', amount: '' });
    setFormError('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo deal"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} loading={createMut.isPending}>Crear deal</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select options={propOpts}   value={form.property_id} onChange={(e) => setForm((f) => ({ ...f, property_id: e.target.value }))} label="Propiedad *" />
        <Select options={clientOpts} value={form.client_id}   onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}   label="Cliente *" />
        <Select options={statusOpts} value={form.status}      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}       label="Etapa" />
        <Input label="Importe (€)" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
        {formError && (
          <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{formError}</p>
        )}
      </div>
    </Modal>
  );
}

// ─── Deal detail modal ────────────────────────────────────────────────────────
function DealDetailModal({ deal, open, onClose }: { deal: DealRecord | null; open: boolean; onClose: () => void }) {
  const patchMut  = usePatchDealStatus();
  const statusOpts = COLUMNS.map((c) => ({ value: c.key, label: c.label }));

  if (!deal) return null;

  return (
    <Modal open={open} onClose={onClose} title={deal.property.title} size="sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <DealStatusBadge status={deal.status} />
          {deal.amount && <span className="font-semibold">{formatCurrency(deal.amount)}</span>}
        </div>
        <div className="text-sm text-surface-600 space-y-1">
          <p><span className="font-medium">Cliente:</span> {deal.client.name}</p>
          <p><span className="font-medium">Ciudad:</span>  {deal.property.city}</p>
          {deal.expected_close && <p><span className="font-medium">Cierre est.:</span> {formatDate(deal.expected_close)}</p>}
          <p><span className="font-medium">Agente:</span>  {deal.agent.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-surface-700">Cambiar etapa</label>
          <select
            value={deal.status}
            onChange={(e) => patchMut.mutate({ id: deal.id, status: e.target.value })}
            className="field-base mt-1"
          >
            {statusOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function DealsPage() {
  const { data, isLoading } = useDeals({ limit: 100, page: 1 });
  const patchMut   = usePatchDealStatus();
  const [newOpen,  setNewOpen]   = useState(false);
  const [selected, setSelected] = useState<DealRecord | null>(null);
  const dragRef = useRef<DealRecord | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  if (isLoading) return <PageSpinner />;

  const deals = (data?.data ?? []) as DealRecord[];

  const handleDrop = (toStatus: string) => {
    if (dragRef.current && dragRef.current.status !== toStatus) {
      patchMut.mutate({ id: dragRef.current.id, status: toStatus });
    }
    setOverCol(null);
    dragRef.current = null;
  };

  return (
    <div className="space-y-5 animate-in">
      <div className="page-header">
        <h1 className="page-title">Pipeline</h1>
        <Button iconLeft={<Plus size={16}/>} onClick={() => setNewOpen(true)}>Nuevo deal</Button>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 180px)' }}>
        {COLUMNS.map((col) => {
          const colDeals = deals.filter((d) => d.status === col.key);
          const isOver   = overCol === col.key;

          return (
            <div
              key={col.key}
              onDragOver={(e) => { e.preventDefault(); setOverCol(col.key); }}
              onDrop={() => handleDrop(col.key)}
              onDragLeave={() => setOverCol(null)}
              className={`flex w-64 shrink-0 flex-col rounded-2xl border-2 transition-colors duration-150
                ${col.color} ${isOver ? 'scale-[1.01] shadow-lg' : ''}`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-surface-700">{col.label}</p>
                  <p className="text-xs text-surface-500">{colDeals.length} deal{colDeals.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
                {colDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onDragStart={() => { dragRef.current = deal; }}
                    onClick={() => setSelected(deal)}
                  />
                ))}
                {colDeals.length === 0 && (
                  <div className="flex h-16 items-center justify-center rounded-xl border-2 border-dashed border-surface-300/50">
                    <p className="text-xs text-surface-400">Arrastra aquí</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <NewDealModal open={newOpen} onClose={() => setNewOpen(false)} />
      <DealDetailModal deal={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}
