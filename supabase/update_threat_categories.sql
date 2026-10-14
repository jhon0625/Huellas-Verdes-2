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