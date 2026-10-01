export const INBOX_CHANGED_EVENT = "diuk:inbox-changed";

export function notifyInboxChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(INBOX_CHANGED_EVENT));
}

export function subscribeInboxChanged(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(INBOX_CHANGED_EVENT, listener);
  return () => window.removeEventListener(INBOX_CHANGED_EVENT, listener);
}
