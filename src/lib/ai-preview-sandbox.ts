import { createConversation, updateConversation } from "@/lib/api/conversations";
import { createCustomer, listCustomers } from "@/lib/api/customers";
import { ApiError } from "@/lib/api/errors";
import type { Customer } from "@/types/customer";

export const PREVIEW_CUSTOMER_NAME = "AI Preview";
export const PREVIEW_CUSTOMER_NOTE =
  "Internal sandbox customer for /prompt Try it. Not a WhatsApp contact.";

function stageError(stage: string, err: unknown): Error {
  if (err instanceof ApiError) {
    return new ApiError(
      err.status,
      err.code,
      `${stage}: ${err.message || err.code}`,
    );
  }
  if (err instanceof Error) {
    return new Error(`${stage}: ${err.message}`);
  }
  return new Error(`${stage}: unexpected error`);
}

async function findOrCreatePreviewCustomer(): Promise<Customer> {
  let rows: Customer[] = [];
  try {
    const listed = await listCustomers({
      search: PREVIEW_CUSTOMER_NAME,
      status: "ACTIVE",
      limit: 20,
      offset: 0,
    });
    rows = Array.isArray(listed) ? listed : [];
  } catch (err) {
    throw stageError("Couldn't load customers for test chat", err);
  }

  const existing =
    rows.find((item) => item.name === PREVIEW_CUSTOMER_NAME) ?? null;
  if (existing?.id) {
    return existing;
  }

  try {
    return await createCustomer({
      name: PREVIEW_CUSTOMER_NAME,
      notes: PREVIEW_CUSTOMER_NOTE,
    });
  } catch (err) {
    throw stageError("Couldn't create the test chat customer", err);
  }
}

/** Find or create a WEBSITE sandbox conversation (never WhatsApp). */
export async function ensurePreviewConversation() {
  const customer = await findOrCreatePreviewCustomer();

  try {
    const conversation = await createConversation({
      customer_id: customer.id,
      channel: "WEBSITE",
    });
    if (!conversation?.id) {
      throw new Error("Conversation response was empty");
    }
    return conversation;
  } catch (err) {
    throw stageError("Couldn't open the temporary test chat", err);
  }
}

/** Close the current sandbox thread so the next send starts a fresh chat. */
export async function resetPreviewConversation(conversationId: string | null) {
  if (!conversationId) {
    return;
  }
  try {
    await updateConversation(conversationId, { status: "CLOSED" });
  } catch {
    // Ignore — next ensure will reuse or create as needed.
  }
}
