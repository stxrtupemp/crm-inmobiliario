import { useState } from 'react';
import { UserCog, Shield, Search } from 'lucide-react';
import { useUsers } from '../../hooks/useQueries';
import { apiPatch } from '../../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { Input }      from '../../components/ui/Input';
import { Select }     from '../../components/ui/Select';
import { Badge }      from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonRow, EmptyState } from '../../components/ui/Skeleton';
import { formatDate, initials, useDebounce } from '../../lib/utils';
import toast from 'react-hot-toast';

const ROLE_OPTS = [
  { value: '',       label: 'Todos los roles' },
  { value: 'ADMIN',  label: 'Admin'   },
  { value: 'AGENT',  label: 'Agente'  },
  { value: 'VIEWER', label: 'Viewer'  },
];

const ROLE_COLORS: Record<string, 'danger' | 'primary' | 'default'> = {
  ADMIN:  'danger',
  AGENT:  'primary',
  VIEWER: 'default',
};

export function UsersPage() {
  const qc = useQueryClient();
  const [page,    setPage]   = useState(1);
  const [search,  setSearch] = useState('');
  const [role,    setRole]   = useState('');
  const dSearch = useDebounce(search, 350);

  const params = { page, limit: 20, ...(role && { role }), ...(dSearch && { search: dSearch }) };
  const { data, isLoading } = useUsers(params);

  const items = (data?.data ?? []) as Record<string, unknown>[];
  const meta  = data?.meta;

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await apiPatch(`/users/${id}/active`, { active: !current });
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success(current ? 'Usuario desactivado' : 'Usuario activado');
    } catch {
      toast.error('Error al actualizar el usuario');
    }
  };

  return (
    <div className="space-y-5 animate-in">
      <div className="page-header">
        <h1 className="page-title">Usuarios</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar nombre…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search size={15} />}
          wrapperClass="w-56"
        />
        <Select
          options={ROLE_OPTS}
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          wrapperClass="w-40"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100 bg-surface-50 text-left">
              {['Usuario', 'Rol', 'Teléfono', 'Estado', 'Alta', 'Acciones'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-surface-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              : items.map((u) => (
                <tr key={u['id'] as string} className="hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-xs font-semibold text-white">
                        {initials(u['name'] as string)}
                      </div>
                      <div>
                        <p className="font-medium text-surface-900">{u['name'] as string}</p>
                        <p className="text-xs text-surface-500">{u['email'] as string}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={ROLE_COLORS[u['role'] as string] ?? 'default'}>
                      {u['role'] as string}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-surface-600">{u['phone'] as string ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u['active'] ? 'success' : 'default'} dot>
                      {u['active'] ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-surface-500">{formatDate(u['created_at'] as string)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(u['id'] as string, u['active'] as boolean)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        u['active']
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {u['active'] ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {!isLoading && items.length === 0 && (
          <EmptyState icon={<UserCog size={24} />} title="No hay usuarios" description="Crea usuarios desde el endpoint de registro." />
        )}
      </div>

      {meta && <Pagination meta={meta} onPageChange={setPage} />}
    </div>
  );
}
