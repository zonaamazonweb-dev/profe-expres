export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  role: "user" | "admin";
  status: "active" | "past_due" | "cancelled" | "refunded" | "chargeback" | "disabled";
  access_origin: "hotmart" | "manual";
  source: string | null;
  first_paid_at: string | null;
  cancelled_at: string | null;
  cancel_kind: "voluntary" | "involuntary" | null;
  last_seen_at: string | null;
  created_at: string;
}

export interface TxRow {
  provider: string;
  transaction_id: string;
  economic_kind: "sale" | "refund" | "chargeback";
  user_id: string | null;
  source: string | null;
  amount_minor: number;
  currency: string;
  provider_fee_minor: number | null;
  affiliate_fee_minor: number | null;
  tax_minor: number | null;
  occurred_at: string;
  interval_months: number;
}

export interface AiCallRow {
  user_id: string | null;
  feature: string;
  model: string;
  tokens_in: number | null;
  tokens_out: number | null;
  cost_usd: number | null;
  latency_ms: number | null;
  status: "ok" | "error" | "timeout" | "moderated";
  created_at: string;
}

export interface EventRow {
  type: string;
  user_id: string | null;
  channel: string | null;
  created_at: string;
}

export interface MembershipEventRow {
  user_id: string;
  from_status: string | null;
  to_status: string;
  churn_kind: "voluntary" | "involuntary" | null;
  origin: "hotmart" | "manual" | "system";
  occurred_at: string;
}

export interface SpendRow {
  id: number;
  channel: string;
  amount_minor: number;
  currency: string;
  period_start: string;
  period_end: string;
  note: string | null;
}

export interface CostRow {
  id: number;
  kind: "infra" | "email" | "tax" | "other";
  amount_minor: number;
  currency: string;
  period_start: string;
  period_end: string;
  note: string | null;
}

export interface WebhookRow {
  result: "applied" | "duplicate" | "illegal" | "unauthorized" | "error";
  type: string | null;
  received_at: string;
}

export interface ErrorRow {
  message: string;
  context: string | null;
  fingerprint: string;
  created_at: string;
}

export interface Range {
  start: Date;
  end: Date;
}
