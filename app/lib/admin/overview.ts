import "server-only";
import {
  aiSummary, buildAlerts, channelEconomics, churnSummary, groupErrors, makeRange, mrrByCurrency, previousRange,
  profitSummary, salesSummary, webhookHealth, DAY_MS,
} from "./metrics";
import {
  getAiCalls, getCosts, getErrors, getEvents, getMembershipEvents, getProfiles, getSpends, getTransactions, getWebhookLog,
} from "./queries";

/** Una sola carga de datos reales del negocio, ya calculada. Las pantallas toman de aquí lo que necesitan. */
export async function loadOverview(days: number) {
  const range = makeRange(days);
  const prev = previousRange(range);
  const lookback = days * 2 + 1;

  const [profiles, txs, aiCalls, events, membership, spends, costs, webhooks, errors] = await Promise.all([
    getProfiles(), getTransactions(), getAiCalls(lookback), getEvents(Math.max(lookback, 35)), getMembershipEvents(lookback),
    getSpends(), getCosts(), getWebhookLog(Math.max(days, 30)), getErrors(Math.max(days, 7)),
  ]);

  const truncated = [profiles, txs, aiCalls, events, membership, spends, costs, webhooks, errors].some((r) => r.truncated);
  const now = Date.now();

  const sales = salesSummary(txs.rows, range);
  const salesPrev = salesSummary(txs.rows, prev);
  const mrr = mrrByCurrency(profiles.rows, txs.rows);
  const churn = churnSummary(membership.rows, profiles.rows, range);
  const profit = profitSummary({ txs: txs.rows, aiCalls: aiCalls.rows, costs: costs.rows, range });
  const ai = aiSummary(aiCalls.rows, range, now);
  const aiPrev = aiSummary(aiCalls.rows, prev, now);
  const channels = channelEconomics({ profiles: profiles.rows, txs: txs.rows, spends: spends.rows, range });
  const errorGroups = groupErrors(errors.rows, range);
  const webhook = webhookHealth(webhooks.rows, now);

  const t24 = now - DAY_MS, t48 = now - 2 * DAY_MS;
  const errorsLast24h = errors.rows.filter((e) => new Date(e.created_at).getTime() > t24).length;
  const errorsPrev24h = errors.rows.filter((e) => { const t = new Date(e.created_at).getTime(); return t > t48 && t <= t24; }).length;

  const incomeUsd = sales.find((s) => s.currency === "USD")?.net ?? 0;
  const alerts = buildAlerts({ profit, ai, incomeUsd, churn, channels, errors: errorGroups, errorsLast24h, errorsPrev24h, webhook });

  return {
    days, range, prev, now, truncated,
    profiles: profiles.rows, txs: txs.rows, aiCalls: aiCalls.rows, events: events.rows, membership: membership.rows,
    spends: spends.rows, costs: costs.rows, webhooks: webhooks.rows, errors: errors.rows,
    sales, salesPrev, mrr, churn, profit, ai, aiPrev, channels, errorGroups, webhook, alerts,
  };
}
export type Overview = Awaited<ReturnType<typeof loadOverview>>;
