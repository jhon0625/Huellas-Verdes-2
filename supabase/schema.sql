-- =========================================================
-- HUELLAS VERDES - Esquema de Base de Datos (Supabase)
-- =========================================================
-- Instrucciones: Copiar todo este código, ir a Supabase Dashboard 
-- -> SQL Editor -> Pegar -> Click en 'Run'.
-- =========================================================

-- Extensión necesaria para generar UUIDs únicos
create extension if not exists "pgcrypto";

-- =========================================================
-- 1. TABLA: profiles (Perfiles de Usuario)
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_emoji text default '🌱',
  role text not null default 'ciudadano' check (role in ('ciudadano', 'ong')),
  huellas integer not null default 0 check (huellas >= 0),
  unlocked_avatars text[] not null default array['a1'],
  equipped_avatar text not null default 'a1',
  created_at timestamptz not null default now()
);

-- Políticas de Seguridad (RLS) para Perfiles
alter table public.profiles enable row level security;

drop policy if exists "Los perfiles son visibles para cualquier usuario autenticado" on public.profiles;
create policy "Los perfiles son visibles para cualquier usuario autenticado"
  on public.profiles for select
  using (auth.role() = 'authenticated');

drop policy if exists "Un usuario solo puede editar su propio perfil" on public.profiles;
create policy "Un usuario solo puede editar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Un usuario puede crear su propio perfil" on public.profiles;
create policy "Un usuario puede crear su propio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger para creación automática de perfil al registrarse
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


-- =========================================================
-- 2. TABLA: threats (Amenazas Ambientales Reportadas)
-- =========================================================
create table if not exists public.threats (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  category text not null check (
    category in (
      'incendios_forestales', 'animales_en_peligro', 'deforestacion',
      'dano_ecosistemas', 'reforestacion', 'quema', 'vertimiento',
      'mineria_ilegal', 'caza_furtiva', 'residuos', 'otro'
    )
  ),
  lat double precision not null,
  lng double precision not null,
  status text not null default 'sin_validar' check (
    status in ('sin_validar', 'confirmado', 'descartado', 'resuelto')
  ),
  reward_status text not null default 'none' check (
    reward_status in ('none', 'rewarded', 'penalized')
  ),
  photo_url text,
  created_at timestamptz not null default now()
);

-- Índices de búsqueda
create index if not exists threats_created_at_idx on public.threats (created_at desc);
create index if not exists threats_lat_lng_idx on public.threats (lat, lng);

-- Políticas RLS para Amenazas
alter table public.threats enable row level security;

drop policy if exists "Cualquier usuario autenticado puede ver las amenazas" on public.threats;
create policy "Cualquier usuario autenticado puede ver las amenazas"
  on public.threats for select
  using (auth.role() = 'authenticated');

drop policy if exists "Cualquier usuario autenticado puede reportar una amenaza" on public.threats;
create policy "Cualquier usuario autenticado puede reportar una amenaza"
  on public.threats for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "Solo quien reporta puede editar su amenaza" on public.threats;
create policy "Solo quien reporta puede editar su amenaza"
  on public.threats for update
  using (auth.uid() = reporter_id);


-- =========================================================
-- 3. ALMACENAMIENTO: Bucket de Fotos para Reportes
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit)
values ('threat-photos', 'threat-photos', true, 5242880)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

drop policy if exists "Usuarios autenticados pueden subir sus fotos de reportes" on storage.objects;
create policy "Usuarios autenticados pueden subir sus fotos de reportes"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'threat-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Usuarios pueden borrar sus fotos de reportes" on storage.objects;
create policy "Usuarios pueden borrar sus fotos de reportes"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'threat-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- =========================================================
-- 4. TABLA: threat_validations (Validaciones Ciudadanas)
-- =========================================================
create table if not exists public.threat_validations (
  id uuid primary key default gen_random_uuid(),
  threat_id uuid not null references public.threats (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  confirms boolean not null,
  created_at timestamptz not null default now(),
  unique (threat_id, user_id)
);

alter table public.threat_validations enable row level security;

drop policy if exists "Cualquier usuario autenticado puede ver validaciones" on public.threat_validations;
create policy "Cualquier usuario autenticado puede ver validaciones"
  on public.threat_validations for select
  using (auth.role() = 'authenticated');

drop policy if exists "Un usuario autenticado puede votar una sola vez por amenaza" on public.threat_validations;
create policy "Un usuario autenticado puede votar una sola vez por amenaza"
  on public.threat_validations for insert
  -- =========================================================
-- HUELLAS VERDES - Esquema de Base de Datos (Supabase)
-- =========================================================
-- Instrucciones: Copiar todo este código, ir a Supabase Dashboard 
-- -> SQL Editor -> Pegar -> Click en 'Run'.
-- =========================================================

-- Extensión necesaria para generar UUIDs únicos
create extension if not exists "pgcrypto";

-- =========================================================
-- 1. TABLA: profiles (Perfiles de Usuario)
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_emoji text default '🌱',
  role text not null default 'ciudadano' check (role in ('ciudadano', 'ong')),
  huellas integer not null default 0 check (huellas >= 0),
  unlocked_avatars text[] not null default array['a1'],
  equipped_avatar text not null default 'a1',
  created_at timestamptz not null default now()
);

-- Políticas de Seguridad (RLS) para Perfiles
alter table public.profiles enable row level security;

drop policy if exists "Los perfiles son visibles para cualquier usuario autenticado" on public.profiles;
create policy "Los perfiles son visibles para cualquier usuario autenticado"
  on public.profiles for select
  using (auth.role() = 'authenticated');

drop policy if exists "Un usuario solo puede editar su propio perfil" on public.profiles;
create policy "Un usuario solo puede editar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Un usuario puede crear su propio perfil" on public.profiles;
create policy "Un usuario puede crear su propio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger para creación automática de perfil al registrarse
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


-- =========================================================
-- 2. TABLA: threats (Amenazas Ambientales Reportadas)
-- =========================================================
create table if not exists public.threats (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  category text not null check (
    category in (
      'incendios_forestales', 'animales_en_peligro', 'deforestacion',
      'dano_ecosistemas', 'reforestacion', 'quema', 'vertimiento',
      'mineria_ilegal', 'caza_furtiva', 'residuos', 'otro'
    )
  ),
  lat double precision not null,
  lng double precision not null,
  status text not null default 'sin_validar' check (
    status in ('sin_validar', 'confirmado', 'descartado', 'resuelto')
  ),
  reward_status text not null default 'none' check (
    reward_status in ('none', 'rewarded', 'penalized')
  ),
  photo_url text,
  created_at timestamptz not null default now()
);

-- Índices de búsqueda
create index if not exists threats_created_at_idx on public.threats (created_at desc);
create index if not exists threats_lat_lng_idx on public.threats (lat, lng);

-- Políticas RLS para Amenazas
alter table public.threats enable row level security;

drop policy if exists "Cualquier usuario autenticado puede ver las amenazas" on public.threats;
create policy "Cualquier usuario autenticado puede ver las amenazas"
  on public.threats for select
  using (auth.role() = 'authenticated');

drop policy if exists "Cualquier usuario autenticado puede reportar una amenaza" on public.threats;
create policy "Cualquier usuario autenticado puede reportar una amenaza"
  on public.threats for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "Solo quien reporta puede editar su amenaza" on public.threats;
create policy "Solo quien reporta puede editar su amenaza"
  on public.threats for update
  using (auth.uid() = reporter_id);


-- =========================================================
-- 3. ALMACENAMIENTO: Bucket de Fotos para Reportes
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit)
values ('threat-photos', 'threat-photos', true, 5242880)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

drop policy if exists "Usuarios autenticados pueden subir sus fotos de reportes" on storage.objects;
create policy "Usuarios autenticados pueden subir sus fotos de reportes"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'threat-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Usuarios pueden borrar sus fotos de reportes" on storage.objects;
create policy "Usuarios pueden borrar sus fotos de reportes"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'threat-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- =========================================================
-- 4. TABLA: threat_validations (Validaciones Ciudadanas)
-- =========================================================
create table if not exists public.threat_validations (
  id uuid primary key default gen_random_uuid(),
  threat_id uuid not null references public.threats (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  confirms boolean not null,
  created_at timestamptz not null default now(),
  unique (threat_id, user_id)
);

alter table public.threat_validations enable row level security;

drop policy if exists "Cualquier usuario autenticado puede ver validaciones" on public.threat_validations;
create policy "Cualquier usuario autenticado puede ver validaciones"
  on public.threat_validations for select
  using (auth.role() = 'authenticated');

drop policy if exists "Un usuario autenticado puede votar una sola vez por amenaza" on public.threat_validations;
create policy "Un usuario autenticado puede votar una sola vez por amenaza"
  on public.threat_validations for insert
  with check (auth.uid() = user_id);


-- =========================================================
-- 5. VISTA: threats_with_score (Conteo de Votos y Confianza)
-- =========================================================
create or replace view public.threats_with_score as
select
  t.*,
  coalesce(sum(case when v.confirms then 1 else 0 end), 0) as confirmations,
  coalesce(sum(case when v.confirms = false then 1 else 0 end), 0) as dismissals,
  count(v.id) as total_votes
from public.threats t
left join public.threat_validations v on v.threat_id = t.id
group by t.id;


-- =========================================================
-- 6. TABLA: volunteer_calls (Convocatorias de Voluntariado ONG)
-- =========================================================
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

drop policy if exists "Cualquier usuario autenticado puede ver convocatorias" on public.volunteer_calls;
create policy "Cualquier usuario autenticado puede ver convocatorias"
  on public.volunteer_calls for select
  using (auth.role() = 'authenticated');

drop policy if exists "Solo una ONG puede crear convocatorias" on public.volunteer_calls;
create policy "Solo una ONG puede crear convocatorias"
  on public.volunteer_calls for insert
  with check (auth.uid() = ong_id);


-- =========================================================
-- 7. TABLA: educational_guides (Educación Ambiental y Fauna)
-- =========================================================
create table if not exists public.educational_guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  species_name text,
  category text not null check (
    category in (
      'fauna_cuidado', 
      'mamiferos', 
      'aves', 
      'anfibios_reptiles', 
      'flora_nativa', 
      'flora_introducida'
    )
  ),
  description text not null,
  do_rules text[] not null default '{}',
  dont_rules text[] not null default '{}',
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.educational_guides enable row level security;

drop policy if exists "Cualquier usuario autenticado puede ver las guías educativas" on public.educational_guides;
create policy "Cualquier usuario autenticado puede ver las guías educativas"
  on public.educational_guides for select
  using (auth.role() = 'authenticated');