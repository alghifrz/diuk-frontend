import type { ReactNode } from "react";
import { CustomerAvatar } from "@/components/chat/customer-avatar";
import { HandlingBadge } from "@/components/chat/handling-badge";
import { Icon } from "@/components/ui/icon";
import type { Conversation } from "@/types/chat";
import type { Customer, Reservation } from "@/types/customer";

type CustomerPanelProps = {
  conversation: Conversation | null;
  customer: Customer | null;
  reservations: Reservation[] | null;
  loading: boolean;
  error: string;
  onClose?: () => void;
};

function formatReservation(reservation: Reservation) {
  const start = new Date(reservation.start_at);
  const when = Number.isNaN(start.getTime())
    ? reservation.start_at
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(start);

  return `${reservation.status} · ${when} · ${reservation.party_size} guests`;
}

function PanelSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-outline-variant bg-background px-3 py-3">
      <h3 className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
        <Icon name={icon} size={14} />
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function CustomerPanel({
  conversation,
  customer,
  reservations,
  loading,
  error,
  onClose,
}: CustomerPanelProps) {
  if (!conversation) {
    return (
      <aside className="hidden h-full w-80 shrink-0 border-l border-outline-variant bg-surface xl:block" />
    );
  }

  const name = customer?.name || conversation.customer.name || conversation.customer.phone || "Customer";
  const phone = customer?.phone ?? conversation.customer.phone;
  const email = customer?.email ?? conversation.customer.email;
  const tags = customer?.tags?.filter((tag) => tag.status === "ACTIVE") ?? [];

  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-surface xl:w-80 xl:shrink-0 xl:border-l xl:border-outline-variant">
      <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
        <h2 className="text-sm font-semibold text-on-surface">Customer</h2>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close customer details"
            className="inline-flex size-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-background xl:hidden"
          >
            <Icon name="close" size={18} />
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="space-y-3" aria-busy="true">
            <div className="mx-auto size-16 animate-pulse rounded-full bg-background" />
            <div className="h-4 animate-pulse rounded bg-background" />
            <div className="h-20 animate-pulse rounded-xl bg-background" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-outline-variant bg-background px-4 py-5 text-center">
              <CustomerAvatar
                name={name}
                channel={conversation.channel}
                size="lg"
                className="mx-auto inline-flex"
              />
              <p className="mt-3 text-sm font-semibold text-on-surface">{name}</p>
            </div>

            {error ? <p className="text-sm text-error">{error}</p> : null}

            {phone || email ? (
              <PanelSection title="Contact" icon="call">
                <div className="space-y-1 text-sm text-on-surface">
                  {phone ? <p>{phone}</p> : null}
                  {email ? <p>{email}</p> : null}
                </div>
              </PanelSection>
            ) : null}

            {conversation.identity ? (
              <PanelSection title="Identity" icon="badge">
                <p className="text-sm break-all text-on-surface">
                  {conversation.identity.external_id}
                </p>
              </PanelSection>
            ) : null}

            {tags.length > 0 ? (
              <PanelSection title="Tags" icon="label">
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-on-surface"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </PanelSection>
            ) : null}

            <PanelSection title="Reservations" icon="event">
              {reservations === null ? (
                <p className="text-sm text-on-surface-variant">Reservations unavailable.</p>
              ) : reservations.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No reservations yet</p>
              ) : (
                <ul className="space-y-2">
                  {reservations.slice(0, 3).map((reservation) => (
                    <li key={reservation.id} className="text-sm text-on-surface">
                      {formatReservation(reservation)}
                      {reservation.table ? (
                        <span className="block text-xs text-on-surface-variant">
                          {reservation.table.area_name} · {reservation.table.table_name}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </PanelSection>

            <PanelSection title="Conversation" icon="forum">
              <HandlingBadge state={conversation.handling_state} />
            </PanelSection>
          </div>
        )}
      </div>
    </aside>
  );
}
