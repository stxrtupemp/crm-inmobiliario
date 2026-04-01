import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { SEO }           from '../../components/SEO';
import { useProperties } from '../../hooks/useQueries';
import { TENANT_SLUG }   from '../../lib/api';
import { Pagination }    from '../../components/ui/Pagination';
import { SkeletonCard }  from '../../components/ui/Skeleton';
import { PublicPropertyCard } from './HomePage';
import { cn }            from '../../lib/utils';

// ─── Filter config ────────────────────────────────────────────────────────────

const TYPE_OPTS = [
  { value: '',           label: 'Todos los tipos' },
  { value: 'APARTMENT',  label: 'Piso / Apartamento' },
  { value: 'HOUSE',      label: 'Casa / Chalet' },
  { value: 'LAND',       label: 'Solar / Terreno' },
  { value: 'COMMERCIAL', label: 'Local comercial' },
  { value: 'OFFICE',     label: 'Oficina' },
];

const OP_OPTS = [
  { value: '',     label: 'Venta y alquiler' },
  { value: 'SALE', label: 'En venta'         },
  { value: 'RENT', label: 'En alquiler'      },
];

const SORT_OPTS = [
  { value: 'created_at_desc', label: 'Más recientes'  },
  { value: 'price_asc',       label: 'Precio: menor'  },
  { value: 'price_desc',      label: 'Precio: mayor'  },
];

const BEDROOM_OPTS = [
  { value: '',  label: 'Cualquiera' },
  { value: '1', label: '1 hab.'     },
  { value: '2', label: '2 hab.'     },
  { value: '3', label: '3 hab.'     },
  { value: '4', label: '4+ hab.'    },
];

const PRICE_RANGES = [
  { label: 'Sin límite', min: '', max: '' },
  { label: 'Hasta 150.000 €',  min: '', max: '150000' },
  { label: '150.000 – 300.000 €', min: '150000', max: '300000' },
  { label: '300.000 – 600.000 €', min: '300000', max: '600000' },
  { label: 'Más de 600.000 €', min: '600000', max: '' },
];

// ─── Sidebar filter component ─────────────────────────────────────────────────

interface Filters {
  operation: string; type: string; city: string; zone: string;
  bedrooms: string;  priceMin: string; priceMax: string;
}

function FilterSidebar({
  filters, onChange, onReset,
}: {
  filters: Filters;
  onChange: (k: keyof Filters, v: string) => void;
  onReset: () => void;
}) {
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <aside className="sticky top-24 w-full space-y-5 rounded-2xl border border-cream-200 bg-white p-5 shadow-card lg:w-72 shrink-0">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-navy-800">Filtros</p>
        {hasFilters && (
          <button onClick={onReset} className="flex items-center gap-1 text-xs text-gold-600 hover:text-gold-700">
            <X size={12} /> Limpiar
          </button>
        )}
      </div>

      {/* Operación */}
      <FilterGroup label="Operación">
        <div className="flex gap-2">
          {OP_OPTS.map((o) => (
            <button key={o.value} onClick={() => onChange('operation', o.value)}
              className={cn('flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                filters.operation === o.value ? 'bg-navy-800 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200')}>
              {o.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Tipo */}
      <FilterGroup label="Tipo de inmueble">
        <div className="space-y-1">
          {TYPE_OPTS.map((o) => (
            <button key={o.value} onClick={() => onChange('type', o.value)}
              className={cn('w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors',
                filters.type === o.value ? 'bg-gold-500/10 text-gold-700 font-semibold' : 'text-surface-600 hover:bg-surface-50')}>
              {o.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Ciudad */}
      <FilterGroup label="Ciudad">
        <input
          type="text"
          value={filters.city}
          onChange={(e) => onChange('city', e.target.value)}
          placeholder="Ej: Madrid, Barcelona…"
          className="field-base text-xs"
        />
      </FilterGroup>

      {/* Zona */}
      <FilterGroup label="Zona / Barrio">
        <input
          type="text"
          value={filters.zone}
          onChange={(e) => onChange('zone', e.target.value)}
          placeholder="Ej: Salamanca, Eixample…"
          className="field-base text-xs"
        />
      </FilterGroup>

      {/* Habitaciones */}
      <FilterGroup label="Habitaciones">
        <div className="flex flex-wrap gap-2">
          {BEDROOM_OPTS.map((o) => (
            <button key={o.value} onClick={() => onChange('bedrooms', o.value)}
              className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                filters.bedrooms === o.value ? 'bg-navy-800 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200')}>
              {o.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Precio */}
      <FilterGroup label="Rango de precio">
        <div className="space-y-1">
          {PRICE_RANGES.map((r) => {
            const active = filters.priceMin === r.min && filters.priceMax === r.max;
            return (
              <button key={r.label} onClick={() => { onChange('priceMin', r.min); onChange('priceMax', r.max); }}
                className={cn('w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors',
                  active ? 'bg-gold-500/10 text-gold-700 font-semibold' : 'text-surface-600 hover:bg-surface-50')}>
                {r.label}
              </button>
            );
          })}
        </div>
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 border-t border-cream-200 pt-4">
      <p className="text-xs font-bold uppercase tracking-wide text-surface-500">{label}</p>
      {children}
    </div>
  );
}

// ─── Mobile filter drawer ─────────────────────────────────────────────────────

function MobileFilters({
  filters, onChange, onReset, open, onClose,
}: {
  filters: Filters;
  onChange: (k: keyof Filters, v: string) => void;
  onReset: () => void;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative ml-auto h-full w-80 overflow-y-auto bg-white p-5 shadow-modal animate-in">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-bold text-navy-800">Filtros</p>
          <button onClick={onClose} className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100"><X size={18} /></button>
        </div>
        <FilterSidebar filters={filters} onChange={onChange} onReset={onReset} />
        <button onClick={onClose} className="btn-gold mt-6 w-full justify-center">Ver resultados</button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const EMPTY_FILTERS: Filters = {
  operation: '', type: '', city: '', zone: '', bedrooms: '', priceMin: '', priceMax: '',
};

export function ListingsPage() {
  const [searchParams] = useSearchParams();
  const [page,     setPage]     = useState(1);
  const [sort,     setSort]     = useState('created_at_desc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    ...EMPTY_FILTERS,
    operation: searchParams.get('operation') ?? '',
    type:      searchParams.get('type') ?? '',
    city:      searchParams.get('city') ?? '',
  });

  // Sync URL params on mount
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      operation: searchParams.get('operation') ?? '',
      type:      searchParams.get('type') ?? '',
    }));
    setPage(1);
  }, [searchParams.toString()]);

  const changeFilter = (k: keyof Filters, v: string) => {
    setFilters((f) => ({ ...f, [k]: v }));
    setPage(1);
  };

  const resetFilters = () => { setFilters(EMPTY_FILTERS); setPage(1); };

  const params: Record<string, unknown> = {
    page, limit: 12, status: 'AVAILABLE', sort,
    ...(TENANT_SLUG && { tenant: TENANT_SLUG }),
    ...(filters.operation && { operation: filters.operation }),
    ...(filters.type      && { type:      filters.type      }),
    ...(filters.city      && { city:      filters.city      }),
    ...(filters.zone      && { zone:      filters.zone      }),
    ...(filters.bedrooms  && { bedrooms:  filters.bedrooms  }),
    ...(filters.priceMin  && { price_min: filters.priceMin  }),
    ...(filters.priceMax  && { price_max: filters.priceMax  }),
  };

  const { data, isLoading } = useProperties(params);
  const items = (data?.data ?? []) as Record<string, unknown>[];
  const meta  = data?.meta;

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <>
      <SEO
        title="Propiedades"
        description="Explora nuestro catálogo de pisos, casas, locales y solares en venta y alquiler. Filtra por tipo, ciudad, precio y más."
      />

      {/* Page header */}
      <div className="border-b border-cream-200 bg-white">
        <div className="pub-container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-6">
          <div>
            <h1 className="pub-heading">Propiedades</h1>
            {meta && (
              <p className="mt-1 text-sm text-surface-500">
                {meta.total} inmueble{meta.total !== 1 ? 's' : ''} encontrado{meta.total !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setFiltersOpen(true)}
              className={cn('flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors lg:hidden',
                activeCount > 0 ? 'border-gold-400 bg-gold-50 text-gold-700' : 'border-surface-300 text-surface-700 hover:bg-surface-50')}
            >
              <SlidersHorizontal size={15} />
              Filtros{activeCount > 0 ? ` (${activeCount})` : ''}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none rounded-xl border border-surface-300 bg-white py-2 pl-3 pr-8 text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-gold-400"
              >
                {SORT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pub-container py-8">
        <div className="flex gap-8">
          {/* Sidebar — desktop only */}
          <div className="hidden lg:block">
            <FilterSidebar filters={filters} onChange={changeFilter} onReset={resetFilters} />
          </div>

          {/* Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream-200 text-surface-400">
                  <SlidersHorizontal size={28} />
                </div>
                <p className="font-serif text-lg font-semibold text-navy-800">Sin resultados</p>
                <p className="mt-1 text-sm text-surface-500">Prueba a ampliar los filtros de búsqueda.</p>
                <button onClick={resetFilters} className="mt-4 text-sm font-semibold text-gold-600 hover:text-gold-700">
                  Quitar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((p) => <PublicPropertyCard key={p['id'] as string} p={p} />)}
                </div>
                {meta && (
                  <div className="mt-10">
                    <Pagination meta={meta} onPageChange={setPage} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <MobileFilters
        filters={filters} onChange={changeFilter} onReset={resetFilters}
        open={filtersOpen} onClose={() => setFiltersOpen(false)}
      />
    </>
  );
}
