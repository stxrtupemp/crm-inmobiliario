import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, Instagram, Facebook, Linkedin } from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV_LINKS = [
  { to: '/',         label: 'Inicio'      },
  { to: '/listings', label: 'Propiedades' },
  { to: '/contact',  label: 'Contacto'    },
] as const;

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const location = useLocation();
  const isHome   = location.pathname === '/';

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!isHome) return;
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [isHome]);

  const transparent = isHome && !scrolled && !mobileOpen;

  return (
    <header className={cn('fixed inset-x-0 top-0 z-40 transition-all duration-300',
      transparent ? 'bg-transparent' : 'bg-white/95 shadow-sm backdrop-blur-md border-b border-cream-200')}>
      <div className="pub-container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl font-serif font-bold text-base transition-colors',
            transparent ? 'bg-white/20 text-white border border-white/30' : 'bg-navy-800 text-white')}>C</div>
          <div>
            <p className={cn('text-sm font-semibold leading-tight transition-colors', transparent ? 'text-white' : 'text-navy-800')}>CRM Inmobiliario</p>
            <p className={cn('text-2xs leading-none transition-colors', transparent ? 'text-white/60' : 'text-surface-500')}>Agencia inmobiliaria</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
              className={({ isActive }) => cn('text-sm font-medium transition-colors',
                transparent ? (isActive ? 'text-white' : 'text-white/70 hover:text-white')
                            : (isActive ? 'text-gold-500' : 'text-surface-600 hover:text-navy-800'))}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/login" className={cn('rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
            transparent ? 'border border-white/30 text-white hover:bg-white/10' : 'bg-navy-800 text-white hover:bg-navy-900')}>
            Área privada
          </Link>
        </nav>

        <button onClick={() => setMobileOpen((o) => !o)}
          className={cn('rounded-lg p-2 md:hidden', transparent ? 'text-white' : 'text-surface-700')}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-cream-200 bg-white px-4 pb-6 pt-2 shadow-lg md:hidden animate-in">
          <nav className="space-y-1">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}
                className={({ isActive }) => cn('block rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive ? 'bg-cream-100 text-gold-600' : 'text-surface-700 hover:bg-cream-100')}>
                {l.label}
              </NavLink>
            ))}
            <Link to="/login" className="mt-3 block rounded-xl bg-navy-800 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-navy-900">
              Área privada
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

const PROP_LINKS = [
  { to: '/listings?operation=SALE',  label: 'Pisos en venta'     },
  { to: '/listings?operation=RENT',  label: 'Pisos en alquiler'  },
  { to: '/listings?type=HOUSE',      label: 'Casas y chalets'    },
  { to: '/listings?type=COMMERCIAL', label: 'Locales y oficinas' },
  { to: '/listings?type=LAND',       label: 'Solares'            },
] as const;

function Footer() {
  return (
    <footer className="bg-navy-800 text-white">
      <div className="pub-container py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500 font-serif font-bold text-base text-white">C</div>
              <div>
                <p className="text-sm font-semibold">CRM Inmobiliario</p>
                <p className="text-2xs text-white/50">Agencia inmobiliaria</p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">Más de 15 años ayudando a familias y empresas a encontrar el inmueble perfecto.</p>
            <div className="mt-5 flex gap-3">
              {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/60 transition-colors hover:border-gold-400 hover:text-gold-400">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gold-400">Propiedades</p>
            <ul className="space-y-2.5">
              {PROP_LINKS.map((l) => (
                <li key={l.to}><Link to={l.to} className="text-sm text-white/60 transition-colors hover:text-white">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gold-400">Empresa</p>
            <ul className="space-y-2.5">
              {([['/', 'Inicio'], ['/listings', 'Propiedades'], ['/contact', 'Contacto'], ['/login', 'Área privada']] as const).map(([to, label]) => (
                <li key={to}><Link to={to} className="text-sm text-white/60 transition-colors hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gold-400">Contacto</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin size={15} className="mt-0.5 shrink-0 text-gold-400" />
                <span>Calle Gran Vía 45, planta 3<br />28013 Madrid, España</span>
              </li>
              <li><a href="tel:+34910000000" className="flex items-center gap-2.5 text-sm text-white/60 hover:text-white"><Phone size={15} className="shrink-0 text-gold-400" />+34 91 000 0000</a></li>
              <li><a href="mailto:info@crminmobiliario.es" className="flex items-center gap-2.5 text-sm text-white/60 hover:text-white"><Mail size={15} className="shrink-0 text-gold-400" />info@crminmobiliario.es</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} CRM Inmobiliario. Todos los derechos reservados.</p>
          <div className="flex gap-5">
            {['Aviso legal', 'Privacidad', 'Cookies'].map((l) => <a key={l} href="#" className="hover:text-white/70">{l}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  const location = useLocation();
  const isHome   = location.pathname === '/';
  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <Navbar />
      <main className={cn('flex-1', !isHome && 'pt-16')}><Outlet /></main>
      <Footer />
    </div>
  );
}
