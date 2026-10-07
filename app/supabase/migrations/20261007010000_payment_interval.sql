-- Cada cuántos meses cobra el plan de esa venta (1 = mensual, 12 = anual). Permite amortizar el MRR sin inventar.
alter table public.payment_transactions
  add column interval_months smallint not null default 1 check (interval_months between 1 and 24);
