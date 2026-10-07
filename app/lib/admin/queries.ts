import "server-only";
import { createServiceClient } from "@/lib/supabase/admin";
import { DAY_MS } from "./metrics";
import type {
  AiCallRow, CostRow, ErrorRow, EventRow, MembershipEventRow, ProfileRow, SpendRow, TxRow, WebhookRow,
} from "./types";

const PAGE = 1000; // máximo de filas por petición de Supabase
const CAP = 30_000; // tope de seguridad por consulta

type Page<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>;

/** Trae TODAS las filas (paginando) y avisa si se alcanzó el tope, para no mostrar un número recortado como si fuera total. */
async function fetchAll<T>(build: (from: number, to: number) => Page<T>): Promise<{ rows: T[]; truncated: boolean }> {
  const rows: T[] = [];
  for (let from = 0; from < CAP; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) return { rows, truncated: false };
  }
  return { rows, truncated: true };
}

const since = (days: number) => new Date(Date.now() - days * DAY_MS).toISOString();
const db = () => createServiceClient();

export async function getProfiles() {
  return fetchAll<ProfileRow>((a, b) =>
    db().from("profiles")
      .select("id,email,full_name,role,status,access_origin,source,first_paid_at,cancelled_at,cancel_kind,last_seen_at,created_at")
      .order("created_at", { ascending: false }).range(a, b));
}

/** Ventas: se traen TODAS (el MRR necesita la última venta de cada clienta aunque sea antigua). */
export async function getTransactions() {
  return fetchAll<TxRow>((a, b) =>
    db().from("payment_transactions")
      .select("provider,transaction_id,economic_kind,user_id,source,amount_minor,currency,provider_fee_minor,affiliate_fee_minor,tax_minor,occurred_at,interval_months")
      .order("occurred_at", { ascending: false }).range(a, b));
}

export async function getAiCalls(days: number) {
  return fetchAll<AiCallRow>((a, b) =>
    db().from("ai_calls")
      .select("user_id,feature,model,tokens_in,tokens_out,cost_usd,latency_ms,status,created_at")
      .gte("created_at", since(days)).order("created_at", { ascending: false }).range(a, b));
}

export async function getEvents(days: number) {
  return fetchAll<EventRow>((a, b) =>
    db().from("event_log").select("type,user_id,channel,created_at")
      .gte("created_at", since(days)).order("created_at", { ascending: false }).range(a, b));
}

export async function getMembershipEvents(days: number) {
  return fetchAll<MembershipEventRow>((a, b) =>
    db().from("membership_events").select("user_id,from_status,to_status,churn_kind,origin,occurred_at")
      .gte("occurred_at", since(days)).order("occurred_at", { ascending: false }).range(a, b));
}

export async function getSpends() {
  return fetchAll<SpendRow>((a, b) =>
    db().from("acquisition_spend").select("id,channel,amount_minor,currency,period_start,period_end,note")
      .order("period_start", { ascending: false }).range(a, b));
}

export async function getCosts() {
  return fetchAll<CostRow>((a, b) =>
    db().from("cost_entries").select("id,kind,amount_minor,currency,period_start,period_end,note")
      .order("period_start", { ascending: false }).range(a, b));
}

export async function getWebhookLog(days: number) {
  return fetchAll<WebhookRow>((a, b) =>
    db().from("webhook_log").select("result,type,received_at")
      .gte("received_at", since(days)).order("received_at", { ascending: false }).range(a, b));
}

export async function getErrors(days: number) {
  return fetchAll<ErrorRow>((a, b) =>
    db().from("error_log").select("message,context,fingerprint,created_at")
      .gte("created_at", since(days)).order("created_at", { ascending: false }).range(a, b));
}
