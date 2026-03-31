import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Shield, Award, Clock, Building2, MapPin, Bed, Maximize2 } from 'lucide-react';
import { SEO }         from '../../components/SEO';
import { useProperties } from '../../hooks/useQueries';
import { SkeletonCard }  from '../../components/ui/Skeleton';
import { formatCurrency, formatArea } from '../../lib/utils';
import { cn } from '../../lib/utils';

type PropRecord = Record<string, unknown>;
const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Piso', HOUSE: 'Casa', LAND: 'Solar', COMMERCIAL: 'Local', OFFICE: 'Oficina',
};

export function PublicPropertyCard({ p }: { p: PropRecord }) {
  const images = (p['images'] as { url: string; is_cover: boolean }[]) ?? [];
  const cover  = images.find((i) => i.is_cover)?.url ?? images[0]?.url;
  return (
    <Link to={`/listings/${p['slug'] as string}`} className="prop-card group block">
      <div className="relative h-52 overflow-hidden bg-surface-200">
        {cover ? (
          <img
            src={cover}
            alt={`${p['title'] as string} — ${p['city'] as string}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-surface-300"><Building2 size={40} /></div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold text-white ${p['operation'] === 'SALE' ? 'bg-navy-800' : 'bg-gold-500'}`}>
            {p['operation'] === 'SALE' ? 'En venta' : 'En alquiler'}
          </span>
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-navy-800">
            {TYPE_LABELS[p['type'] as string] ?? p['type'] as string}
          </span>
        </div>
      </div>
      <div className="p-4">
        <p className="line-clamp-1 font-serif text-base font-semibold text-navy-800 group-hover:text-gold-600 transition-colors">
          {p['title'] as string}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-surface-500">
          <MapPin size={12} aria-hidden="true" />
          {p['address'] as string}, {p['city'] as string}{p['zone'] ? `, ${p['zone'] as string}` : ''}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-surface-500">
          {p['area_m2'] && <span className="flex items-center gap-1"><Maximize2 size={12} aria-hidden="true" />{formatArea(p['area_m2'] as number)}</span>}
          {p['bedrooms'] && <span className="flex items-center gap-1"><Bed size={12} aria-hidden="true" />{p['bedrooms'] as number} hab.</span>}
        </div>
        <div className="mt-3 border-t border-cream-200 pt-3">
          <p className="text-lg font-bold text-navy-800">
            {formatCurrency(p['price'] as number, p['currency'] as string)}
            {p['operation'] === 'RENT' && <span className="text-xs font-normal text-surface-500">/mes</span>}
          </p>
        </div>
      </div>
    </Link>
  );
}

const WHY_ITEMS = [
  { icon: <Shield size={28} className="text-gold-500" />, title: 'Máxima seguridad jurídica', desc: 'Cada operación supervisada por nuestro equipo legal. Tu inversión, protegida.' },
  { icon: <Award  size={28} className="text-gold-500" />, title: 'Más de 15 años de experiencia', desc: 'Más de 2.000 operaciones cerradas en Madrid y alrededores. Conocemos el mercado.' },
  { icon: <Clock  size={28} className="text-gold-500" />, title: 'Atención personalizada 360°', desc: 'Desde la primera visita hasta la firma, un agente dedicado estará contigo siempre.' },
] as const;

const STATS = [
  { value: '2.000+', label: 'Operaciones cerradas' },
  { value: '98%',    label: 'Clientes satisfechos'  },
  { value: '15+',    label: 'Años de experiencia'   },
  { value: '50+',    label: 'Agentes especializados' },
] as const;

function HeroSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [op,    setOp]    = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (op)    p.set('operation', op);
    if (query) p.set('city', query);
    navigate(`/listings?${p.toString()}`);
  };

  return (
    <form onSubmit={submit} className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
      <div className="flex w-full overflow-hidden rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm sm:w-auto sm:shrink-0">
        {(['', 'SALE', 'RENT'] as const).map((o) => (
          <button key={o} type="button" onClick={() => setOp(o)}
            className={cn('flex-1 px-4 py-3 text-sm font-semibold transition-colors', op === o ? 'bg-gold-500 text-white' : 'text-white/80 hover:text-white')}>
            {o === '' ? 'Todos' : o === 'SALE' ? 'Venta' : 'Alquiler'}
          </button>
        ))}
      </div>
      <div className="relative flex-1">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
        <input
          type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Ciudad, zona o dirección…"
          className="h-full w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
        />
      </div>
      <button type="submit" className="btn-gold shrink-0">Buscar</button>
    </form>
  );
}

export function HomePage() {
  const { data, isLoading } = useProperties({ limit: 6, status: 'AVAILABLE', sort: 'created_at_desc' });
  const featured = (data?.data ?? []) as PropRecord[];

  return (
    <>
      <SEO title="Inicio" description="Tu agencia inmobiliaria de confianza. Pisos, casas y locales en venta y alquiler en Madrid y toda España." />

      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-navy-800">
        <div className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&auto=format&fit=crop&q=80)' }}
          role="img" aria-label="Fachada de edificio residencial de lujo" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/60 via-navy-800/40 to-navy-900/80" aria-hidden="true" />

        <div className="pub-container relative z-10 text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-400">
            Agencia inmobiliaria premium
          </p>
          <h1 className="mx-auto max-w-3xl font-serif text-4xl font-semibold leading-tight text-white md:text-6xl">
            Encuentra el inmueble{' '}
            <em className="not-italic text-gold-400">perfecto</em>{' '}
            para ti
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/70 md:text-lg">
            Más de 2.000 propiedades en venta y alquiler. Asesoramiento experto en cada paso.
          </p>
          <div className="mt-10 flex justify-center"><HeroSearch /></div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {([
              ['/listings?operation=SALE',  'Comprar'],
              ['/listings?operation=RENT',  'Alquilar'],
              ['/listings?type=HOUSE',      'Chalets'],
              ['/listings?type=COMMERCIAL', 'Locales'],
            ] as const).map(([to, label]) => (
              <Link key={to} to={to}
                className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm transition-colors hover:border-white/50 hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40" aria-hidden="true">
          <div className="h-8 w-px bg-gradient-to-b from-transparent to-white/40" />
          <p className="text-2xs uppercase tracking-widest">Descubre</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gold-500">
        <div className="pub-container py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-serif text-2xl font-bold text-white md:text-3xl">{value}</p>
                <p className="mt-0.5 text-xs font-medium text-white/80">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="pub-section bg-white">
        <div className="pub-container">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Propiedades</p>
              <h2 className="pub-heading">Inmuebles destacados</h2>
            </div>
            <Link to="/listings" className="hidden items-center gap-2 text-sm font-semibold text-navy-800 hover:text-gold-600 transition-colors sm:flex">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : featured.map((p) => <PublicPropertyCard key={p['id'] as string} p={p} />)
            }
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link to="/listings" className="btn-gold">Ver todos los inmuebles</Link>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="pub-section bg-cream-100">
        <div className="pub-container">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Nuestro valor</p>
            <h2 className="pub-heading">¿Por qué elegirnos?</h2>
            <p className="mx-auto mt-4 max-w-xl text-surface-600">
              Combinamos tecnología, experiencia y trato humano para ofrecerte la mejor experiencia inmobiliaria.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {WHY_ITEMS.map(({ icon, title, desc }) => (
              <div key={title} className="group rounded-2xl border border-cream-300 bg-white p-8 transition-all duration-300 hover:shadow-panel hover:-translate-y-1">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10">{icon}</div>
                <h3 className="font-serif text-lg font-semibold text-navy-800">{title}</h3>
                <p className="mt-2 text-sm text-surface-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-800 py-16">
        <div className="pub-container text-center">
          <h2 className="font-serif text-3xl font-semibold text-white md:text-4xl">¿Listo para encontrar tu próximo inmueble?</h2>
          <p className="mx-auto mt-4 max-w-lg text-white/60">Habla con uno de nuestros agentes especializados. Sin compromiso.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn-gold">Contactar ahora</Link>
            <Link to="/listings" className="btn-ghost-light">Ver propiedades</Link>
          </div>
        </div>
      </section>
    </>
  );
}
