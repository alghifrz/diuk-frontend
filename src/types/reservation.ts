export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export type PaymentStatus = "UNPAID" | "DEPOSIT" | "PAID" | "REFUNDED";

export type PaymentType = "NONE" | "FULL" | "DEPOSIT";

export type ReservationCustomer = {
  id: string;
  name: string;
  phone: string | null;
};

export type ReservationTable = {
  table_id: string;
  table_name: string;
  area_id: string;
  area_name: string;
  capacity: number;
};

export type ReservationItem = {
  id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: string | number;
  notes: string | null;
};

export type Reservation = {
  id: string;
  customer_id: string;
  table_id: string | null;
  party_size: number;
  start_at: string;
  end_at: string;
  status: ReservationStatus;
  notes: string | null;
  cancellation_reason: string | null;
  confirmed_at: string | null;
  completed_at: string | null;
  customer: ReservationCustomer;
  table: ReservationTable | null;
  items: ReservationItem[];
  created_at: string;
  updated_at: string;
};

export type AvailableTable = ReservationTable;

export type Availability = {
  date: string;
  start_at: string;
  end_at: string;
  party_size: number;
  available: boolean;
  tables: AvailableTable[];
};

export type CreateReservationInput = {
  customer_id: string;
  start_at: string;
  end_at: string;
  party_size: number;
  table_id?: string | null;
  notes?: string | null;
};

export type RescheduleReservationInput = {
  start_at: string;
  end_at: string;
  party_size?: number;
  table_id?: string | null;
};

export type ReservationPayment = {
  id: string;
  reservation_id: string;
  status: PaymentStatus;
  payment_type: PaymentType | string;
  amount: number | string;
  currency: string;
  notes: string | null;
  confirmed_at: string | null;
  confirmed_by: string | null;
  refunded_at: string | null;
  refunded_by: string | null;
  created_at: string;
  updated_at: string;
};

export type FnbSettings = {
  business_id: string;
  currency: string;
  reservation_enabled: boolean;
  reservation_slot_duration_minutes: number;
  reservation_min_party_size: number;
  reservation_max_party_size: number;
  reservation_min_advance_minutes: number;
  reservation_max_advance_days: number;
  deposit_enabled: boolean;
  deposit_type: string;
  deposit_value: number | string;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_holder?: string | null;
};

export type BusinessProfile = {
  id: string;
  name: string;
  slug: string;
  business_type: string;
  timezone: string;
  status: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  website_url: string | null;
  logo_url: string | null;
};

export type CalendarDayEvent = {
  id: string;
  type: string;
  reservation_id?: string | null;
  title: string;
  start_at: string;
  end_at: string;
  status: string;
  scope?: string;
  description?: string | null;
  customer_id?: string | null;
  customer?: string;
  party_size?: number | null;
  table_id?: string | null;
  table?: string;
  area_id?: string | null;
  area?: string;
  payment_status?: string | null;
};

export type CalendarDayView = {
  date: string;
  timezone: string;
  closed: boolean;
  hours: Array<{ open_time: string; close_time: string }>;
  exception: {
    id: string;
    is_closed: boolean;
    open_time: string | null;
    close_time: string | null;
    note: string | null;
  } | null;
  events: CalendarDayEvent[];
};

export type ListReservationsParams = {
  status?: ReservationStatus | "";
  customer_id?: string;
  table_id?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
};
