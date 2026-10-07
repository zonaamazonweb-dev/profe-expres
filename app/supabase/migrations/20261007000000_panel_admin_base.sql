-- Profe Exprés — base del panel de administración y de las cuentas de pago.
-- Principios:
--   · RLS activo en TODAS las tablas. Ningún usuario normal lee ni escribe datos del negocio.
--   · Los datos del negocio los escribe SOLO el servidor (service_role) tras verificar permisos.
--   · Dinero siempre en unidad menor entera (amount_minor) + moneda ISO 4217. Nunca se suman monedas distintas.
--   · El proyecto se creó con "exponer tablas automáticamente" DESACTIVADO: cada permiso es explícito.

-- ─────────────────────────────────────────────────────────────────────────────
-- Utilidades
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles: una fila por cuenta con acceso
-- ─────────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  email          text not null,
  full_name      text,
  role           text not null default 'user' check (role in ('user', 'admin')),
  status         text not null default 'active'
                   check (status in ('active', 'past_due', 'cancelled', 'refunded', 'chargeback', 'disabled')),
  access_origin  text not null default 'hotmart' check (access_origin in ('hotmart', 'manual')),
  source         text,                                   -- canal de adquisición (afiliado, ads_meta, organico...)
  plan           text,
  first_paid_at  timestamptz,
  cancelled_at   timestamptz,
  cancel_kind    text check (cancel_kind in ('voluntary', 'involuntary')),
  last_seen_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create unique index profiles_email_lower_idx on public.profiles (lower(email));
create index profiles_status_idx on public.profiles (status);
create index profiles_source_idx on public.profiles (source);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crea el perfil automáticamente cuando nace una cuenta en auth.users.
-- El rol SIEMPRE nace como 'user': nadie se vuelve admin por metadatos que él mismo controle.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ¿La persona de esta sesión es admin? (security definer evita recursión de RLS sobre profiles)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin' and p.status <> 'disabled'
  );
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Registro de eventos de producto (fuente de verdad de activación y retención)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.event_log (
  id          bigint generated always as identity primary key,
  type        text not null,
  user_id     uuid references auth.users(id) on delete set null,
  channel     text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index event_log_type_created_idx on public.event_log (type, created_at desc);
create index event_log_user_created_idx on public.event_log (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Costo real de la IA (una fila por llamada al modelo)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.ai_calls (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  feature     text not null,
  model       text not null,
  tokens_in   integer,
  tokens_out  integer,
  cost_usd    numeric(10, 5),
  latency_ms  integer,
  status      text not null check (status in ('ok', 'error', 'timeout', 'moderated')),
  error       text,
  created_at  timestamptz not null default now()
);
create index ai_calls_user_created_idx on public.ai_calls (user_id, created_at desc);
create index ai_calls_feature_created_idx on public.ai_calls (feature, created_at desc);
create index ai_calls_created_idx on public.ai_calls (created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Errores de la app (agrupados por huella para ver los más frecuentes primero)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.error_log (
  id           bigint generated always as identity primary key,
  message      text not null,
  context      text,
  path         text,
  fingerprint  text not null,
  user_id      uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index error_log_created_idx on public.error_log (created_at desc);
create index error_log_fingerprint_idx on public.error_log (fingerprint, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Pagos de Hotmart: dedupe técnico, log de intentos, ledger económico, bajas
-- ─────────────────────────────────────────────────────────────────────────────
create table public.processed_events (
  event_id      text primary key,
  event_type    text not null,
  payload_hash  text,
  processed_at  timestamptz not null default now()
);

create table public.webhook_log (
  id           bigint generated always as identity primary key,
  event_id     text,
  type         text,
  result       text not null check (result in ('applied', 'duplicate', 'illegal', 'unauthorized', 'error')),
  received_at  timestamptz not null default now()
);
create index webhook_log_received_idx on public.webhook_log (received_at desc);
create index webhook_log_result_idx on public.webhook_log (result, received_at desc);

create table public.payment_transactions (
  provider                text not null,
  transaction_id          text not null,
  economic_kind           text not null check (economic_kind in ('sale', 'refund', 'chargeback')),
  user_id                 uuid references auth.users(id) on delete set null,
  product_id              text not null,
  offer_id                text,
  source                  text,
  amount_minor            bigint not null,
  currency                text not null check (currency ~ '^[A-Z]{3}$'),
  settlement_amount_minor bigint,
  settlement_currency     text check (settlement_currency is null or settlement_currency ~ '^[A-Z]{3}$'),
  provider_fee_minor      bigint,
  affiliate_fee_minor     bigint,
  tax_minor               bigint,
  occurred_at             timestamptz not null,
  raw_event_id            text not null,
  primary key (provider, transaction_id, economic_kind)
);
create index payment_transactions_occurred_idx on public.payment_transactions (occurred_at desc);
create index payment_transactions_user_idx on public.payment_transactions (user_id);

create table public.membership_events (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  from_status  text,
  to_status    text not null,
  churn_kind   text check (churn_kind in ('voluntary', 'involuntary')),
  origin       text not null check (origin in ('hotmart', 'manual', 'system')),
  occurred_at  timestamptz not null default now()
);
create index membership_events_occurred_idx on public.membership_events (occurred_at desc);
create index membership_events_user_idx on public.membership_events (user_id, occurred_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Datos que solo el dueño conoce (se ingresan a mano en el panel)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.acquisition_spend (
  id            bigint generated always as identity primary key,
  channel       text not null,
  amount_minor  bigint not null check (amount_minor >= 0),
  currency      text not null check (currency ~ '^[A-Z]{3}$'),
  period_start  date not null,
  period_end    date not null check (period_end >= period_start),
  note          text,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index acquisition_spend_period_idx on public.acquisition_spend (period_start, channel);

create table public.cost_entries (
  id            bigint generated always as identity primary key,
  kind          text not null check (kind in ('infra', 'email', 'tax', 'other')),
  amount_minor  bigint not null check (amount_minor >= 0),
  currency      text not null check (currency ~ '^[A-Z]{3}$'),
  period_start  date not null,
  period_end    date not null check (period_end >= period_start),
  note          text,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index cost_entries_period_idx on public.cost_entries (period_start, kind);

-- ─────────────────────────────────────────────────────────────────────────────
-- Auditoría de lo que hace el admin
-- ─────────────────────────────────────────────────────────────────────────────
create table public.admin_audit_log (
  id               bigint generated always as identity primary key,
  admin_id         uuid references auth.users(id) on delete set null,
  action           text not null,
  target_user_id   uuid,
  target_email     text,
  details          jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);
create index admin_audit_log_created_idx on public.admin_audit_log (created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Límite de intentos (login, verificación de código, acciones del admin)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.rate_limits (
  key           text primary key,
  window_start  timestamptz not null default now(),
  count         integer not null default 0
);

create or replace function public.check_rate_limit(p_key text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits as r (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set window_start = case
          when r.window_start < now() - make_interval(secs => p_window_seconds) then now()
          else r.window_start end,
        count = case
          when r.window_start < now() - make_interval(secs => p_window_seconds) then 1
          else r.count + 1 end
  returning r.count into v_count;
  return v_count <= p_max;
end;
$$;
revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS + permisos explícitos
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles             enable row level security;
alter table public.event_log            enable row level security;
alter table public.ai_calls             enable row level security;
alter table public.error_log            enable row level security;
alter table public.processed_events     enable row level security;
alter table public.webhook_log          enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.membership_events    enable row level security;
alter table public.acquisition_spend    enable row level security;
alter table public.cost_entries         enable row level security;
alter table public.admin_audit_log      enable row level security;
alter table public.rate_limits          enable row level security;

-- Cada persona ve SOLO su propia fila; el admin ve todas. Nadie escribe desde el navegador.
create policy profiles_select_own_or_admin on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());

-- Tablas del negocio: lectura solo para el admin (defensa en profundidad; el panel además lee desde el servidor).
create policy event_log_admin_select            on public.event_log            for select to authenticated using (public.is_admin());
create policy ai_calls_admin_select             on public.ai_calls             for select to authenticated using (public.is_admin());
create policy error_log_admin_select            on public.error_log            for select to authenticated using (public.is_admin());
create policy processed_events_admin_select     on public.processed_events     for select to authenticated using (public.is_admin());
create policy webhook_log_admin_select          on public.webhook_log          for select to authenticated using (public.is_admin());
create policy payment_transactions_admin_select on public.payment_transactions for select to authenticated using (public.is_admin());
create policy membership_events_admin_select    on public.membership_events    for select to authenticated using (public.is_admin());
create policy acquisition_spend_admin_select    on public.acquisition_spend    for select to authenticated using (public.is_admin());
create policy cost_entries_admin_select         on public.cost_entries         for select to authenticated using (public.is_admin());
create policy admin_audit_log_admin_select      on public.admin_audit_log      for select to authenticated using (public.is_admin());
-- rate_limits: sin políticas → ningún rol de la API de datos la toca (solo service_role, que salta RLS).

-- Permisos de tabla: anónimos nada; autenticados solo SELECT (filtrado por las políticas de arriba).
revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles, public.event_log, public.ai_calls, public.error_log,
                public.processed_events, public.webhook_log, public.payment_transactions,
                public.membership_events, public.acquisition_spend, public.cost_entries,
                public.admin_audit_log
  to authenticated;

grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
