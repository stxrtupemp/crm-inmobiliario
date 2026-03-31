import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, MapPin, Bed, Bath, Car,
  Maximize2, Phone, Mail, Send, Check, Building2,
} from 'lucide-react';
import { SEO }              from '../../components/SEO';
import { usePropertyBySlug } from '../../hooks/useQueries';
import { api, publicApi }    from '../../lib/api';
import { PageSpinner }      from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatArea, initials, cn } from '../../lib/utils';

type PropRecord = Record<string, unknown>;

// ─── Image carousel ───────────────────────────────────────────────────────────

function ImageCarousel({ images, title }: {
  images: { url: string; is_cover: boolean }[];
  title: string;
}) {
  const [idx, setIdx] = useState(0);

  if (!images.length) {
    return (
      <div className="flex h-[440px] w-full items-center justify-center rounded-2xl bg-cream-200 text-surface-300">
        <Building2 size={56} aria-hidden="true" />
      </div>
    );
  }

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="group relative h-[400px] overflow-hidden rounded-2xl bg-cream-200 md:h-[480px]">
        <img
          src={images[idx]!.url}
          alt={`${title} — imagen ${idx + 1} de ${images.length}`}
          className="h-full w-full object-cover transition-transform duration-500"
        />

        {/* Counter */}
        <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {idx + 1} / {images.length}
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-navy-800 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-navy-800 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={cn(
                'h-16 w-24 shrink-0 overflow-hidden rounded-xl transition-all',
                i === idx ? 'ring-2 ring-gold-500 ring-offset-2' : 'opacity-60 hover:opacity-100',
              )}
            >
              <img
                src={img.url}
                alt={`Miniatura ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Contact form ─────────────────────────────────────────────────────────────

function ContactForm({ propertyId, propertyTitle }: { propertyId: string; propertyTitle: string }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const change = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Por favor completa nombre, email y mensaje.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await publicApi.post('/web-contacts', {
        property_id: propertyId,
        name:    form.name,
        email:   form.email,
        phone:   form.phone || undefined,
        message: form.message,
      });
      setSent(true);
    } catch {
      setError('Error al enviar. Inténtalo de nuevo.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white">
          <Check size={24} />
        </div>
        <p className="font-serif text-lg font-semibold text-navy-800">¡Mensaje enviado!</p>
        <p className="mt-1 text-sm text-surface-600">
          Nos pondremos en contacto contigo a la brevedad.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="text"
        value={form.name}
        onChange={(e) => change('name', e.target.value)}
        placeholder="Nombre completo *"
        required
        className="field-base"
      />
      <input
        type="email"
        value={form.email}
        onChange={(e) => change('email', e.target.value)}
        placeholder="Email *"
        required
        className="field-base"
      />
      <input
        type="tel"
        value={form.phone}
        onChange={(e) => change('phone', e.target.value)}
        placeholder="Teléfono (opcional)"
        className="field-base"
      />
      <textarea
        rows={4}
        value={form.message}
        onChange={(e) => change('message', e.target.value)}
        placeholder={`Me interesa el inmueble "${propertyTitle}". Me gustaría obtener más información…`}
        required
        className="field-base resize-none"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="btn-gold w-full justify-center disabled:opacity-50"
      >
        <Send size={16} />
        {sending ? 'Enviando…' : 'Enviar consulta'}
      </button>
      <p className="text-center text-2xs text-surface-400">
        Al enviar aceptas nuestra <a href="#" className="underline hover:text-surface-600">política de privacidad</a>.
      </p>
    </form>
  );
}

// ─── Feature chip ─────────────────────────────────────────────────────────────

function FeatureChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-cream-100 px-3 py-2 text-sm text-navy-800">
      <span className="text-gold-500">{icon}</span>
      {label}
    </div>
  );
}

// ─── Property detail page ─────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Piso', HOUSE: 'Casa / Chalet', LAND: 'Solar', COMMERCIAL: 'Local', OFFICE: 'Oficina',
};

const FEATURE_LABELS: Record<string, string> = {
  pool: 'Piscina', garden: 'Jardín', terrace: 'Terraza', elevator: 'Ascensor',
  garage: 'Garaje', air_conditioning: 'A/A', furnished: 'Amueblado',
  domotics: 'Domótica', wine_cellar: 'Bodega', shop_window: 'Escaparate',
  buildable: 'Edificable', services_available: 'Servicios disponibles',
  concierge: 'Portería', corner: 'En esquina', flat_terrain: 'Terreno plano',
};

export function ListingDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = usePropertyBySlug(slug ?? '');

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [slug]);
  const p = data as PropRecord | undefined;

  if (isLoading) return <PageSpinner />;
  if (!p) return (
    <div className="pub-section pub-container text-center">
      <p className="font-serif text-2xl text-navy-800">Propiedad no encontrada</p>
      <Link to="/listings" className="mt-4 inline-block text-gold-600 hover:underline">
        ← Volver al listado
      </Link>
    </div>
  );

  const images   = (p['images']   as { url: string; is_cover: boolean }[]) ?? [];
  const agent    = p['agent']     as { id: string; name: string; email: string; phone: string | null; avatar_url: string | null } | undefined;
  const features = (p['features'] as Record<string, boolean> | null) ?? {};
  const activeFeatures = Object.entries(features).filter(([, v]) => v === true);
  const coverUrl = images.find((i) => i.is_cover)?.url;

  const opLabel  = p['operation'] === 'SALE' ? 'En venta' : 'En alquiler';

  return (
    <>
      <SEO
        title={p['title'] as string}
        description={`${opLabel}: ${p['title'] as string} en ${p['city'] as string}. ${p['bedrooms'] ? `${p['bedrooms'] as number} habitaciones. ` : ''}${formatArea(p['area_m2'] as number)}. ${formatCurrency(p['price'] as number, p['currency'] as string)}.`}
        image={coverUrl}
        url={`/listings/${p['slug'] as string}`}
        type="article"
      />

      <article>
        {/* Breadcrumb */}
        <div className="border-b border-cream-200 bg-white">
          <div className="pub-container py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-surface-500">
              <Link to="/"        className="hover:text-navy-800">Inicio</Link>
              <span>/</span>
              <Link to="/listings" className="hover:text-navy-800">Propiedades</Link>
              <span>/</span>
              <span className="text-navy-800 font-medium truncate max-w-[200px]">{p['title'] as string}</span>
            </nav>
          </div>
        </div>

        <div className="pub-container py-8 md:py-12">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${p['operation'] === 'SALE' ? 'bg-navy-800' : 'bg-gold-500'}`}>
                  {opLabel}
                </span>
                <span className="rounded-full bg-cream-200 px-3 py-1 text-xs font-semibold text-navy-800">
                  {TYPE_LABELS[p['type'] as string] ?? p['type'] as string}
                </span>
              </div>
              <h1 className="pub-heading">{p['title'] as string}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-surface-500">
                <MapPin size={14} aria-hidden="true" />
                {p['address'] as string}, {p['city'] as string}
                {p['zone'] ? ` — ${p['zone'] as string}` : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-3xl font-bold text-navy-800">
                {formatCurrency(p['price'] as number, p['currency'] as string)}
              </p>
              {p['operation'] === 'RENT' && (
                <p className="text-sm text-surface-500">por mes</p>
              )}
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            {/* Left column */}
            <div className="space-y-8">
              {/* Gallery */}
              <ImageCarousel images={images} title={p['title'] as string} />

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {p['area_m2'] && <FeatureChip icon={<Maximize2 size={16} />} label={formatArea(p['area_m2'] as number)} />}
                {p['bedrooms'] && <FeatureChip icon={<Bed size={16} />}  label={`${p['bedrooms'] as number} habitaciones`} />}
                {p['bathrooms'] && <FeatureChip icon={<Bath size={16} />} label={`${p['bathrooms'] as number} baños`} />}
                {p['parking'] && <FeatureChip icon={<Car size={16} />}   label={`${p['parking'] as number} plaza${(p['parking'] as number) > 1 ? 's' : ''}`} />}
              </div>

              {/* Description */}
              {p['description'] && (
                <section>
                  <h2 className="pub-subheading mb-3">Descripción</h2>
                  <p className="text-surface-700 leading-relaxed whitespace-pre-line">
                    {p['description'] as string}
                  </p>
                </section>
              )}

              {/* Features */}
              {activeFeatures.length > 0 && (
                <section>
                  <h2 className="pub-subheading mb-3">Características</h2>
                  <div className="flex flex-wrap gap-2">
                    {activeFeatures.map(([key]) => (
                      <span
                        key={key}
                        className="flex items-center gap-1.5 rounded-full border border-gold-300 bg-gold-50 px-3 py-1.5 text-xs font-medium text-gold-700"
                      >
                        <Check size={12} aria-hidden="true" />
                        {FEATURE_LABELS[key] ?? key}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Location info */}
              <section className="rounded-2xl border border-cream-200 bg-cream-100 p-5">
                <h2 className="pub-subheading mb-3 text-lg">Ubicación</h2>
                <div className="space-y-1.5 text-sm text-surface-600">
                  <p><strong className="text-navy-800">Dirección:</strong> {p['address'] as string}</p>
                  <p><strong className="text-navy-800">Ciudad:</strong> {p['city'] as string}</p>
                  {p['zone'] && <p><strong className="text-navy-800">Zona:</strong> {p['zone'] as string}</p>}
                  {p['lat'] && p['lng'] && !isNaN(Number(p['lat'])) && !isNaN(Number(p['lng'])) && (
                    <p className="text-2xs text-surface-400 font-mono">
                      {Number(p['lat']).toFixed(6)}, {Number(p['lng']).toFixed(6)}
                    </p>
                  )}
                </div>
              </section>
            </div>

            {/* Right column — sticky sidebar */}
            <aside className="space-y-5">
              {/* Contact form */}
              <div className="sticky top-24 space-y-5">
                <div className="rounded-2xl border border-cream-200 bg-white p-6 shadow-card">
                  <h2 className="mb-4 font-serif text-lg font-semibold text-navy-800">
                    Solicitar información
                  </h2>
                  <ContactForm propertyId={p['id'] as string} propertyTitle={p['title'] as string} />
                </div>

                {/* Agent card */}
                {agent && (
                  <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-card">
                    <p className="mb-4 text-xs font-bold uppercase tracking-widest text-surface-400">
                      Agente responsable
                    </p>
                    <div className="flex items-center gap-3">
                      {agent.avatar_url ? (
                        <img
                          src={agent.avatar_url}
                          alt={`Foto de ${agent.name}`}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 font-serif text-base font-bold text-white">
                          {initials(agent.name)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-navy-800">{agent.name}</p>
                        <p className="text-xs text-surface-500">Agente inmobiliario</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {agent.phone && (
                        <a
                          href={`tel:${agent.phone}`}
                          className="flex items-center gap-2.5 rounded-xl border border-cream-200 bg-cream-50 px-4 py-2.5 text-sm font-medium text-navy-800 transition-colors hover:bg-cream-100"
                        >
                          <Phone size={15} className="text-gold-500" aria-hidden="true" />
                          {agent.phone}
                        </a>
                      )}
                      <a
                        href={`mailto:${agent.email}`}
                        className="flex items-center gap-2.5 rounded-xl border border-cream-200 bg-cream-50 px-4 py-2.5 text-sm font-medium text-navy-800 transition-colors hover:bg-cream-100"
                      >
                        <Mail size={15} className="text-gold-500" aria-hidden="true" />
                        <span className="truncate">{agent.email}</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
