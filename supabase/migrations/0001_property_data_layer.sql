-- Milestone 2: Property Data Layer & Photo Architecture.
--
-- This schema is forward-looking storage for normalized property facts,
-- their per-source provenance, and photos. It is not yet written to or read
-- from by application code: the mock fixture adapter (Configuration A)
-- works entirely in memory, by design, so day-to-day development and
-- automated tests never touch the database or a live provider. This
-- migration exists so the persistence layer is ready when a real adapter
-- (RentCast) starts syncing data, and for later milestones that need to
-- reference a stable property id (My Deals, saved scenarios, etc.).
--
-- Not yet applied to any Supabase project — review before running
-- `supabase db push`.

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  -- Stable id from whichever PropertyDataProvider sourced this record
  -- (e.g. a MockFixtureAdapter fixture id, or a future RentCast property id).
  source_property_id text,
  formatted_address text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  latitude double precision,
  longitude double precision,
  property_type text,
  bedrooms numeric,
  bathrooms numeric,
  square_footage numeric,
  lot_size_sqft numeric,
  year_built integer,
  price numeric,
  listing_status text not null default 'unknown',
  last_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint properties_listing_status_check
    check (listing_status in ('active', 'off_market', 'unknown'))
);

create unique index if not exists properties_source_property_id_key
  on public.properties (source_property_id)
  where source_property_id is not null;

-- Preserves every source's reported value for every fact (spec section
-- 10.2 — "preserve every source value internally"), not just the one
-- selected for the normalized record above.
create table if not exists public.property_fact_source_values (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  fact_name text not null,
  source text not null,
  value jsonb not null,
  status text not null default 'reported',
  confidence numeric,
  retrieved_at timestamptz not null default now(),
  is_selected boolean not null default false,
  selection_rule text,
  created_at timestamptz not null default now(),
  constraint property_fact_source_values_source_check
    check (source in ('rentcast', 'realtor', 'zillow', 'redfin', 'manual_entry', 'mock')),
  constraint property_fact_source_values_status_check
    check (status in (
      'confirmed', 'reported', 'estimated', 'unverified',
      'low_confidence', 'insufficient_data', 'not_available'
    ))
);

create index if not exists property_fact_source_values_property_id_idx
  on public.property_fact_source_values (property_id, fact_name);

create table if not exists public.property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  source text not null default 'placeholder',
  external_url text,
  storage_path text,
  is_primary boolean not null default false,
  display_order integer not null default 0,
  alt_text text not null,
  attribution text,
  license_notes text,
  created_at timestamptz not null default now(),
  constraint property_photos_has_image_ref
    check (external_url is not null or storage_path is not null or source = 'placeholder')
);

create index if not exists property_photos_property_id_idx
  on public.property_photos (property_id, display_order);

-- Property facts and photos are not user-owned data — public read, no
-- client-side writes. All writes happen server-side (future sync jobs)
-- using the service role, which bypasses RLS entirely.
alter table public.properties enable row level security;
alter table public.property_fact_source_values enable row level security;
alter table public.property_photos enable row level security;

create policy "Public can read properties"
  on public.properties for select
  using (true);

create policy "Public can read property fact source values"
  on public.property_fact_source_values for select
  using (true);

create policy "Public can read property photos"
  on public.property_photos for select
  using (true);
