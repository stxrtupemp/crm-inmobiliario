import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Eye, Pencil, Trash2, Users, ChevronLeft } from 'lucide-react';
import {
  useClients, useClient, useCreateClient, useUpdateClient, useDeleteClient,
  useNotes, useCreateNote, useDeleteNote, useTasks, useDeals,
} from '../../hooks/useQueries';
import { Button }      from '../../components/ui/Button';
import { Input }       from '../../components/ui/Input';
import { Select }      from '../../components/ui/Select';
import { Badge, DealStatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { Pagination }  from '../../components/ui/Pagination';
import { ConfirmModal } from '../../components/ui/Modal';
import { SkeletonRow, EmptyState } from '../../components/ui/Skeleton';
import { PageSpinner }  from '../../components/ui/LoadingSpinner';
import { formatDate, timeAgo, initials, useDebounce } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';

// ─── Option maps ──────────────────────────────────────────────────────────────
const TYPE_OPTS   = [{ value:'',label:'Tipo' },{ value:'BUYER',label:'Comprador' },{ value:'SELLER',label:'Vendedor' },{ value:'TENANT',label:'Inquilino' },{ value:'LANDLORD',label:'Propietario' }];
const SOURCE_OPTS = [{ value:'',label:'Fuente' },{ value:'WEB',label:'Web' },{ value:'REFERRAL',label:'Referido' },{ value:'PORTAL',label:'Portal' },{ value:'WALK_IN',label:'Walk-in' },{ value:'OTHER',label:'Otro' }];
const TYPE_LABELS: Record<string,string> = { BUYER:'Comprador', SELLER:'Vendedor', TENANT:'Inquilino', LANDLORD:'Propietario' };
const SRC_LABELS:  Record<string,string> = { WEB:'Web', REFERRAL:'Referido', PORTAL:'Portal', WALK_IN:'Walk-in', OTHER:'Otro' };
const TYPE_COLORS: Record<string,string> = { BUYER:'primary', SELLER:'warning', TENANT:'info', LANDLORD:'purple' };

// ════════════════════════════════════════════════════════════════════════
// LIST PAGE
// ════════════════════════════════════════════════════════════════════════
export function ClientsListPage() {
  const navigate = useNavigate();
  const isAdmin  = useAuthStore((s) => s.user?.role === 'ADMIN');

  const [page,  setPage]  = useState(1);
  const [search, setSearch] = useState('');
  const [type,  setType]  = useState('');
  const [source, setSrc]  = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const dSearch   = useDebounce(search, 350);
  const params    = { page, limit: 20, type, source, ...(dSearch && { search: dSearch }) };
  const { data, isLoading } = useClients(params);
  const deleteMut = useDeleteClient();
  const items = (data?.data ?? []) as Record<string,unknown>[];
  const meta  = data?.meta;

  return (
    <div className="space-y-5 animate-in">
      <div className="page-header">
        <h1 className="page-title">Clientes</h1>
        <Button iconLeft={<Plus size={16}/>} onClick={() => navigate('/admin/clients/new')}>Nuevo cliente</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Buscar nombre, email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search size={15}/>} wrapperClass="w-60" />
        <Select options={TYPE_OPTS}   value={type}   onChange={(e) => { setType(e.target.value);  setPage(1); }} wrapperClass="w-36" />
        <Select options={SOURCE_OPTS} value={source} onChange={(e) => { setSrc(e.target.value);   setPage(1); }} wrapperClass="w-36" />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100 bg-surface-50 text-left">
              {['Cliente', 'Tipo', 'Fuente', 'Teléfono', 'Deals', 'Alta', 'Acciones'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-surface-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              : items.map((c) => (
                <tr key={c['id'] as string} className="hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-200 text-xs font-semibold text-surface-600">
                        {initials(c['name'] as string)}
                      </div>
                      <div>
                        <p className="font-medium text-surface-900">{c['name'] as string}</p>
                        {c['email'] && <p className="text-xs text-surface-500">{c['email'] as string}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant={TYPE_COLORS[c['type'] as string] as 'primary'}>{TYPE_LABELS[c['type'] as string] ?? c['type'] as string}</Badge></td>
                  <td className="px-4 py-3 text-surface-500">{SRC_LABELS[c['source'] as string] ?? c['source'] as string}</td>
                  <td className="px-4 py-3 text-surface-600">{c['phone'] as string ?? '—'}</td>
                  <td className="px-4 py-3 text-surface-600">{(c['_count'] as { deals: number })?.deals ?? 0}</td>
                  <td className="px-4 py-3 text-surface-500">{formatDate(c['created_at'] as string)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/admin/clients/${c['id']}`)} className="rounded p-1.5 text-surface-400 hover:bg-surface-100 hover:text-primary-600"><Eye size={15}/></button>
                      <button onClick={() => navigate(`/admin/clients/${c['id']}/edit`)} className="rounded p-1.5 text-surface-400 hover:bg-surface-100 hover:text-amber-600"><Pencil size={15}/></button>
                      {isAdmin && <button onClick={() => setDeleteId(c['id'] as string)} className="rounded p-1.5 text-surface-400 hover:bg-surface-100 hover:text-red-600"><Trash2 size={15}/></button>}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {!isLoading && items.length === 0 && (
          <EmptyState icon={<Users size={24}/>} title="No hay clientes" description="Añade tu primer cliente." action={<Button size="sm" onClick={() => navigate('/admin/clients/new')}>Nuevo cliente</Button>} />
        )}
      </div>
      {meta && <Pagination meta={meta} onPageChange={setPage} />}
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }}
        loading={deleteMut.isPending} title="Eliminar cliente" danger confirmLabel="Eliminar"
        description="¿Eliminar este cliente? Se perderán sus datos." />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// FORM PAGE
// ════════════════════════════════════════════════════════════════════════
const clientSchema = z.object({
  name:   z.string().min(2),
  email:  z.string().email().optional().or(z.literal('')),
  phone:  z.string().optional(),
  type:   z.string().min(1, 'Requerido'),
  source: z.string().optional(),
  notes:  z.string().optional(),
});
type ClientForm = z.infer<typeof clientSchema>;

const TYPE_F_OPTS   = [{ value:'BUYER',label:'Comprador' },{ value:'SELLER',label:'Vendedor' },{ value:'TENANT',label:'Inquilino' },{ value:'LANDLORD',label:'Propietario' }];
const SOURCE_F_OPTS = [{ value:'WEB',label:'Web' },{ value:'REFERRAL',label:'Referido' },{ value:'PORTAL',label:'Portal' },{ value:'WALK_IN',label:'Walk-in' },{ value:'OTHER',label:'Otro' }];

export function ClientFormPage() {
  const { id }   = useParams<{ id: string }>();
  const isEdit   = !!id;
  const navigate = useNavigate();
  const { data, isLoading } = useClient(id ?? '');
  const existing = data as Record<string,unknown> | undefined;
  const createMut = useCreateClient();
  const updateMut = useUpdateClient(id ?? '');
  const isBusy    = createMut.isPending || updateMut.isPending;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientForm>({ resolver: zodResolver(clientSchema) });

  useEffect(() => {
    if (existing) {
      reset({
        name:   existing['name']   as string ?? '',
        email:  existing['email']  as string ?? '',
        phone:  existing['phone']  as string ?? '',
        type:   existing['type']   as string ?? '',
        source: existing['source'] as string ?? 'OTHER',
        notes:  existing['notes']  as string ?? '',
      });
    }
  }, [existing, reset]);

  const onSubmit = async (data: ClientForm) => {
    if (isEdit) { await updateMut.mutateAsync(data); navigate(`/admin/clients/${id}`); }
    else { const c = await createMut.mutateAsync(data) as Record<string,unknown>; navigate(`/admin/clients/${c['id']}`); }
  };

  if (isEdit && isLoading) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-in">
      <div className="page-header"><h1 className="page-title">{isEdit ? 'Editar cliente' : 'Nuevo cliente'}</h1></div>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <Input label="Nombre *"  {...register('name')}  error={errors.name?.message} />
        <Input label="Email"     {...register('email')} type="email" error={errors.email?.message} />
        <Input label="Teléfono"  {...register('phone')} />
        <Select label="Tipo *"   options={TYPE_F_OPTS}   {...register('type')}   error={errors.type?.message} />
        <Select label="Fuente"   options={SOURCE_F_OPTS} {...register('source')} />
        <div>
          <label className="text-sm font-medium text-surface-700">Notas</label>
          <textarea rows={3} {...register('notes')} className="field-base mt-1" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" loading={isBusy}>{isEdit ? 'Guardar' : 'Crear cliente'}</Button>
        </div>
      </form>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// DETAIL PAGE
// ════════════════════════════════════════════════════════════════════════
const TABS = ['Notas', 'Deals', 'Tareas'] as const;
type Tab = typeof TABS[number];

export function ClientDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('Notas');
  const [noteText, setNoteText] = useState('');
  const { data, isLoading } = useClient(id ?? '');
  const c = data as Record<string,unknown> | undefined;
  const { data: notesData } = useNotes('CLIENT', id ?? '');
  const { data: dealsData }  = useDeals({ client_id: id, limit: 20 });
  const { data: tasksData }  = useTasks({ client_id: id, limit: 20 });
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote('CLIENT', id ?? '');
  const notes = (notesData?.data ?? []) as Record<string,unknown>[];
  const deals = (dealsData?.data ?? []) as Record<string,unknown>[];
  const tasks = (tasksData?.data ?? []) as Record<string,unknown>[];

  if (isLoading) return <PageSpinner />;
  if (!c) return <p className="p-8 text-center text-surface-500">Cliente no encontrado</p>;

  return (
    <div className="space-y-6 animate-in">
      <button onClick={() => navigate('/admin/clients')} className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-900"><ChevronLeft size={16}/> Clientes</button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-700 text-xl font-bold text-white">{initials(c['name'] as string)}</div>
          <div>
            <h1 className="text-xl font-bold text-surface-900">{c['name'] as string}</h1>
            <p className="text-sm text-surface-500">{c['email'] as string ?? '—'} · {c['phone'] as string ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={TYPE_COLORS[(c['type'] as string)] as 'primary'}>{TYPE_LABELS[c['type'] as string]}</Badge>
          <Button variant="secondary" size="sm" iconLeft={<Pencil size={14}/>} onClick={() => navigate(`/admin/clients/${id}/edit`)}>Editar</Button>
        </div>
      </div>

      {c['notes'] && (
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase text-surface-400 mb-1">Observaciones</p>
          <p className="text-sm text-surface-700">{c['notes'] as string}</p>
        </div>
      )}

      <div className="card">
        <div className="flex border-b border-surface-100">
          {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 text-sm font-medium transition-colors ${tab===t?'border-b-2 border-primary-600 text-primary-600':'text-surface-500 hover:text-surface-900'}`}>{t}</button>)}
        </div>
        <div className="p-5">
          {tab === 'Notas' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <textarea rows={2} value={noteText} onChange={(e)=>setNoteText(e.target.value)} className="field-base flex-1 resize-none" placeholder="Añadir nota…"/>
                <Button size="sm" onClick={()=>{ if(noteText.trim()) createNote.mutate({content:noteText,entity_type:'CLIENT',entity_id:id!},{onSuccess:()=>setNoteText('')}); }} loading={createNote.isPending} disabled={!noteText.trim()}>Añadir</Button>
              </div>
              {notes.length===0 && <EmptyState title="Sin notas"/>}
              {notes.map((n)=>{
                const a=n['author'] as {name:string};
                return <div key={n['id'] as string} className="flex gap-3 rounded-xl bg-surface-50 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-700 text-xs font-semibold text-white">{initials(a.name)}</div>
                  <div className="flex-1"><div className="flex justify-between"><span className="text-xs font-semibold">{a.name}</span><span className="text-2xs text-surface-400">{timeAgo(n['created_at'] as string)}</span></div><p className="mt-1 text-sm">{n['content'] as string}</p></div>
                  <button onClick={()=>deleteNote.mutate(n['id'] as string)} className="shrink-0 rounded p-1 text-surface-300 hover:text-red-500"><Trash2 size={14}/></button>
                </div>;
              })}
            </div>
          )}
          {tab === 'Deals' && (deals.length===0 ? <EmptyState title="Sin deals" /> :
            <div className="space-y-2">{deals.map((d)=><div key={d['id'] as string} className="flex items-center justify-between rounded-xl border border-surface-100 px-4 py-3"><div><p className="text-sm font-medium">{(d['property'] as {title:string})?.title}</p></div><DealStatusBadge status={d['status'] as string}/></div>)}</div>
          )}
          {tab === 'Tareas' && (tasks.length===0 ? <EmptyState title="Sin tareas" /> :
            <div className="space-y-2">{tasks.map((t)=><div key={t['id'] as string} className="flex items-center gap-3 rounded-xl border border-surface-100 p-3"><span className={`h-4 w-4 rounded border-2 shrink-0 ${t['completed']?'border-green-500 bg-green-500':'border-surface-300'}`}/><p className={`flex-1 text-sm ${t['completed']?'line-through text-surface-400':''}`}>{t['title'] as string}</p><PriorityBadge priority={t['priority'] as string}/></div>)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
