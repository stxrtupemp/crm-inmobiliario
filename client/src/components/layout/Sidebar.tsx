import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Briefcase,
  CheckSquare, MessageSquare, LogOut, ChevronLeft,
  Globe, UserCog,
} from 'lucide-react';
import { cn, initials } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore }   from '../../stores/uiStore';
import { useAuth }      from '../../hooks/useAuth';

interface NavItem {
  label:    string;
  to:       string;
  icon:     React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',   to: '/admin/dashboard',   icon: <LayoutDashboard size={18} /> },
  { label: 'Propiedades', to: '/admin/properties',  icon: <Building2 size={18} /> },
  { label: 'Clientes',    to: '/admin/clients',     icon: <Users size={18} /> },
  { label: 'Pipeline',    to: '/admin/deals',       icon: <Briefcase size={18} /> },
  { label: 'Tareas',      to: '/admin/tasks',       icon: <CheckSquare size={18} /> },
  { label: 'Contactos web', to: '/admin/web-contacts', icon: <MessageSquare size={18} /> },
  { label: 'Usuarios',    to: '/admin/users',       icon: <UserCog size={18} />, adminOnly: true },
];

export function Sidebar() {
  const user          = useAuthStore((s) => s.user);
  const { logout }    = useAuth();
  const collapsed     = useUIStore((s) => s.sidebarCollapsed);
  const toggle        = useUIStore((s) => s.toggleCollapsed);
  const sidebarOpen   = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const navigate      = useNavigate();

  function closeMobile() {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col bg-surface-900 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        // Mobile: slide in/out as overlay; desktop: always visible
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0',
      )}
    >
      {/* Logo */}
      <div
        className="flex h-[60px] shrink-0 cursor-pointer items-center gap-3 px-4"
        onClick={() => navigate('/admin/dashboard')}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-sm">
          C
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-white truncate">CRM Inmobiliario</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== 'ADMIN') return null;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMobile}
              className={({ isActive }) =>
                cn('nav-item', isActive && 'nav-item-active', collapsed && 'justify-center px-0')
              }
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}

        {/* Web pública link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn('nav-item', collapsed && 'justify-center px-0')}
          title={collapsed ? 'Web pública' : undefined}
        >
          <Globe size={18} className="shrink-0" />
          {!collapsed && <span className="truncate">Web pública</span>}
        </a>
      </nav>

      {/* User + collapse */}
      <div className="shrink-0 border-t border-surface-800 p-3 space-y-2">
        {/* User card */}
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-700 text-xs font-semibold text-white">
            {user ? initials(user.name) : '?'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{user?.name}</p>
              <p className="truncate text-2xs text-surface-400">{user?.role}</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className={cn('nav-item w-full', collapsed && 'justify-center px-0')}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className={cn(
            'nav-item w-full',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          <ChevronLeft
            size={16}
            className={cn('shrink-0 transition-transform duration-300', collapsed && 'rotate-180')}
          />
          {!collapsed && <span>Colapsar</span>}
        </button>
      </div>
    </aside>
  );
}
