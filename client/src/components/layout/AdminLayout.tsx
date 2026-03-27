import { Outlet, useNavigate } from 'react-router-dom';
import { Bell, Menu, Search } from 'lucide-react';
import { cn, initials } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore }   from '../../stores/uiStore';
import { Sidebar }      from './Sidebar';
import { useWebContacts } from '../../hooks/useQueries';

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar() {
  const user        = useAuthStore((s) => s.user);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggle      = useUIStore((s) => s.toggleSidebar);
  const collapsed   = useUIStore((s) => s.sidebarCollapsed);
  const navigate    = useNavigate();

  const sidebarW = collapsed ? 64 : 256;

  // Unread web contacts — polling cada 60s
  const { data: unreadData } = useWebContacts({ read: 'false', limit: 1 });
  const unreadCount = (unreadData?.meta?.total ?? 0);

  return (
    <header
      className="fixed top-0 right-0 z-20 flex h-[60px] items-center gap-4 border-b border-surface-200 bg-white px-4 transition-all duration-300"
      style={{ left: sidebarW }}
    >
      {/* Mobile menu toggle */}
      <button
        onClick={toggle}
        className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-100 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      {/* Search placeholder */}
      <div className="flex flex-1 items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-400 cursor-text max-w-sm">
        <Search size={15} />
        <span>Buscar…</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-surface-500 hover:bg-surface-100"
          onClick={() => navigate('/admin/web-contacts')}
          aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <button
          onClick={() => navigate('/admin/profile')}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white hover:bg-primary-700"
        >
          {user ? initials(user.name) : '?'}
        </button>
      </div>
    </header>
  );
}
// ─── AdminLayout ─────────────────────────────────────────────────────────────

export function AdminLayout() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const sidebarW  = collapsed ? 64 : 256;

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />

      {/* Main area — offset by sidebar width */}
      <div
        className="flex min-h-screen flex-col transition-all duration-300"
        style={{ paddingLeft: sidebarW }}
      >
        <Topbar />

        <main className="flex-1 p-6 pt-[calc(60px+1.5rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
