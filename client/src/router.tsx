import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AdminLayout }  from './components/layout/AdminLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { PageSpinner }  from './components/ui/LoadingSpinner';
import { RouteErrorFallback } from './components/ErrorFallback';

// ─── Lazy imports ─────────────────────────────────────────────────────────────
const LoginPage          = lazy(() => import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage      = lazy(() => import('./pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const PropertiesListPage = lazy(() => import('./pages/admin/PropertiesListPage').then((m) => ({ default: m.PropertiesListPage })));
const PropertyFormPage   = lazy(() => import('./pages/admin/PropertyFormPage').then((m) => ({ default: m.PropertyFormPage })));
const PropertyDetailPage = lazy(() => import('./pages/admin/PropertyDetailPage').then((m) => ({ default: m.PropertyDetailPage })));
const ClientsListPage    = lazy(() => import('./pages/admin/ClientPages').then((m) => ({ default: m.ClientsListPage })));
const ClientFormPage     = lazy(() => import('./pages/admin/ClientPages').then((m) => ({ default: m.ClientFormPage })));
const ClientDetailPage   = lazy(() => import('./pages/admin/ClientPages').then((m) => ({ default: m.ClientDetailPage })));
const DealsPage          = lazy(() => import('./pages/admin/DealsPage').then((m) => ({ default: m.DealsPage })));
const TasksPage          = lazy(() => import('./pages/admin/TasksPage').then((m) => ({ default: m.TasksPage })));
const ContactsPage       = lazy(() => import('./pages/admin/ContactsPage').then((m) => ({ default: m.ContactsPage })));
const UsersPage          = lazy(() => import('./pages/admin/UsersPage').then((m) => ({ default: m.UsersPage })));
const TenantsPage        = lazy(() => import('./pages/admin/TenantsPage').then((m) => ({ default: m.TenantsPage })));

// ─── Public pages (web pública) ───────────────────────────────────────────────
const HomePage           = lazy(() => import('./pages/public/HomePage').then((m) => ({ default: m.HomePage })));
const ListingsPage       = lazy(() => import('./pages/public/ListingsPage').then((m) => ({ default: m.ListingsPage })));
const ListingDetailPage  = lazy(() => import('./pages/public/ListingDetailPage').then((m) => ({ default: m.ListingDetailPage })));
const ContactPage        = lazy(() => import('./pages/public/ContactPage').then((m) => ({ default: m.ContactPage })));

// ─── Fallback ─────────────────────────────────────────────────────────────────
function SuspenseShell({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>;
}

function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-bold text-surface-200">404</p>
      <p className="mt-2 text-lg font-semibold text-surface-900">Página no encontrada</p>
      <p className="mt-1 text-sm text-surface-500">La URL que buscas no existe.</p>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  // ── Auth ─────────────────────────────────────────────────────────────────
  {
    path:    '/login',
    element: <SuspenseShell><LoginPage /></SuspenseShell>,
  },

  // ── Admin CRM (protected) ─────────────────────────────────────────────────
  {
    path:    '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorFallback />,
    children: [
      { index:   true,  element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',              element: <SuspenseShell><DashboardPage /></SuspenseShell> },

      // Properties
      { path: 'properties',             element: <SuspenseShell><PropertiesListPage /></SuspenseShell> },
      { path: 'properties/new',         element: <SuspenseShell><PropertyFormPage /></SuspenseShell> },
      { path: 'properties/:id',         element: <SuspenseShell><PropertyDetailPage /></SuspenseShell> },
      { path: 'properties/:id/edit',    element: <SuspenseShell><PropertyFormPage /></SuspenseShell> },

      // Clients
      { path: 'clients',                element: <SuspenseShell><ClientsListPage /></SuspenseShell> },
      { path: 'clients/new',            element: <SuspenseShell><ClientFormPage /></SuspenseShell> },
      { path: 'clients/:id',            element: <SuspenseShell><ClientDetailPage /></SuspenseShell> },
      { path: 'clients/:id/edit',       element: <SuspenseShell><ClientFormPage /></SuspenseShell> },

      // Deals / Pipeline
      { path: 'deals',                  element: <SuspenseShell><DealsPage /></SuspenseShell> },

      // Tasks
      { path: 'tasks',                  element: <SuspenseShell><TasksPage /></SuspenseShell> },

      // Web contacts
      { path: 'web-contacts',           element: <SuspenseShell><ContactsPage /></SuspenseShell> },

      // Users (admin only)
      { path: 'users',                  element: <SuspenseShell><UsersPage /></SuspenseShell> },

      // Tenants (super admin only)
      { path: 'tenants',                element: <SuspenseShell><TenantsPage /></SuspenseShell> },

      // 404 inside admin
      { path: '*', element: <NotFound /> },
    ],
  },

  // ── Public web ────────────────────────────────────────────────────────────
  {
    path:         '/',
    element:      <PublicLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true,        element: <SuspenseShell><HomePage /></SuspenseShell> },
      { path: 'listings',   element: <SuspenseShell><ListingsPage /></SuspenseShell> },
      { path: 'listings/:slug', element: <SuspenseShell><ListingDetailPage /></SuspenseShell> },
      { path: 'contact',    element: <SuspenseShell><ContactPage /></SuspenseShell> },
      { path: '*',          element: <NotFound /> },
    ],
  },
]);
