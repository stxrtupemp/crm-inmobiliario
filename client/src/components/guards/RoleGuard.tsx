import { ShieldOff } from 'lucide-react';
import { useAuthStore, type UserRole } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface RoleGuardProps {
  roles:    UserRole[];
  children: React.ReactNode;
  /** When true, renders nothing instead of the 403 page */
  silent?:  boolean;
}

/**
 * Renders children only if the current user has one of the allowed roles.
 * Shows a 403 screen otherwise (or nothing if silent=true).
 */
export function RoleGuard({ roles, children, silent = false }: RoleGuardProps) {
  const user     = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const allowed = user ? roles.includes(user.role) : false;

  if (allowed) return <>{children}</>;
  if (silent)  return null;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <ShieldOff className="h-8 w-8 text-red-500" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-surface-900">Acceso denegado</h2>
        <p className="mt-1 text-sm text-surface-500">
          No tienes permisos para ver esta sección.
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
        Volver
      </Button>
    </div>
  );
}
