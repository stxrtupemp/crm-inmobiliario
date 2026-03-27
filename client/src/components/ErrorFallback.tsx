import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export function RouteErrorFallback() {
  const error = useRouteError();

  let status  = 500;
  let title   = 'Algo ha ido mal';
  let message = 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';

  if (isRouteErrorResponse(error)) {
    status  = error.status;
    title   = error.status === 404 ? 'Página no encontrada' : `Error ${error.status}`;
    message = error.status === 404
      ? 'La página que buscas no existe o ha sido movida.'
      : error.statusText ?? message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle size={32} className="text-red-500" />
      </div>
      <p className="text-5xl font-bold text-surface-200">{status}</p>
      <h1 className="mt-2 text-xl font-semibold text-surface-900">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-surface-500">{message}</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-xl border border-surface-300 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50"
        >
          <RefreshCw size={15} /> Reintentar
        </button>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Home size={15} /> Ir al dashboard
        </Link>
      </div>
    </div>
  );
}
