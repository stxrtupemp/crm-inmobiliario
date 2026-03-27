import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, Check, MessageSquare } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { publicApi } from '../../lib/api';

// ─── Info items ───────────────────────────────────────────────────────────────

const INFO_ITEMS = [
  {
    icon: <Phone size={22} className="text-gold-500" />,
    title: 'Teléfono',
    lines: ['+34 91 000 0000', '+34 91 000 0001'],
    href: 'tel:+34910000000',
  },
  {
    icon: <Mail size={22} className="text-gold-500" />,
    title: 'Email',
    lines: ['info@crminmobiliario.es', 'ventas@crminmobiliario.es'],
    href: 'mailto:info@crminmobiliario.es',
  },
  {
    icon: <MapPin size={22} className="text-gold-500" />,
    title: 'Oficina',
    lines: ['Calle Gran Vía 45, planta 3', '28013 Madrid, España'],
    href: 'https://maps.google.com',
  },
  {
    icon: <Clock size={22} className="text-gold-500" />,
    title: 'Horario',
    lines: ['Lun – Vie: 9:00 – 19:00', 'Sábado: 10:00 – 14:00'],
  },
] as const;

// ─── Contact form ─────────────────────────────────────────────────────────────

type FormState = {
  name: string; email: string; phone: string;
  subject: string; message: string;
};

const SUBJECTS = [
  'Información general',
  'Quiero comprar una propiedad',
  'Quiero alquilar una propiedad',
  'Quiero vender / alquilar mi inmueble',
  'Solicitud de tasación',
  'Otro',
];

function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const change = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Por favor completa los campos obligatorios (*).');
      return;
    }
    setSending(true);
    setError('');
    try {
      await publicApi.post('/web-contacts', {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        message: form.subject ? `[${form.subject}]\n\n${form.message}` : form.message,
      });
      setSent(true);
    } catch {
      setError('Error al enviar el formulario. Inténtalo de nuevo.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check size={32} className="text-green-600" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-navy-800">¡Mensaje enviado!</h3>
        <p className="mx-auto mt-2 max-w-sm text-surface-600">
          Hemos recibido tu consulta. Nos pondremos en contacto contigo en las próximas 24 horas.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-surface-500">
            Nombre *
          </label>
          <input
            type="text" value={form.name} required
            onChange={(e) => change('name', e.target.value)}
            placeholder="Tu nombre completo"
            className="field-base"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-surface-500">
            Email *
          </label>
          <input
            type="email" value={form.email} required
            onChange={(e) => change('email', e.target.value)}
            placeholder="tu@email.com"
            className="field-base"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-surface-500">
            Teléfono
          </label>
          <input
            type="tel" value={form.phone}
            onChange={(e) => change('phone', e.target.value)}
            placeholder="+34 600 000 000"
            className="field-base"
          />
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-surface-500">
            Asunto
          </label>
          <select
            value={form.subject}
            onChange={(e) => change('subject', e.target.value)}
            className="field-base appearance-none"
          >
            <option value="">Selecciona un asunto</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-surface-500">
          Mensaje *
        </label>
        <textarea
          rows={6} value={form.message} required
          onChange={(e) => change('message', e.target.value)}
          placeholder="Cuéntanos en qué podemos ayudarte…"
          className="field-base resize-none"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-surface-400">
          Al enviar aceptas nuestra{' '}
          <a href="#" className="underline hover:text-surface-700">política de privacidad</a>.
        </p>
        <button
          type="submit"
          disabled={sending}
          className="btn-gold shrink-0 disabled:opacity-50"
        >
          <Send size={16} />
          {sending ? 'Enviando…' : 'Enviar mensaje'}
        </button>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ContactPage() {
  return (
    <>
      <SEO
        title="Contacto"
        description="Contacta con CRM Inmobiliario. Estamos aquí para ayudarte a encontrar tu inmueble ideal o gestionar la venta de tu propiedad."
        url="/contact"
      />

      {/* Hero */}
      <section className="bg-navy-800 py-16 md:py-20">
        <div className="pub-container text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/20">
            <MessageSquare size={28} className="text-gold-400" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-white md:text-4xl">
            ¿En qué podemos ayudarte?
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-white/60">
            Nuestro equipo está disponible para resolver todas tus dudas sobre compra, venta y alquiler de inmuebles.
          </p>
        </div>
      </section>

      {/* Info cards */}
      <section className="bg-white border-b border-cream-200">
        <div className="pub-container py-10">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {INFO_ITEMS.map(({ icon, title, lines, href }) => (
              <div key={title} className="flex items-start gap-4 rounded-2xl border border-cream-200 bg-cream-50 p-5 transition-all hover:shadow-card">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-50">
                  {icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-surface-400">{title}</p>
                  {lines.map((line, i) => (
                    href && i === 0 ? (
                      <a key={i} href={href} className="block mt-0.5 text-sm font-medium text-navy-800 hover:text-gold-600 break-all">
                        {line}
                      </a>
                    ) : (
                      <p key={i} className="mt-0.5 text-sm text-surface-600 break-all">{line}</p>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + map placeholder */}
      <section className="pub-section bg-cream-100">
        <div className="pub-container">
          <div className="grid gap-10 lg:grid-cols-[1fr_480px]">
            {/* Left: context */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Contacto</p>
              <h2 className="pub-heading mb-4">Escríbenos</h2>
              <p className="text-surface-600 leading-relaxed mb-6">
                Completa el formulario y nos pondremos en contacto contigo en menos de 24 horas.
                También puedes llamarnos directamente si prefieres hablar con un agente.
              </p>

              {/* Map placeholder */}
              <div className="overflow-hidden rounded-2xl border border-cream-200 bg-cream-200">
                <iframe
                  title="Ubicación de la oficina"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2997.0!2d-3.7038!3d40.4197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDI1JzEwLjkiTiAzwrA0MicxMy43Ilc!5e0!3m2!1ses!2ses!4v1234567890"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  aria-label="Mapa con la ubicación de la oficina en Gran Vía 45, Madrid"
                />
              </div>
            </div>

            {/* Right: form */}
            <div className="rounded-2xl border border-cream-200 bg-white p-8 shadow-card">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
