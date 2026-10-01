export type BusinessHour = {
  id?: string;
  day_of_week: number;
  sort_order: number;
  open_time: string;
  close_time: string;
};

export type BusinessHourInput = {
  day_of_week: number;
  sort_order: number;
  open_time: string;
  close_time: string;
};

export type ScheduleException = {
  id: string;
  exception_date: string;
  is_closed: boolean;
  open_time: string | null;
  close_time: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateScheduleExceptionInput = {
  exception_date: string;
  is_closed: boolean;
  open_time?: string | null;
  close_time?: string | null;
  note?: string | null;
};

export type UpdateBusinessProfileInput = {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  website_url?: string;
};

export type UpdateFnbSettingsInput = {
  currency?: string;
  reservation_enabled?: boolean;
  reservation_slot_duration_minutes?: number;
  reservation_min_party_size?: number;
  reservation_max_party_size?: number;
  reservation_min_advance_minutes?: number;
  reservation_max_advance_days?: number;
  deposit_enabled?: boolean;
  deposit_type?: "FIXED" | "PERCENTAGE";
  deposit_value?: number | string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_holder?: string;
};

export const WEEKDAYS = [
  { day: 0, label: "Sunday", short: "Sun" },
  { day: 1, label: "Monday", short: "Mon" },
  { day: 2, label: "Tuesday", short: "Tue" },
  { day: 3, label: "Wednesday", short: "Wed" },
  { day: 4, label: "Thursday", short: "Thu" },
  { day: 5, label: "Friday", short: "Fri" },
  { day: 6, label: "Saturday", short: "Sat" },
] as const;
