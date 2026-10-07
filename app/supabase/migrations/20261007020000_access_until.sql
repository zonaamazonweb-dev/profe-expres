-- Hasta cuándo conserva acceso una cuenta que canceló (ya pagó el ciclo en curso) + código de suscriptor de Hotmart.
alter table public.profiles add column access_until timestamptz;
alter table public.profiles add column hotmart_subscriber_code text;
create index profiles_subscriber_idx on public.profiles (hotmart_subscriber_code) where hotmart_subscriber_code is not null;
