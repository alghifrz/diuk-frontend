import { apiRequest } from "@/lib/api/client";
import type {
  BusinessChannel,
  CreateChannelInput,
  UpdateChannelInput,
} from "@/types/channel";

export function listChannels() {
  return apiRequest<BusinessChannel[]>("/api/v1/channels");
}

export function createChannel(input: CreateChannelInput) {
  return apiRequest<BusinessChannel>("/api/v1/channels", {
    method: "POST",
    body: JSON.stringify({
      channel: input.channel,
      display_name: input.display_name || undefined,
      external_account_id: input.external_account_id || undefined,
      external_phone_number_id: input.external_phone_number_id,
      status: input.status,
    }),
  });
}

export function updateChannel(id: string, input: UpdateChannelInput) {
  return apiRequest<BusinessChannel>(`/api/v1/channels/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      display_name: input.display_name,
      external_account_id: input.external_account_id,
      external_phone_number_id: input.external_phone_number_id,
      status: input.status,
    }),
  });
}
