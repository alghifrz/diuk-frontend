export type Money = number | string;

export type AnalyticsEnvelope<TSummary> = {
  from: string;
  to: string;
  timezone: string;
  summary: TSummary;
};

export type AnalyticsReport<TSummary, TSeries> = AnalyticsEnvelope<TSummary> & {
  series: TSeries[];
};

export type NamedCount = { key: string; count: number };
export type SeriesPoint = { date: string; value: number };

export type AnalyticsOverview = {
  total_conversations: number;
  open_conversations: number;
  closed_conversations: number;
  ai_active_conversations: number;
  human_requested_conversations: number;
  human_active_conversations: number;
  resolved_human_conversations: number;
  total_customers: number;
  new_customers: number;
  total_reservations: number;
  confirmed_reservations: number;
  cancelled_reservations: number;
  completed_reservations: number;
  ai_generated_messages: number;
  human_messages: number;
  inbound_messages: number;
  outbound_messages: number;
  automation_runs: number;
  automation_successes: number;
  automation_failures: number;
};

export type AnalyticsConversations = {
  total: number;
  open: number;
  closed: number;
  by_channel: NamedCount[];
  by_handling_state: NamedCount[];
  inbound_messages: number;
  outbound_messages: number;
  ai_handled: number;
  human_handled: number;
  human_requested: number;
  average_conversation_duration: number | null;
};

export type AnalyticsCustomers = {
  total_customers: number;
  new_customers: number;
  active_customers: number;
  customers_with_conversations: number;
  customers_with_reservations: number;
};

export type ReservationBreakdown = {
  reservation_count: number;
  confirmed_count: number;
  completed_count: number;
  cancelled_count: number;
};

export type AnalyticsReservations = {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  confirmation_rate: number;
  cancellation_rate: number;
  completion_rate: number;
  total_party_size: number;
  average_party_size: number;
  by_area: Array<ReservationBreakdown & { area_id: string; area_name: string }>;
  by_table: Array<
    ReservationBreakdown & {
      table_id: string;
      table_name: string;
      area_name: string;
    }
  >;
  by_hour: Array<ReservationBreakdown & { hour: number }>;
  by_weekday: Array<ReservationBreakdown & { day_of_week: number }>;
};

export type AnalyticsReservationDay = {
  date: string;
  reservations: number;
  confirmed: number;
  cancelled: number;
  completed: number;
};

export type AnalyticsConversion = {
  conversations: number;
  conversations_with_reservation: number;
  reservations_created: number;
  reservations_confirmed: number;
  reservations_completed: number;
  reservations_cancelled: number;
  conversation_reservation_rate: number;
  confirmation_rate: number;
  completion_rate: number;
  cancellation_rate: number;
  reservations_requiring_payment: number;
  reservations_paid: number;
  reservations_unpaid: number;
  reservations_confirmed_paid: number;
  reservations_cancelled_after_payment: number;
  reservations_refunded: number;
  payment_collection_rate: number;
  paid_reservation_confirmation_rate: number;
};

export type AnalyticsConversionDay = {
  date: string;
  conversations: number;
  reservations: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  paid_reservations: number;
  payment_amount: Money;
  paid_amount: Money;
};

export type AnalyticsRevenueSummary = {
  payment_records: number;
  paid_count: number;
  unpaid_count: number;
  refunded_count: number;
  total_amount: Money;
  paid_amount: Money;
  unpaid_amount: Money;
  refunded_amount: Money;
  reservations_requiring_payment: number;
  payment_collection_rate: number;
};

export type AnalyticsRevenueDay = {
  date: string;
  payment_records: number;
  paid_count: number;
  total_amount: Money;
  paid_amount: Money;
};

export type AnalyticsAI = {
  total_ai_generations: number;
  successful_generations: number;
  failed_generations: number;
  skipped_generations: number;
  ai_messages_generated: number;
  average_ai_generation_latency: number | null;
  by_provider: Array<{
    provider: string;
    model: string;
    generation_count: number;
    failure_count: number;
    average_latency_ms: number | null;
  }>;
};

export type AnalyticsHandover = {
  handover_count: number;
  customer_requested_count: number;
  ai_unable_count: number;
  manual_handoff_count: number;
  human_started_count: number;
  human_resolved_count: number;
  average_time_to_human: number | null;
  average_human_handling_duration: number | null;
  by_reason: NamedCount[];
  by_channel: NamedCount[];
};

export type AnalyticsAutomation = {
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  skipped_runs: number;
  success_rate: number;
  failure_rate: number;
  by_automation: Array<{
    automation_id: string;
    automation_name: string;
    action_type: string;
    total_runs: number;
    successful_runs: number;
    failed_runs: number;
    skipped_runs: number;
  }>;
  by_action_type: NamedCount[];
};

export type AnalyticsMessaging = {
  inbound_messages: number;
  outbound_messages: number;
  queued: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  by_channel: NamedCount[];
  by_direction: NamedCount[];
  by_status: NamedCount[];
};

export type AnalyticsCampaigns = {
  total_campaigns: number;
  total_runs: number;
  completed_runs: number;
  cancelled_runs: number;
  total_recipients: number;
  queued: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  skipped: number;
  by_campaign_status: NamedCount[];
  by_recipient_status: NamedCount[];
};

export type AnalyticsRevenueReport = AnalyticsReport<
  AnalyticsRevenueSummary,
  AnalyticsRevenueDay
>;
