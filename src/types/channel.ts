export type ChannelType = "WHATSAPP" | "INSTAGRAM";

export type ChannelStatus = "ACTIVE" | "INACTIVE";

export type BusinessChannel = {
  id: string;
  channel: ChannelType;
  status: ChannelStatus;
  display_name: string | null;
  external_account_id: string | null;
  external_phone_number_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateChannelInput = {
  channel: ChannelType;
  display_name?: string;
  external_account_id?: string;
  external_phone_number_id: string;
  status?: ChannelStatus;
};

export type UpdateChannelInput = {
  display_name?: string | null;
  external_account_id?: string | null;
  external_phone_number_id?: string;
  status?: ChannelStatus;
};
