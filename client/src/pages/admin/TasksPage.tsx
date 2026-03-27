import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, CheckSquare, Square, Pencil, Trash2, Filter } from 'lucide-react';
import { useTasks, useCreateTask, useUpdateTask, useToggleTask, useDeleteTask, useUsers, useProperties } from '../../hooks/useQueries';
import { Button }     from '../../components/ui/Button';
import { Input }      from '../../components/ui/Input';
import { Select }     from '../../components/ui/Select';
import { Modal }      from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { PriorityBadge } from '../../components/ui/Badge';
import { SkeletonRow, EmptyState } from '../../components/ui/Skeleton';
import { formatDate, cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';

// ─── Form schema ──────────────────────────────────────────────────────────────
const taskSchema = z.object({
  title:       z.string().min(3, 'Mínimo 3 caracteres'),
  description: z.string().optional(),
  priority:    z.string().default('MEDIUM'),
  due_date:    z.string().optional(),
  assigned_to: z.string().min(1, 'Asigna a alguien'),
  property_id: z.string().optional(),
});
type TaskForm = z.infer<typeof taskSchema>;

const PRIORITY_OPTS = [{ value:'LOW',label:'Baja' },{ value:'MEDIUM',label:'Media' },{ value:'HIGH',label:'Alta' },{ value:'URGENT',label:'Urgente' }];
const STATUS_FILTER = [{ value:'',label:'Todas' },{ value:'false',label:'Pendientes' },{ value:'true',label:'Completadas' }];

// ─── Task form modal ──────────────────────────────────────────────────────────
function TaskModal({ open, onClose, editTask }: {
  open: boolean; onClose: () => void; editTask?: Record<string,unknown>;
}) {
  const userId    = useAuthStore((s) => s.user?.id ?? '');
  const createMut = useCreateTask();
  const updateMut = useUpdateTask((editTask?.id as string) ?? '');
  const isBusy    = createMut.isPending || updateMut.isPending;

  const { data: usersData } = useUsers({ active: 'true', limit: '100' });
  const usersList = (usersData?.data ?? []) as Record<string, unknown>[];
  const userOpts  = usersList.map((u) => ({ value: u['id'] as string, label: `${u['name'] as string} (${u['role'] as string})` }));

  const { data: propsData } = useProperties({ limit: 100, status: 'AVAILABLE' });
  const propsList = (propsData?.data ?? []) as Record<string, unknown>[];
  const propOpts  = propsList.map((p) => ({ value: p['id'] as string, label: p['title'] as string }));

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: 'MEDIUM', assigned_to: userId },
  });

  useEffect(() => {
    if (editTask) {
      reset({
        title:       editTask['title'] as string ?? '',
        description: editTask['description'] as string ?? '',
        priority:    editTask['priority'] as string ?? 'MEDIUM',
        due_date:    editTask['due_date'] ? (editTask['due_date'] as string).slice(0, 10) : '',
        assigned_to: (editTask['assignee'] as { id: string } | undefined)?.id ?? userId,
        property_id: (editTask['property'] as { id: string } | undefined)?.id ?? '',
      });
    } else {
      reset({ priority: 'MEDIUM', assigned_to: userId, title: '', description: '', due_date: '', property_id: '' });
    }
  }, [editTask, reset, userId]);

  const onSubmit = async (data: TaskForm) => {
    const payload = {
      ...data,
      due_date:    data.due_date    || undefined,
      property_id: data.property_id || undefined,
    };
    if (editTask) await updateMut.mutateAsync(payload);
    else          await createMut.mutateAsync(payload);
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editTask ? 'Editar tarea' : 'Nueva tarea'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isBusy}>
            {editTask ? 'Guardar' : 'Crear tarea'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Título *" {...register('title')} error={errors.title?.message} />
        <div>
          <label className="text-sm font-medium text-surface-700">Descripción</label>
          <textarea rows={2} {...register('description')} className="field-base mt-1 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Prioridad" options={PRIORITY_OPTS} {...register('priority')} />
          <Input  label="Fecha límite" type="date" {...register('due_date')} />
        </div>
        <Select
          label="Asignar a *"
          options={[{ value: '', label: 'Selecciona usuario...' }, ...userOpts]}
          {...register('assigned_to')}
          error={errors.assigned_to?.message}
        />
        <Select
          label="Propiedad relacionada"
          options={[{ value: '', label: 'Sin propiedad (opcional)' }, ...propOpts]}
          {...register('property_id')}
        />
      </div>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function TasksPage() {
  const [page,      setPage]    = useState(1);
  const [completed, setCompleted] = useState('');
  const [priority,  setPriority]  = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask,  setEditTask]  = useState<Record<string,unknown> | undefined>();
  const [deleteId,  setDeleteId]  = useState<string | null>(null);

  const params = { page, limit: 25, ...(completed !== '' && { completed }), ...(priority && { priority }) };
  const { data, isLoading } = useTasks(params);
  const toggleMut = useToggleTask();
  const deleteMut = useDeleteTask();

  const items = (data?.data ?? []) as Record<string,unknown>[];
  const meta  = data?.meta;

  const openEdit = (task: Record<string,unknown>) => { setEditTask(task); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTask(undefined); };

  return (
    <div className="space-y-5 animate-in">
      <div className="page-header">
        <h1 className="page-title">Tareas</h1>
        <Button iconLeft={<Plus size={16}/>} onClick={() => setModalOpen(true)}>Nueva tarea</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter size={15} className="text-surface-400" />
        <Select options={STATUS_FILTER}  value={completed} onChange={(e) => { setCompleted(e.target.value); setPage(1); }} wrapperClass="w-36" />
        <Select options={[{ value:'',label:'Prioridad' }, ...PRIORITY_OPTS]} value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }} wrapperClass="w-36" />
      </div>

      {/* Task list */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100 bg-surface-50 text-left">
              {['', 'Tarea', 'Prioridad', 'Asignada a', 'Vence', 'Acciones'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-surface-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              : items.map((t) => {
                const done     = t['completed'] as boolean;
                const assignee = t['assignee'] as { name: string } | undefined;
                const dueDate  = t['due_date'] as string | null;
                const isOverdue = !done && dueDate && new Date(dueDate) < new Date();

                return (
                  <tr key={t['id'] as string} className={cn('transition-colors', done ? 'bg-surface-50' : 'hover:bg-surface-50')}>
                    <td className="w-10 px-4 py-3">
                      <button
                        onClick={() => toggleMut.mutate(t['id'] as string)}
                        className={cn('transition-colors', done ? 'text-green-500' : 'text-surface-300 hover:text-primary-500')}
                      >
                        {done ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className={cn('font-medium text-surface-900', done && 'line-through text-surface-400')}>
                        {t['title'] as string}
                      </p>
                      {t['description'] && <p className="text-xs text-surface-500 line-clamp-1">{t['description'] as string}</p>}
                    </td>
                    <td className="px-4 py-3"><PriorityBadge priority={t['priority'] as string} /></td>
                    <td className="px-4 py-3 text-surface-600">{assignee?.name ?? '—'}</td>
                    <td className={cn('px-4 py-3 text-sm', isOverdue ? 'text-red-500 font-medium' : 'text-surface-500')}>
                      {dueDate ? formatDate(dueDate) : '—'}
                      {isOverdue && <span className="ml-1 text-xs">(vencida)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(t)} className="rounded p-1.5 text-surface-400 hover:bg-surface-100 hover:text-amber-600"><Pencil size={15}/></button>
                        <button onClick={() => setDeleteId(t['id'] as string)} className="rounded p-1.5 text-surface-400 hover:bg-surface-100 hover:text-red-600"><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
        {!isLoading && items.length === 0 && (
          <EmptyState icon={<CheckSquare size={24}/>} title="Sin tareas" description="¡Todo está al día!" action={<Button size="sm" onClick={() => setModalOpen(true)}>Nueva tarea</Button>} />
        )}
      </div>

      {meta && <Pagination meta={meta} onPageChange={setPage} />}

      <TaskModal open={modalOpen} onClose={closeModal} editTask={editTask} />

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }}
        loading={deleteMut.isPending}
        title="Eliminar tarea"
        description="¿Estás seguro de eliminar esta tarea?"
        confirmLabel="Eliminar"
        danger
      />
    </div>
  );
}
