import { cn } from '../../lib/utils';

const variants = {
  default:  'bg-surface-100 text-surface-700',
  primary:  'bg-primary-100 text-primary-700',
  success:  'bg-green-100   text-green-700',
  warning:  'bg-amber-100   text-amber-700',
  danger:   'bg-red-100     text-red-700',
  info:     'bg-blue-100    text-blue-700',
  purple:   'bg-violet-100  text-violet-700',
  pink:     'bg-pink-100    text-pink-700',
  indigo:   'bg-indigo-100  text-indigo-700',
} as const;

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
} as const;

interface BadgeProps {
  variant?:   keyof typeof variants;
  size?:      keyof typeof sizes;
  dot?:       boolean;
  className?: string;
  children:   React.ReactNode;
}

export function Badge({
  variant   = 'default',
  size      = 'md',
  dot       = false,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full bg-current')} aria-hidden />
      )}
      {children}
    </span>
  );
}

// ─── Domain-specific badges ───────────────────────────────────────────────────

const dealStatusMap: Record<string, keyof typeof variants> = {
  LEAD:        'indigo',
  CONTACT:     'warning',
  VISIT:       'info',
  NEGOTIATION: 'purple',
  CLOSING:     'pink',
  WON:         'success',
  LOST:        'danger',
};

const dealStatusLabel: Record<string, string> = {
  LEAD: 'Lead', CONTACT: 'Contacto', VISIT: 'Visita',
  NEGOTIATION: 'Negociación', CLOSING: 'Cierre', WON: 'Ganado', LOST: 'Perdido',
};

export function DealStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={dealStatusMap[status] ?? 'default'} dot>
      {dealStatusLabel[status] ?? status}
    </Badge>
  );
}

const propertyStatusMap: Record<string, keyof typeof variants> = {
  AVAILABLE: 'success', RESERVED: 'warning', SOLD: 'danger', RENTED: 'info',
};
const propertyStatusLabel: Record<string, string> = {
  AVAILABLE: 'Disponible', RESERVED: 'Reservado', SOLD: 'Vendido', RENTED: 'Alquilado',
};

export function PropertyStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={propertyStatusMap[status] ?? 'default'} dot>
      {propertyStatusLabel[status] ?? status}
    </Badge>
  );
}

const priorityMap: Record<string, keyof typeof variants> = {
  LOW: 'default', MEDIUM: 'info', HIGH: 'warning', URGENT: 'danger',
};
const priorityLabel: Record<string, string> = {
  LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', URGENT: 'Urgente',
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge variant={priorityMap[priority] ?? 'default'}>
      {priorityLabel[priority] ?? priority}
    </Badge>
  );
}
