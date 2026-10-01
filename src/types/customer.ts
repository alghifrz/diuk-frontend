export type CustomerTag = {
  id: string;
  name: string;
  description: string | null;
  status: string;
};

export type CustomerIdentity = {
  id: string;
  channel: string;
  external_id: string;
  display_name: string | null;
  status: string;
};

export type CustomerStats = {
  reservation_count: number;
  completed_count: number;
  cancelled_count: number;
  /** Paid/deposit amount on completed reservations. */
  total_spent: number | string;
  last_visit_at: string | null;
  next_reservation_at: string | null;
};

export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  status: string;
  marketing_opt_in: boolean;
  identity_count: number;
  active_tag_count: number;
  stats?: CustomerStats;
  identities?: CustomerIdentity[];
  tags?: CustomerTag[];
  created_at: string;
  updated_at: string;
};

export type CustomerSort =
  | "newest"
  | "name"
  | "spend"
  | "visits"
  | "last_visit";

export type CustomerInput = {
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  marketing_opt_in?: boolean;
};

export type { Reservation } from "@/types/reservation";
