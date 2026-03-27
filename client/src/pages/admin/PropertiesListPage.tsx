import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, Building2 } from 'lucide-react';
import { useProperties, useDeleteProperty, usePatchPropertyStatus } from '../../hooks/useQueries';
import { Button } from '../../components/ui/Button';
import { Input }  from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { PropertyStatusBadge, Badge } from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui/Modal';
import { SkeletonRow, EmptyState } from '../../components/ui/Skeleton';
import { formatCurrency, formatDate, useDebounce } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';

// ─── Filter options ───────────────────────────────────────────────────────────
const TYPE_OPTS    = [{ value:'', label:'Tipo' },{ value:'APARTMENT',label:'Piso' },{ value:'HOUSE',label:'Casa' },{ value:'LAND',label:'Solar' },{ value:'COMMERCIAL',label:'Local' },{ value:'OFFICE',label:'Oficina' }];
const OP_OPTS      = [{ value:'', label:'Operación' },{ value:'SALE',label:'Venta' },{ value:'RENT',label:'Alquiler' }];
const STATUS_OPTS  = [{ value:'', label:'Estado' },{ value:'AVAILABLE',label:'Disponible' },{ value:'RESERVED',label:'Reservado' },{ value:'SOLD',label:'Vendido' },{ value:'RENTED',label:'Alquilado' }];
const SORT_OPTS    = [{ value:'created_at_desc',label:'Más reciente' },{ value:'price_asc',label:'Precio ↑' },{ value:'price_desc',label:'Precio ↓' }];
const TYPE_LABELS: Record<string,string> = { APARTMENT:'Piso', HOUSE:'Casa', LAND:'Solar', COMMERCIAL:'Local', OFFICE:'Oficina' };

export function PropertiesListPage() {
  const navigate = useNavigate();
  const isAdmin  = useAuthStore((s) => s.user?.role === 'ADMIN');

  const [page,      setPage]    = useState(1);
  const [search,    setSearch]  = useState('');
  const [type,      setType]    = useState('');
  const [operation, setOp]      = useState('');
  const [status,    setStatus]  = useState('');
  const [sort,      setSort]    = useState('created_at_desc');
  const [deleteId,  setDeleteId] = useState<string | null>(null);

  const dSearch = useDebounce(search, 350);

  const params = { page, limit: 20, type, operation, status, sort, ...(dSearch && { city: dSearch }) };
  const { data, isLoading } = useProperties(params);
  const deleteMut = useDeleteProperty();

  const items = data?.data ?? [];
  const meta  = data?.meta;

  return (
    <div className="space-y-5 animate-in">
      <div className="page-header">
        <h1 className="page-title">Propiedades</h1>
        {isAdmin && (
          <Button iconLeft={<Plus size={16} />} onClick={() => navigate('/admin/properties/new')}>
            Nueva propiedad
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar ciudad…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search size={15} />}
          wrapperClass="w-52"
        />
        <Select options={TYPE_OPTS}    value={type}      onChange={(e) => { setType(e.target.value);   setPage(1); }} wrapperClass="w-36" />
        <Select options={OP_OPTS}      value={operation} onChange={(e) => { setOp(e.target.value);     setPage(1); }} wrapperClass="w-36" />
        <Select options={STATUS_OPTS}  value={status}    onChange={(e) => { setStatus(e.target.value); setPage(1); }} wrapperClass="w-36" />
        <Select options={SORT_OPTS}    value={sort}      onChange={(e) => setSort(e.target.value)}                    wrapperClass="w-40 ml-auto" />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50 text-left">
                {['Propiedad', 'Tipo', 'Operación', 'Estado', 'Precio', 'Ciudad', 'Fecha', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-surface-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={8} />)
                : items.map((p: Record<string,unknown>) => (
                    <tr key={p['id'] as string} className="hover:bg-surface-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {(p['images'] as { url: string }[])?.[0] ? (
                            <img src={(p['images'] as { url: string }[])[0]!.url} className="h-9 w-14 rounded-md object-cover shrink-0" alt="" />
                          ) : (
                            <div className="h-9 w-14 rounded-md bg-surface-100 flex items-center justify-center shrink-0">
                              <Building2 size={14} className="text-surface-400" />
                            </div>
                          )}
                          <span className="font-medium text-surface-900 line-clamp-1 max-w-[180px]">{p['title'] as string}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant="default">{TYPE_LABELS[p['type'] as string] ?? p['type'] as string}</Badge></td>
                      <td className="px-4 py-3 text-surface-600">{p['operation'] === 'SALE' ? 'Venta' : 'Alquiler'}</td>
                      <td className="px-4 py-3"><PropertyStatusBadge status={p['status'] as string} /></td>
                      <td className="px-4 py-3 font-mono text-surface-900">{formatCurrency(p['price'] as number, p['currency'] as string)}</td>
                      <td className="px-4 py-3 text-surface-600">{p['city'] as string}</td>
                      <td className="px-4 py-3 text-surface-500">{formatDate(p['created_at'] as string)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/admin/properties/${p['id']}`)} className="rounded p-1.5 text-surface-400 hover:bg-surface-100 hover:text-primary-600" title="Ver"><Eye size={15} /></button>
                          <button onClick={() => navigate(`/admin/properties/${p['id']}/edit`)} className="rounded p-1.5 text-surface-400 hover:bg-surface-100 hover:text-amber-600" title="Editar"><Pencil size={15} /></button>
                          {isAdmin && <button onClick={() => setDeleteId(p['id'] as string)} className="rounded p-1.5 text-surface-400 hover:bg-surface-100 hover:text-red-600" title="Eliminar"><Trash2 size={15} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {!isLoading && items.length === 0 && (
          <EmptyState icon={<Building2 size={24} />} title="No hay propiedades" description="Crea tu primera propiedad para empezar." action={<Link to="/admin/properties/new"><Button size="sm" iconLeft={<Plus size={14}/>}>Nueva propiedad</Button></Link>} />
        )}
      </div>

      {meta && <Pagination meta={meta} onPageChange={setPage} />}

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }}
        loading={deleteMut.isPending}
        title="Eliminar propiedad"
        description="Esta acción es irreversible. Se eliminarán también todas las imágenes asociadas."
        confirmLabel="Eliminar"
        danger
      />
    </div>
  );
}

// ─── Re-export useDebounce inline if not in utils ────────────────────────────
declare module '../../lib/utils' {
  export function useDebounce<T>(value: T, delay: number): T;
}
