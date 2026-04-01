import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiList, apiGet, apiPost, apiPut, apiPatch, apiDelete, api, TENANT_SLUG } from '../lib/api';
import { buildParams } from '../lib/utils';

// ─── QUERY KEYS ───────────────────────────────────────────────────────────────
export const QK = {
  dashboard:    ['dashboard', 'stats'] as const,
  properties:   (p?: Record<string,unknown>) => ['properties', p ?? {}] as const,
  property:     (id: string) => ['properties', id] as const,
  clients:      (p?: Record<string,unknown>) => ['clients', p ?? {}] as const,
  client:       (id: string) => ['clients', id] as const,
  deals:        (p?: Record<string,unknown>) => ['deals', p ?? {}] as const,
  deal:         (id: string) => ['deals', id] as const,
  tasks:        (p?: Record<string,unknown>) => ['tasks', p ?? {}] as const,
  notes:        (type: string, id: string) => ['notes', type, id] as const,
  webContacts:  (p?: Record<string,unknown>) => ['web-contacts', p ?? {}] as const,
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export function useDashboardStats() {
  return useQuery({
    queryKey: QK.dashboard,
    queryFn:  () => apiGet<Record<string, unknown>>('/dashboard/stats'),
  });
}

// ─── PROPERTIES ───────────────────────────────────────────────────────────────
export function useProperties(params: Record<string,unknown> = {}) {
  return useQuery({
    queryKey: QK.properties(params),
    queryFn:  () => apiList<Record<string,unknown>>('/properties', buildParams(params)),
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: QK.property(id),
    queryFn:  () => apiGet<Record<string,unknown>>(`/properties/${id}`),
    enabled:  !!id,
  });
}

export function usePropertyBySlug(slug: string) {
  return useQuery({
    queryKey: ['properties', 'slug', slug],
    queryFn:  () => apiGet<Record<string,unknown>>(`/properties/slug/${slug}`),
    enabled:  !!slug,
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string,unknown>) => apiPost('/properties', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['properties'] }); toast.success('Propiedad creada'); },
  });
}

export function useUpdateProperty(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string,unknown>) => apiPut(`/properties/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['properties'] }); toast.success('Propiedad actualizada'); },
  });
}

export function usePatchPropertyStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => apiPatch(`/properties/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['properties'] }); },
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/properties/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['properties'] }); toast.success('Propiedad eliminada'); },
  });
}

export function useUploadPropertyImages(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: FileList) => {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('images', f));
      return api.post(`/properties/${id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.property(id) }); toast.success('Imágenes subidas'); },
  });
}

export function useDeletePropertyImage(propertyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => apiDelete(`/properties/${propertyId}/images/${imageId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.property(propertyId) }); },
  });
}

export function useReorderPropertyImages(propertyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => apiPatch(`/properties/${propertyId}/images/reorder`, { ids }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.property(propertyId) }); },
  });
}

// ─── CLIENTS ──────────────────────────────────────────────────────────────────
export function useClients(params: Record<string,unknown> = {}) {
  return useQuery({
    queryKey: QK.clients(params),
    queryFn:  () => apiList<Record<string,unknown>>('/clients', buildParams(params)),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: QK.client(id),
    queryFn:  () => apiGet<Record<string,unknown>>(`/clients/${id}`),
    enabled:  !!id,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string,unknown>) => apiPost('/clients', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); toast.success('Cliente creado'); },
  });
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string,unknown>) => apiPut(`/clients/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); toast.success('Cliente actualizado'); },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/clients/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); toast.success('Cliente eliminado'); },
  });
}

// ─── DEALS ────────────────────────────────────────────────────────────────────
export function useDeals(params: Record<string,unknown> = {}) {
  return useQuery({
    queryKey: QK.deals(params),
    queryFn:  () => apiList<Record<string,unknown>>('/deals', buildParams(params)),
  });
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: QK.deal(id),
    queryFn:  () => apiGet<Record<string,unknown>>(`/deals/${id}`),
    enabled:  !!id,
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string,unknown>) => apiPost('/deals', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); toast.success('Deal creado'); },
  });
}

export function useUpdateDeal(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string,unknown>) => apiPut(`/deals/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); toast.success('Deal actualizado'); },
  });
}

export function usePatchDealStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch(`/deals/${id}/status`, { status }),

    onMutate: async ({ id, status }) => {
      // Cancelar fetches en vuelo para evitar sobreescribir el optimistic update
      await qc.cancelQueries({ queryKey: ['deals'] });

      // Guardar snapshot para rollback
      const previous = qc.getQueriesData({ queryKey: ['deals'] });

      // Actualizar todas las queries de deals en caché
      qc.setQueriesData(
        { queryKey: ['deals'] },
        (old: { data: Record<string, unknown>[]; meta: unknown } | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((d) =>
              d['id'] === id ? { ...d, status } : d
            ),
          };
        },
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      // Rollback si falla
      context?.previous?.forEach(([queryKey, data]) => {
        qc.setQueryData(queryKey, data);
      });
    },

    onSettled: () => {
      // Sincronizar con servidor siempre al terminar
      qc.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/deals/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); toast.success('Deal eliminado'); },
  });
}

export function useDealStats() {
  return useQuery({
    queryKey: ['deals', 'stats'],
    queryFn:  () => apiGet<Record<string,unknown>[]>('/deals/stats'),
  });
}

// ─── TASKS ────────────────────────────────────────────────────────────────────
export function useTasks(params: Record<string,unknown> = {}) {
  return useQuery({
    queryKey: QK.tasks(params),
    queryFn:  () => apiList<Record<string,unknown>>('/tasks', buildParams(params)),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string,unknown>) => apiPost('/tasks', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Tarea creada'); },
  });
}

export function useUpdateTask(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string,unknown>) => apiPut(`/tasks/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Tarea actualizada'); },
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPatch(`/tasks/${id}/toggle`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/tasks/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Tarea eliminada'); },
  });
}

// ─── NOTES ────────────────────────────────────────────────────────────────────
export function useNotes(entityType: string, entityId: string) {
  return useQuery({
    queryKey: QK.notes(entityType, entityId),
    queryFn:  () => apiList<Record<string,unknown>>('/notes', { entity_type: entityType, entity_id: entityId }),
    enabled:  !!entityId,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string; entity_type: string; entity_id: string }) =>
      apiPost('/notes', data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: QK.notes(vars.entity_type, vars.entity_id) });
    },
  });
}

export function useDeleteNote(entityType: string, entityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/notes/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.notes(entityType, entityId) }); },
  });
}

// ─── WEB CONTACTS ─────────────────────────────────────────────────────────────
export function useWebContacts(params: Record<string,unknown> = {}) {
  return useQuery({
    queryKey: QK.webContacts(params),
    queryFn:  () => apiList<Record<string,unknown>>('/web-contacts', buildParams(params)),
    refetchInterval: 60_000,  // añadir esta línea
  });
}

export function useMarkContactRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPatch(`/web-contacts/${id}/read`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['web-contacts'] }); },
  });
}

// ─── USERS ────────────────────────────────────────────────────────────────────
export function useUsers(params: Record<string,unknown> = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn:  () => apiList<Record<string,unknown>>('/users', buildParams(params)),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAgents() {
  return useQuery({
    queryKey: ['users', 'agents'],
    queryFn:  () => apiList<Record<string,unknown>>('/users', { role: 'AGENT', active: 'true', limit: '100' }),
    staleTime: 1000 * 60 * 10,
  });
}

// ─── TENANTS ──────────────────────────────────────────────────────────────────
export function useTenants(params: Record<string,unknown> = {}) {
  return useQuery({
    queryKey: ['tenants', params],
    queryFn:  () => apiList<Record<string,unknown>>('/tenants', buildParams(params)),
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string,unknown>) => apiPost('/tenants', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tenants'] }); toast.success('Empresa creada'); },
  });
}

export function useUpdateTenant(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string,unknown>) => apiPatch(`/tenants/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tenants'] }); toast.success('Empresa actualizada'); },
  });
}

export function useCreateTenantUser(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string,unknown>) => apiPost(`/tenants/${tenantId}/users`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tenants'] }); toast.success('Usuario creado'); },
  });
}
