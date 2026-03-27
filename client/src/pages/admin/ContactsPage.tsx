import { useState } from 'react';
import { MessageSquare, MailOpen, Mail, Building2 } from 'lucide-react';
import { useWebContacts, useMarkContactRead } from '../../hooks/useQueries';
import { Button }    from '../../components/ui/Button';
import { Select }    from '../../components/ui/Select';
import { Modal }     from '../../components/ui/Modal';
import { Badge }     from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonRow, EmptyState } from '../../components/ui/Skeleton';
import { formatDateTime, cn } from '../../lib/utils';

const READ_OPTS = [
  { value: '',      label: 'Todos'      },
  { value: 'false', label: 'Sin leer'   },
  { value: 'true',  label: 'Leídos'     },
];

type Contact = {
  id: string; name: string; email: string; phone: string | null;
  message: string; read: boolean; created_at: string;
  property: { id: string; title: string; city: string } | null;
};

function ContactDetailModal({ contact, open, onClose }: {
  contact: Contact | null; open: boolean; onClose: () => void;
}) {
  if (!contact) return null;
  return (
    <Modal open={open} onClose={onClose} title="Mensaje de contacto" size="md"
      footer={<Button variant="secondary" onClick={onClose}>Cerrar</Button>}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-surface-400">Nombre</p><p className="font-medium">{contact.name}</p></div>
          <div><p className="text-xs text-surface-400">Email</p><p className="font-medium">{contact.email}</p></div>
          {contact.phone && <div><p className="text-xs text-surface-400">Teléfono</p><p className="font-medium">{contact.phone}</p></div>}
          <div><p className="text-xs text-surface-400">Recibido</p><p className="font-medium">{formatDateTime(contact.created_at)}</p></div>
        </div>
        {contact.property && (
          <div className="flex items-center gap-2 rounded-xl bg-surface-50 px-4 py-3">
            <Building2 size={16} className="text-surface-400" />
            <div>
              <p className="text-xs text-surface-400">Propiedad de interés</p>
              <p className="text-sm font-medium">{contact.property.title} — {contact.property.city}</p>
            </div>
          </div>
        )}
        <div className="rounded-xl bg-surface-50 p-4">
          <p className="text-xs text-surface-400 mb-1">Mensaje</p>
          <p className="text-sm text-surface-800 whitespace-pre-wrap">{contact.message}</p>
        </div>
        <a
          href={`mailto:${contact.email}?subject=Re: Contacto CRM`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Mail size={15} /> Responder por email
        </a>
      </div>
    </Modal>
  );
}

export function ContactsPage() {
  const [page,     setPage]     = useState(1);
  const [readFilter, setFilter] = useState('false'); // default: unread
  const [selected, setSelected] = useState<Contact | null>(null);

  const params = { page, limit: 20, ...(readFilter !== '' && { read: readFilter }) };
  const { data, isLoading } = useWebContacts(params);
  const markReadMut = useMarkContactRead();

  const items = (data?.data ?? []) as Contact[];
  const meta  = data?.meta;

  const openContact = (c: Contact) => {
    setSelected(c);
    if (!c.read) markReadMut.mutate(c.id);
  };

  return (
    <div className="space-y-5 animate-in">
      <div className="page-header">
        <h1 className="page-title">Mensajes web</h1>
        <div className="flex items-center gap-2">
          {items.filter((c) => !c.read).length > 0 && (
            <Badge variant="danger">{items.filter((c) => !c.read).length} sin leer</Badge>
          )}
        </div>
      </div>

      <Select options={READ_OPTS} value={readFilter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} wrapperClass="w-36" />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100 bg-surface-50 text-left">
              {['', 'Remitente', 'Propiedad', 'Mensaje', 'Recibido', ''].map((h, i) => (
                <th key={i} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-surface-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              : items.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => openContact(c)}
                  className={cn('cursor-pointer transition-colors hover:bg-surface-50', !c.read && 'bg-primary-50/40')}
                >
                  <td className="w-8 pl-4 py-3">
                    {c.read
                      ? <MailOpen size={16} className="text-surface-400" />
                      : <Mail    size={16} className="text-primary-600" />
                    }
                  </td>
                  <td className="px-4 py-3">
                    <p className={cn('font-medium text-surface-900', !c.read && 'font-semibold')}>{c.name}</p>
                    <p className="text-xs text-surface-500">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-surface-600">
                    {c.property ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 size={13} />
                        <span className="line-clamp-1 max-w-[160px]">{c.property.title}</span>
                      </span>
                    ) : (
                      <span className="text-surface-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className={cn('line-clamp-2 text-surface-600', !c.read && 'text-surface-900')}>{c.message}</p>
                  </td>
                  <td className="px-4 py-3 text-surface-500 whitespace-nowrap">{formatDateTime(c.created_at)}</td>
                  <td className="px-4 py-3">
                    {!c.read && (
                      <Badge variant="primary" size="sm" dot>Nuevo</Badge>
                    )}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {!isLoading && items.length === 0 && (
          <EmptyState
            icon={<MessageSquare size={24}/>}
            title={readFilter === 'false' ? 'Sin mensajes sin leer' : 'Sin mensajes'}
            description="Los formularios de la web pública aparecerán aquí."
          />
        )}
      </div>

      {meta && <Pagination meta={meta} onPageChange={setPage} />}
      <ContactDetailModal contact={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}
