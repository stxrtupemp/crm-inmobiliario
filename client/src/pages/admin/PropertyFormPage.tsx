import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, GripVertical } from 'lucide-react';
import { useProperty, useCreateProperty, useUpdateProperty, useUploadPropertyImages, useDeletePropertyImage, useReorderPropertyImages, useAgents } from '../../hooks/useQueries';
import { Button } from '../../components/ui/Button';
import { Input }  from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuthStore } from '../../stores/authStore';
import { PageSpinner } from '../../components/ui/LoadingSpinner';

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
  title:       z.string().min(5),
  description: z.string().optional(),
  type:        z.string().min(1, 'Requerido'),
  operation:   z.string().min(1, 'Requerido'),
  status:      z.string().optional(),
  price:       z.coerce.number().positive('Precio requerido'),
  currency:    z.string().default('EUR'),
  area_m2:     z.coerce.number().optional(),
  bedrooms:    z.coerce.number().int().min(0).optional(),
  bathrooms:   z.coerce.number().int().min(0).optional(),
  parking:     z.coerce.number().int().min(0).optional(),
  address:     z.string().min(5),
  city:        z.string().min(2),
  zone:        z.string().optional(),
  lat:         z.coerce.number().optional(),
  lng:         z.coerce.number().optional(),
  agent_id:    z.string().optional(),
});
type FormData = z.infer<typeof schema>;

// ─── Option helpers ───────────────────────────────────────────────────────────
const TYPE_OPTS   = [{ value:'APARTMENT',label:'Piso/Apartamento' },{ value:'HOUSE',label:'Casa/Chalet' },{ value:'LAND',label:'Solar/Terreno' },{ value:'COMMERCIAL',label:'Local comercial' },{ value:'OFFICE',label:'Oficina' }];
const OP_OPTS     = [{ value:'SALE',label:'Venta' },{ value:'RENT',label:'Alquiler' }];
const STATUS_OPTS = [{ value:'AVAILABLE',label:'Disponible' },{ value:'RESERVED',label:'Reservado' },{ value:'SOLD',label:'Vendido' },{ value:'RENTED',label:'Alquilado' }];
const CUR_OPTS    = [{ value:'EUR',label:'EUR €' },{ value:'USD',label:'USD $' }];

// ─── Image manager ────────────────────────────────────────────────────────────
function ImageManager({ propertyId }: { propertyId: string }) {
  const { data: propData } = useProperty(propertyId);
  const prop     = propData as Record<string,unknown> | undefined;
  const images   = (prop?.images as { id: string; url: string; order: number; is_cover: boolean }[]) ?? [];
  const fileRef  = useRef<HTMLInputElement>(null);
  const uploadMut  = useUploadPropertyImages(propertyId);
  const deleteMut  = useDeletePropertyImage(propertyId);
  const reorderMut = useReorderPropertyImages(propertyId);

  // Drag state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const handleDrop = (toIdx: number) => {
    if (dragIdx === null || dragIdx === toIdx) return;
    const reordered = [...images];
    const [moved]   = reordered.splice(dragIdx, 1);
    if (moved) reordered.splice(toIdx, 0, moved);
    reorderMut.mutate(reordered.map((img) => img.id));
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-surface-700">Imágenes</p>
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div
            key={img.id}
            draggable
            onDragStart={() => setDragIdx(i)}
            onDragOver={(e) => { e.preventDefault(); setOverIdx(i); }}
            onDrop={() => handleDrop(i)}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
            className={`group relative h-24 w-32 cursor-grab overflow-hidden rounded-lg border-2 transition-all ${overIdx === i ? 'border-primary-500 scale-105' : 'border-transparent'} ${img.is_cover ? 'ring-2 ring-primary-500' : ''}`}
          >
            <img src={img.url} className="h-full w-full object-cover" alt="" />
            <div className="absolute inset-0 flex items-start justify-between bg-black/0 p-1 transition-all group-hover:bg-black/20">
              <GripVertical size={14} className="text-white opacity-0 group-hover:opacity-100" />
              <button
                type="button"
                onClick={() => deleteMut.mutate(img.id)}
                className="rounded bg-red-500 p-0.5 text-white opacity-0 group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
            {img.is_cover && (
              <span className="absolute bottom-1 left-1 rounded bg-primary-600 px-1.5 py-0.5 text-2xs font-semibold text-white">
                Portada
              </span>
            )}
          </div>
        ))}

        {/* Upload button */}
        {images.length < 10 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-24 w-32 flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-surface-300 text-surface-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
          >
            <Upload size={20} />
            <span className="text-xs">Subir</span>
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files?.length) uploadMut.mutate(e.target.files); }}
      />
      {uploadMut.isPending && <p className="mt-2 text-xs text-primary-600">Subiendo imágenes…</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function PropertyFormPage() {
  const { id }   = useParams<{ id: string }>();
  const isEdit   = !!id;
  const navigate = useNavigate();
  const isAdmin  = useAuthStore((s) => s.user?.role === 'ADMIN');

  const { data: propData, isLoading } = useProperty(id ?? '');
  const { data: agentsData }          = useAgents();
  const existing = propData as Record<string,unknown> | undefined;
  const agents   = (agentsData?.data ?? []) as Record<string,unknown>[];

  const createMut = useCreateProperty();
  const updateMut = useUpdateProperty(id ?? '');
  const isBusy    = createMut.isPending || updateMut.isPending;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'EUR', status: 'AVAILABLE' },
  });

  useEffect(() => {
    if (existing) {
      reset({
        title:       existing['title'] as string,
        description: existing['description'] as string ?? '',
        type:        existing['type'] as string,
        operation:   existing['operation'] as string,
        status:      existing['status'] as string,
        price:       Number(existing['price']),
        currency:    existing['currency'] as string,
        area_m2:     existing['area_m2'] ? Number(existing['area_m2']) : undefined,
        bedrooms:    existing['bedrooms'] as number ?? undefined,
        bathrooms:   existing['bathrooms'] as number ?? undefined,
        parking:     existing['parking'] as number ?? undefined,
        address:     existing['address'] as string,
        city:        existing['city'] as string,
        zone:        existing['zone'] as string ?? '',
        lat:         existing['lat'] ? Number(existing['lat']) : undefined,
        lng:         existing['lng'] ? Number(existing['lng']) : undefined,
        agent_id:    (existing['agent'] as { id: string })?.id,
      });
    }
  }, [existing, reset]);

  const onSubmit = async (data: FormData) => {
    if (isEdit) {
      await updateMut.mutateAsync(data);
    } else {
      const created = await createMut.mutateAsync(data) as Record<string,unknown>;
      navigate(`/admin/properties/${created['id']}/edit`, { replace: true });
      return;
    }
    navigate(`/admin/properties/${id}`);
  };

  if (isEdit && isLoading) return <PageSpinner />;

  const agentOpts = [
    { value: '', label: 'Asignar agente' },
    ...agents.map((a) => ({ value: a['id'] as string, label: a['name'] as string })),
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in">
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Editar propiedad' : 'Nueva propiedad'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Básico */}
        <section className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-surface-700">Información básica</h2>
          <Input label="Título *" {...register('title')} error={errors.title?.message} />
          <div>
            <label className="text-sm font-medium text-surface-700">Descripción</label>
            <textarea rows={4} {...register('description')} className="field-base mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tipo *" options={TYPE_OPTS}   {...register('type')}      error={errors.type?.message} />
            <Select label="Operación *" options={OP_OPTS} {...register('operation')} error={errors.operation?.message} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Estado" options={STATUS_OPTS} {...register('status')} />
            {isAdmin && <Select label="Agente" options={agentOpts} {...register('agent_id')} />}
          </div>
        </section>

        {/* Económico */}
        <section className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-surface-700">Precio</h2>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Precio *" type="number" {...register('price')} error={errors.price?.message} wrapperClass="col-span-2" />
            <Select label="Moneda" options={CUR_OPTS} {...register('currency')} />
          </div>
        </section>

        {/* Características */}
        <section className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-surface-700">Características</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Input label="Superficie m²" type="number" {...register('area_m2')} />
            <Input label="Habitaciones"  type="number" {...register('bedrooms')} />
            <Input label="Baños"         type="number" {...register('bathrooms')} />
            <Input label="Parking"       type="number" {...register('parking')} />
          </div>
        </section>

        {/* Ubicación */}
        <section className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-surface-700">Ubicación</h2>
          <Input label="Dirección *" {...register('address')} error={errors.address?.message} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ciudad *" {...register('city')} error={errors.city?.message} />
            <Input label="Zona / Barrio" {...register('zone')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Latitud"  type="number" step="0.000001" {...register('lat')} hint="Ej: 40.416775" />
            <Input label="Longitud" type="number" step="0.000001" {...register('lng')} hint="Ej: -3.703790" />
          </div>
        </section>

        {/* Imágenes (solo en modo edición) */}
        {isEdit && id && (
          <section className="card p-6">
            <ImageManager propertyId={id} />
          </section>
        )}

        {!isEdit && (
          <p className="text-xs text-surface-500">* Podrás subir imágenes después de crear la propiedad.</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" loading={isBusy}>
            {isEdit ? 'Guardar cambios' : 'Crear propiedad'}
          </Button>
        </div>
      </form>
    </div>
  );
}
