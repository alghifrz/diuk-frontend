import { ConversationFilters } from "@/components/chat/conversation-filters";
import { ConversationItem } from "@/components/chat/conversation-item";
import { Icon } from "@/components/ui/icon";
import type { Conversation, ConversationFilter } from "@/types/chat";

type ConversationListProps = {
  items: Conversation[];
  selectedId: string | null;
  search: string;
  filter: ConversationFilter;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: ConversationFilter) => void;
  onSelect: (id: string) => void;
  onLoadMore: () => void;
  onRetry: () => void;
};

export function ConversationList({
  items,
  selectedId,
  search,
  filter,
  loading,
  loadingMore,
  hasMore,
  error,
  onSearchChange,
  onFilterChange,
  onSelect,
  onLoadMore,
  onRetry,
}: ConversationListProps) {
  return (
    <section className="flex h-full min-h-0 w-full flex-col border-r border-outline-variant bg-surface">
      <div className="border-b border-outline-variant px-3 py-3">
        <label className="relative block">
          <span className="sr-only">Search conversations</span>
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-on-surface-variant">
            <Icon name="search" size={18} />
          </span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search conversations..."
            className="h-10 w-full rounded-xl border border-outline-variant bg-background pl-10 pr-3 text-sm text-on-surface outline-none placeholder:text-outline focus:border-primary-dark focus:bg-surface focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <div className="mt-3">
          <ConversationFilters value={filter} onChange={onFilterChange} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {loading ? (
          <div className="space-y-2" aria-busy="true" aria-label="Loading conversations">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex gap-3 px-3 py-2.5">
                <div className="size-10 shrink-0 animate-pulse rounded-full bg-background" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-background" />
                  <div className="h-3 w-full animate-pulse rounded bg-background" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="px-3 py-10 text-center">
            <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-background text-on-surface-variant">
              <Icon name="error" size={20} />
            </span>
            <p className="mt-3 text-sm font-medium text-on-surface">{error}</p>
            <p className="mt-1 text-sm text-on-surface-variant">Please try again.</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-secondary hover:text-primary-dark"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-background text-on-surface-variant">
              <Icon name="mark_chat_read" size={20} />
            </span>
            <p className="mt-3 text-sm font-semibold text-on-surface">You&apos;re all caught up.</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              New customer conversations will appear here.
            </p>
          </div>
        ) : (
          <ul>
            {items.map((conversation) => (
              <li key={conversation.id}>
                <ConversationItem
                  conversation={conversation}
                  selected={conversation.id === selectedId}
                  onSelect={onSelect}
                />
              </li>
            ))}
          </ul>
        )}

        {hasMore && !loading ? (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="mt-1 w-full rounded-xl py-2 text-sm font-medium text-on-surface-variant hover:bg-background disabled:opacity-60"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        ) : null}
      </div>
    </section>
  );
}
