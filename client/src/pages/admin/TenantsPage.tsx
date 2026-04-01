import { useState } from 'react';
import { Building2, Plus, Users, Search, X } from 'lucide-react';
import { useTenants, useCreateTenant, useUpdateTenant, useCreateTenantUser } from '../../hooks/useQueries';
import { Button }     from '../../components/ui/Button';
import { Modal }      from '../../components/ui/Modal';
import { Input }      from '../../components/ui/Input';
import { Badge }      from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonRow, EmptyState } from '../../components/ui/Skeleton';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

type TenantRecord = {
  id: string; name: string; slug: string; domain: string | null;
  active: boolean; created_at: string;
  _count: { users: number; properties: number };
};

// ─── New tenant modal ─────────────────────────────────────────────────────────

function NewTenantModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', slug: '' });
  const [err,  setErr]  = useState('');
  const createMut = useCreateTenant();

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const change = (k: keyof typeof form, v: string) => {
    setForm((f) => ({
      ...f,
      [k]: v,
      ...(k === 'name' ? { slug: autoSlug(v) } : {}),
    }));
  };

  const submit = async () => {
    setErr('');
    if (!form.name.trim() || !form.slug.trim()) { setErr('Nombre y slug son obligatorios.'); return; }
    if (!/^[a-z0-9-]+$/.test(form.slug)) { setErr('Slug: solo minúsculas, números y guiones.'); return; }
    try {
      await createMut.mutateAsync(form);
      onClose();
      setForm({ name: '', slug: '' });
    } catch (e: unknown) {
      setErr((e as { message?: string })?.message ?? 'Error al crear empresa');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva empresa"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} loading={createMut.isPending}>Crear empresa</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Nombre *"
          value={form.name}
          onChange={(e) => change('name', e.target.value)}
          placeholder="Inmobiliaria Ejemplo"
        />
        <Input
          label="Slug *"
          value={form.slug}
          onChange={(e) => change('slug', e.target.value)}
          placeholder="inmobiliaria-ejemplo"
          helperText="Identificador único en URL: letras minúsculas, números y guiones"
        />
        {err && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{err}</p>}
      </div>
    </Modal>
  );
}

// ─── New user modal ───────────────────────────────────────────────────────────

function NewUserModal({ tenant, open, onClose }: { tenant: TenantRecord | null; open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ADMIN' });
  const [err,  setErr]  = useState('');
  const createMut = useCreateTenantUser(tenant?.id ?? '');

  const submit = async () => {
    setErr('');
    if (!form.name || !form.email || !form.password) { setErr('Nombre, email y contraseña son obligatorios.'); return; }
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      setErr('La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número.');
      return;
    }
    try {
      await createMut.mutateAsync(form);
      onClose();
      setForm({ name: '', email: '', password: '', role: 'ADMIN' });
    } catch (e: unknown) {
      setErr((e as { message?: string })?.message ?? 'Error al crear usuario');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Nuevo usuario en ${tenant?.name ?? ''}`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} loading={createMut.isPending}>Crear usuario</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Nombre *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <Input label="Contraseña *" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} helperText="Mín. 8 chars, 1 mayúscula, 1 número" />
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Rol</label>
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            className="field-base"
          >
            <option value="ADMIN">Admin</option>
            <option value="AGENT">Agente</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>
        {err && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{err}</p>}
      </div>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function TenantsPage() {
  const [page,    setPage]   = useState(1);
  const [search,  setSearch] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [userTarget, setUserTarget] = useState<TenantRecord | null>(null);

  const { data, isLoading } = useTenants({ page, limit: 20, ...(search && { search }) });
  const items = (data?.data ?? []) as TenantRecord[];
  const meta  = data?.meta;

  return (
    <div className="space-y-5 animate-in">
      <div className="page-header">
        <h1 className="page-title">Empresas</h1>
        <Button iconLeft={<Plus size={16} />} onClick={() => setNewOpen(true)}>Nueva empresa</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar empresa…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search size={15} />}
          wrapperClass="w-64"
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100 bg-surface-50 text-left">
              {['Empresa', 'Slug', 'Usuarios', 'Propiedades', 'Estado', 'Alta', 'Acciones'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-surface-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              : items.map((t) => (
                <tr key={t.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 font-bold text-sm">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-medium text-surface-900">{t.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-surface-100 px-1.5 py-0.5 text-xs text-surface-700">{t.slug}</code>
                  </td>
                  <td className="px-4 py-3 text-surface-600">{t._count.users}</td>
                  <td className="px-4 py-3 text-surface-600">{t._count.properties}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.active ? 'success' : 'default'} dot>
                      {t.active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-surface-500">{formatDate(t.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setUserTarget(t)}
                      className="flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100 transition-colors"
                    >
                      <Users size={13} /> Añadir usuario
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {!isLoading && items.length === 0 && (
          <EmptyState icon={<Building2 size={24} />} title="No hay empresas" description="Crea la primera empresa con el botón de arriba." />
        )}
      </div>

      {meta && <Pagination meta={meta} onPageChange={setPage} />}

      <NewTenantModal open={newOpen} onClose={() => setNewOpen(false)} />
      <NewUserModal tenant={userTarget} open={!!userTarget} onClose={() => setUserTarget(null)} />
    </div>
  );
}
