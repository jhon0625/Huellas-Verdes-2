-- =========================================================
-- Expiración automática de reportes mayores a 2 horas
-- =========================================================
-- Ejecutar en Supabase SQL Editor.
--
-- Opción 1: Usar pg_cron (si está habilitado en tu plan)
-- Opción 2: Ejecutar manualmente o con un Edge Function
-- =========================================================

-- Función que borra amenazas con más de 2 horas de antigüedad
create or replace function public.delete_expired_threats()
returns void as $$
begin
  -- Primero borrar las validaciones de amenazas expiradas
  -- (la FK con ON DELETE CASCADE se encarga, pero por claridad)
  delete from public.threats
  where created_at < now() - interval '2 hours';
end;
$$ language plpgsql security definer;

-- Si pg_cron está disponible en tu plan de Supabase,
-- puedes programar la limpieza automática cada 10 minutos:
--
-- select cron.schedule(
--   'limpiar-reportes-expirados',    -- nombre del job
--   '*/10 * * * *',                  -- cada 10 minutos
--   $$ select public.delete_expired_threats(); $$
-- );
--
-- Para verificar que se creó:
-- select * from cron.job;
--
-- Para cancelar:
-- select cron.unschedule('limpiar-reportes-expirados');

-- =========================================================
-- ALTERNATIVA: Si pg_cron NO está disponible, puedes
-- invocar esta función desde un Supabase Edge Function
-- o simplemente confiar en el filtro del frontend
-- (que ya filtra reportes > 2h en las consultas).
-- =========================================================
