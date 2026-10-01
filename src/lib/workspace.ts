export function getWorkspaceId() {
  return process.env.NEXT_PUBLIC_BUSINESS_ID?.trim() || null;
}
