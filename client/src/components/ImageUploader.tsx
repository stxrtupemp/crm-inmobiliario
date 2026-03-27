import {
  useRef, useState, useCallback, DragEvent, ChangeEvent,
} from 'react';
import { Upload, X, GripVertical, Star, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadedImage {
  id:       string;
  url:      string;
  order:    number;
  is_cover: boolean;
}

interface UploadProgress {
  file:    string;   // filename
  percent: number;   // 0-100
  error?:  string;
}

interface ImageUploaderProps {
  propertyId:   string;
  images:       UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?:   number;
  disabled?:    boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED      = '.jpg,.jpeg,.png,.webp';
const MAX_FILE_SIZE = 5 * 1024 * 1024;  // 5 MB

// ─── Component ────────────────────────────────────────────────────────────────

export function ImageUploader({
  propertyId,
  images,
  onImagesChange,
  maxImages  = 10,
  disabled   = false,
}: ImageUploaderProps) {
  const fileRef          = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [progress,   setProgress]     = useState<UploadProgress[]>([]);
  const [dragIdx,    setDragIdx]      = useState<number | null>(null);
  const [overIdx,    setOverIdx]      = useState<number | null>(null);

  const remaining = maxImages - images.length;
  const isUploading = progress.some((p) => p.percent < 100 && !p.error);

  // ── Validation ─────────────────────────────────────────────────────────────
  function validateFile(file: File): string | null {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      return `"${file.name}" no es una imagen válida (JPEG, PNG o WebP).`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `"${file.name}" supera el límite de 5 MB.`;
    }
    return null;
  }

  // ── Upload handler ─────────────────────────────────────────────────────────
  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).slice(0, remaining);
      if (!fileArray.length) return;

      // Validate all files first
      const errors = fileArray.map((f) => ({ file: f.name, error: validateFile(f) ?? undefined, percent: 0 }));
      const invalid = errors.filter((e) => e.error);
      if (invalid.length) {
        setProgress(invalid);
        return;
      }

      // Upload each file with individual progress tracking
      setProgress(fileArray.map((f) => ({ file: f.name, percent: 0 })));

      const results = await Promise.allSettled(
        fileArray.map((file, i) => {
          const fd = new FormData();
          fd.append('images', file);

          return api.post<{ data: UploadedImage[] }>(
            `/properties/${propertyId}/images`,
            fd,
            {
              headers: { 'Content-Type': 'multipart/form-data' },
              onUploadProgress: (evt) => {
                const percent = evt.total
                  ? Math.round((evt.loaded / evt.total) * 100)
                  : 50;
                setProgress((prev) =>
                  prev.map((p, pi) => (pi === i ? { ...p, percent } : p)),
                );
              },
            },
          );
        }),
      );

      // Collect newly uploaded images
      const newImages: UploadedImage[] = [];
      const updatedProgress: UploadProgress[] = [...progress];

      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          const uploaded = result.value.data.data;
          newImages.push(...uploaded);
          if (updatedProgress[i]) updatedProgress[i]!.percent = 100;
        } else {
          const msg = (result.reason as { message?: string })?.message ?? 'Error al subir';
          if (updatedProgress[i]) updatedProgress[i]!.error = msg;
        }
      });

      setProgress(updatedProgress);
      onImagesChange([...images, ...newImages]);

      // Clear progress after 2 s (unless there are errors)
      if (!updatedProgress.some((p) => p.error)) {
        setTimeout(() => setProgress([]), 2000);
      }
    },
    [propertyId, images, remaining, onImagesChange],
  );

  // ── Drop zone events ───────────────────────────────────────────────────────
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || !e.dataTransfer.files.length) return;
    void uploadFiles(e.dataTransfer.files);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      void uploadFiles(e.target.files);
      e.target.value = '';  // reset so same file can be re-selected
    }
  };

  // ── Drag-to-reorder ────────────────────────────────────────────────────────
  const handleReorderDrop = async (toIdx: number) => {
    if (dragIdx === null || dragIdx === toIdx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }

    const reordered = [...images];
    const [moved]   = reordered.splice(dragIdx, 1);
    if (moved) reordered.splice(toIdx, 0, moved);

    // Optimistic update
    onImagesChange(reordered.map((img, i) => ({ ...img, order: i, is_cover: i === 0 })));

    try {
      await api.patch(`/properties/${propertyId}/images/reorder`, {
        ids: reordered.map((img) => img.id),
      });
    } catch {
      // Revert on failure
      onImagesChange(images);
    }

    setDragIdx(null);
    setOverIdx(null);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (imageId: string) => {
    const prev = images;
    onImagesChange(images.filter((img) => img.id !== imageId));

    try {
      await api.delete(`/properties/${propertyId}/images/${imageId}`);
    } catch {
      onImagesChange(prev);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {remaining > 0 && !disabled && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Zona de carga de imágenes"
          onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed',
            'px-6 py-10 text-center transition-all duration-200 select-none',
            isDragging
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-surface-300 bg-surface-50 text-surface-500 hover:border-primary-400 hover:bg-primary-50/30',
          )}
        >
          {isUploading ? (
            <Loader2 size={28} className="animate-spin text-primary-500" />
          ) : (
            <Upload size={28} />
          )}
          <div>
            <p className="text-sm font-semibold">
              {isDragging ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
            </p>
            <p className="mt-0.5 text-xs text-surface-400">
              JPEG, PNG o WebP · Máx. 5 MB por archivo · {remaining} imagen{remaining !== 1 ? 'es' : ''} restante{remaining !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED}
        multiple
        className="hidden"
        onChange={onFileChange}
        aria-hidden="true"
      />

      {/* Upload progress */}
      {progress.length > 0 && (
        <div className="space-y-2">
          {progress.map((p, i) => (
            <div key={i} className="rounded-xl border border-surface-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="truncate text-xs font-medium text-surface-700">{p.file}</p>
                <div className="flex items-center gap-2 shrink-0">
                  {p.error ? (
                    <AlertCircle size={14} className="text-red-500" />
                  ) : p.percent === 100 ? (
                    <span className="text-xs text-green-600 font-semibold">✓</span>
                  ) : (
                    <span className="text-xs text-surface-500">{p.percent}%</span>
                  )}
                  {p.error && (
                    <button
                      onClick={() => setProgress((prev) => prev.filter((_, pi) => pi !== i))}
                      className="text-surface-400 hover:text-surface-600"
                      aria-label="Descartar error"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              {p.error ? (
                <p className="text-xs text-red-500">{p.error}</p>
              ) : (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-200">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      p.percent === 100 ? 'bg-green-500' : 'bg-primary-500',
                    )}
                    style={{ width: `${p.percent}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-surface-500">
            {images.length} imagen{images.length !== 1 ? 'es' : ''} · Arrastra para reordenar
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {images.map((img, i) => (
              <div
                key={img.id}
                draggable={!disabled}
                onDragStart={() => setDragIdx(i)}
                onDragOver={(e) => { e.preventDefault(); setOverIdx(i); }}
                onDrop={() => void handleReorderDrop(i)}
                onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
                className={cn(
                  'group relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-150',
                  img.is_cover     ? 'ring-2 ring-primary-500 ring-offset-1 border-transparent' : 'border-transparent',
                  dragIdx === i    ? 'opacity-40 scale-95' : '',
                  overIdx === i && dragIdx !== i ? 'border-primary-400 scale-105 shadow-lg' : '',
                  !disabled        ? 'cursor-grab active:cursor-grabbing' : '',
                )}
              >
                <img
                  src={img.url}
                  alt={`Imagen ${i + 1}${img.is_cover ? ' (portada)' : ''}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />

                {/* Overlay on hover */}
                {!disabled && (
                  <div className="absolute inset-0 flex items-start justify-between bg-black/0 p-1.5 transition-all group-hover:bg-black/25">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="rounded bg-black/50 p-1 text-white">
                        <GripVertical size={12} />
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete(img.id)}
                      aria-label={`Eliminar imagen ${i + 1}`}
                      className="rounded-full bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Cover badge */}
                {img.is_cover && (
                  <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-primary-600 px-1.5 py-0.5">
                    <Star size={9} className="fill-white text-white" aria-hidden="true" />
                    <span className="text-2xs font-bold text-white leading-none">Portada</span>
                  </div>
                )}

                {/* Order badge */}
                <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-2xs font-bold text-white">
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-2xs text-surface-400">
            La primera imagen será la portada. Arrastra las miniaturas para cambiar el orden.
          </p>
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && remaining === 0 && (
        <p className="text-sm text-surface-500">Límite de {maxImages} imágenes alcanzado.</p>
      )}
    </div>
  );
}
