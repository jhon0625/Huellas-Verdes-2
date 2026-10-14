-- =========================================================
-- HUELLAS VERDES - Esquema de base de datos para Supabase
-- =========================================================
-- Cómo usar: Supabase Dashboard -> SQL Editor -> pegar todo
-- este archivo -> Run.
-- =========================================================

-- Extensión necesaria para generar UUIDs
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- Tabla: profiles
-- Un perfil por usuario autenticado (se crea automáticamente
-- con un trigger cuando alguien se registra en auth.users)
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_emoji text default '🌱',
  role text not null default 'ciudadano' check (role in ('ciudadano', 'ong')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Los perfiles son visibles para cualquier usuario autenticado"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Un usuario solo puede editar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Un usuario puede crear su propio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Crea automáticamente un perfil cuando se registra un usuario nuevo
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- Tabla: threats (amenazas ambientales reportadas)
-- ---------------------------------------------------------
create table if not exists public.threats (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  lat double precision not null,
  lng double precision not null,
  status text not null default 'sin_validar' check (
    status in ('sin_validar', 'confirmado', 'descartado', 'resuelto')
  ),
  photo_url text,
  created_at timestamptz not null default now()
);

alter table public.threats
  drop constraint if exists threats_category_check;

alter table public.threats
  add constraint threats_category_check check (
    category in (
      'incendios_forestales', 'animales_en_peligro', 'deforestacion',
      'dano_ecosistemas', 'reforestacion', 'quema', 'vertimiento',
      'mineria_ilegal', 'caza_furtiva', 'residuos', 'otro'
    )
  );

insert into storage.buckets (id, name, public, file_size_limit)
values ('threat-photos', 'threat-photos', true, 5242880)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

drop policy if exists "Usuarios autenticados pueden subir sus fotos de reportes"
  on storage.objects;
create policy "Usuarios autenticados pueden subir sus fotos de reportes"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'threat-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Usuarios pueden borrar sus fotos de reportes"
  on storage.objects;
create policy "Usuarios pueden borrar sus fotos de reportes"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'threat-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create index if not exists threats_created_at_idx on public.threats (created_at desc);
create index if not exists threats_lat_lng_idx on public.threats (lat, lng);

alter table public.threats enable row level security;

create policy "Cualquier usuario autenticado puede ver las amenazas"
  on public.threats for select
  using (auth.role() = 'authenticated');

create policy "Cualquier usuario autenticado puede reportar una amenaza"
  on public.threats for insert
  with check (auth.uid() = reporter_id);

create policy "Solo quien reporta puede editar su amenaza"
  on public.threats for update
  using (auth.uid() = reporter_id);

-- ---------------------------------------------------------
-- Tabla: threat_validations (validación ciudadana en tiempo real)
-- Cada usuario cercano responde "lo veo" / "no lo veo"
-- ---------------------------------------------------------
create table if not exists public.threat_validations (
  id uuid primary key default gen_random_uuid(),
  threat_id uuid not null references public.threats (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  confirms boolean not null,
  created_at timestamptz not null default now(),
  unique (threat_id, user_id)
);

alter table public.threat_validations enable row level security;

create policy "Cualquier usuario autenticado puede ver validaciones"
  on public.threat_validations for select
  using (auth.role() = 'authenticated');

create policy "Un usuario autenticado puede votar una sola vez por amenaza"
  on public.threat_validations for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------
-- Vista: threats_with_score
-- Amenaza + conteo de confirmaciones/descartes, útil para el
-- backend y el mapa (nivel de confianza comunitario)
-- ---------------------------------------------------------
create or replace view public.threats_with_score as
select
  t.*,
  coalesce(sum(case when v.confirms then 1 else 0 end), 0) as confirmations,
  coalesce(sum(case when v.confirms = false then 1 else 0 end), 0) as dismissals,
  count(v.id) as total_votes
from public.threats t
left join public.threat_validations v on v.threat_id = t.id
group by t.id;

-- ---------------------------------------------------------
-- Tabla: volunteer_calls (convocatorias de voluntariado de ONG)
-- ---------------------------------------------------------
create table if not exists public.volunteer_calls (
  id uuid primary key default gen_random_uuid(),
  threat_id uuid references public.threats (id) on delete set null,
  ong_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  needed_volunteers int default 0,
  created_at timestamptz not null default now()
);

alter table public.volunteer_calls enable row level security;

create policy "Cualquier usuario autenticado puede ver convocatorias"
  on public.volunteer_calls for select
  using (auth.role() = 'authenticated');

create policy "Solo una ONG puede crear convocatorias"
  on public.volunteer_calls for insert
  with check (auth.uid() = ong_id);
