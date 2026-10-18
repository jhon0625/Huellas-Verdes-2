-- =========================================================
-- HUELLAS VERDES - Sistema de Incentivos (Huellas)
-- =========================================================
-- Reglas:
-- 1. Cuando un reporte llega a 3 o más confirmaciones ("lo veo"),
--    el creador del reporte recibe +1000 huellas.
-- 2. Cuando un reporte llega a 3 o más descartes ("no lo veo"),
--    se le restan 1000 huellas al creador del reporte (mínimo 0).
-- 3. Si no alcanza 3 verificaciones, no se modifica el saldo.
-- 4. El saldo de huellas nunca puede ser negativo (mínimo 0).
-- 5. Las huellas quedan registradas de forma fija en su perfil.
-- =========================================================

-- 1. Agregar columna de huellas a la tabla profiles
alter table public.profiles
  add column if not exists huellas integer not null default 0 check (huellas >= 0);

-- 2. Agregar columna para rastrear el estado de la recompensa en threats
-- Evita duplicar recompensas o penalizaciones si entran más de 3 votos.
alter table public.threats
  add column if not exists reward_status text not null default 'none'
  check (reward_status in ('none', 'rewarded', 'penalized'));

-- 3. Función SECURITY DEFINER para procesar recompensas/penalizaciones
-- Se ejecuta con permisos elevados para actualizar profiles sin ser bloqueada por RLS.
create or replace function public.process_threat_validation_rewards(target_threat_id uuid)
returns void as $$
declare
  v_reporter_id uuid;
  v_reward_status text;
  v_confirms integer;
  v_dismissals integer;
begin
  -- Obtener información del reporte
  select reporter_id, coalesce(reward_status, 'none')
  into v_reporter_id, v_reward_status
  from public.threats
  where id = target_threat_id;

  if v_reporter_id is null then
    return;
  end if;

  -- Contar votos confirmados y descartados
  select
    coalesce(count(*) filter (where confirms = true), 0),
    coalesce(count(*) filter (where confirms = false), 0)
  into v_confirms, v_dismissals
  from public.threat_validations
  where threat_id = target_threat_id;

  -- REGLA 1: Llega a 3 o más confirmaciones -> +1000 huellas al creador
  if v_confirms >= 3 and v_reward_status != 'rewarded' then
    update public.profiles
    set huellas = huellas + 1000
    where id = v_reporter_id;

    update public.threats
    set reward_status = 'rewarded',
        status = 'confirmado'
    where id = target_threat_id;

  -- REGLA 2: Llega a 3 o más descartes -> -1000 huellas (mínimo 0)
  elsif v_dismissals >= 3 and v_reward_status != 'penalized' then
    update public.profiles
    set huellas = greatest(0, huellas - 1000)
    where id = v_reporter_id;

    update public.threats
    set reward_status = 'penalized',
        status = 'descartado'
    where id = target_threat_id;
  end if;
end;
$$ language plpgsql security definer;

-- 4. Trigger en threat_validations para ejecutar la función automáticamente tras cada voto
create or replace function public.on_threat_validation_reward_trigger()
returns trigger as $$
begin
  perform public.process_threat_validation_rewards(new.threat_id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_threat_validation_rewards on public.threat_validations;
create trigger trg_threat_validation_rewards
  after insert or update on public.threat_validations
  for each row
  execute procedure public.on_threat_validation_reward_trigger();
