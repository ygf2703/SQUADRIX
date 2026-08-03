-- Club subscription state. Microsoft Store entitlements are written only by a
-- trusted server-side verifier; the browser is deliberately read-only.

create type public.club_subscription_status as enum ('trial', 'active', 'expired', 'cancelled');

create table public.club_subscriptions (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null unique references public.clubs(id) on delete cascade,
  provider text not null default 'microsoft_store',
  provider_product_id text not null default '9P2WBRG7415R',
  status public.club_subscription_status not null default 'trial',
  trial_ends_at timestamptz,
  current_period_ends_at timestamptz,
  verified_at timestamptz,
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.club_subscriptions enable row level security;

create policy "club managers read subscription status"
on public.club_subscriptions for select to authenticated
using (public.is_club_manager(club_id));

-- The client must never change subscription status. A future Netlify function
-- verifies a Store entitlement with its server credentials before it writes.

create or replace function public.get_club_subscription(target_club_id uuid)
returns table (
  status public.club_subscription_status,
  trial_ends_at timestamptz,
  current_period_ends_at timestamptz,
  provider_product_id text
)
language plpgsql stable security definer set search_path = public as $$
declare club_created_at timestamptz;
begin
  if not public.is_club_manager(target_club_id) then raise exception 'Not authorized'; end if;

  select created_at into club_created_at from public.clubs where id = target_club_id;
  if club_created_at is null then raise exception 'Club not found'; end if;

  return query
  select
    coalesce(subscription.status,
      case when club_created_at + interval '30 days' > now()
        then 'trial'::public.club_subscription_status
        else 'expired'::public.club_subscription_status
      end),
    coalesce(subscription.trial_ends_at, club_created_at + interval '30 days'),
    subscription.current_period_ends_at,
    coalesce(subscription.provider_product_id, '9P2WBRG7415R')
  from (select 1) marker
  left join public.club_subscriptions subscription on subscription.club_id = target_club_id;
end;
$$;
