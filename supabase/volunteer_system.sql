-- ============================================================
-- Huellas Verdes — Sistema de Voluntariados
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================================

-- Asegurar que la columna huellas exista en profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS huellas integer NOT NULL DEFAULT 0 CHECK (huellas >= 0);

-- ── 1. Tabla de eventos de voluntariado ────────────────────
CREATE TABLE IF NOT EXISTS public.volunteer_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ong_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title            text NOT NULL,
  description      text,
  location_name    text,
  lat              double precision,
  lng              double precision,
  event_date       timestamptz NOT NULL,
  max_volunteers   int,                    -- NULL = sin límite
  huellas_reward   int NOT NULL DEFAULT 5000,
  checkin_code     text NOT NULL,          -- 6 caracteres alfanuméricos
  code_active      boolean NOT NULL DEFAULT false,
  status           text NOT NULL DEFAULT 'open'
                   CHECK (status IN ('draft','open','closed','done')),
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.volunteer_events ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede crear y gestionar sus propios eventos
CREATE POLICY "users_manage_own_events"
  ON public.volunteer_events
  FOR ALL
  USING (ong_id = auth.uid())
  WITH CHECK (ong_id = auth.uid());

-- Todos los usuarios autenticados pueden leer eventos abiertos
CREATE POLICY "authenticated_read_events"
  ON public.volunteer_events
  FOR SELECT
  TO authenticated
  USING (status IN ('open','closed','done'));


-- ── 2. Tabla de inscripciones (prelista + asistencia) ──────
CREATE TABLE IF NOT EXISTS public.volunteer_registrations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        uuid NOT NULL REFERENCES public.volunteer_events(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registered_at   timestamptz NOT NULL DEFAULT now(),
  attended        boolean NOT NULL DEFAULT false,
  attended_at     timestamptz,
  UNIQUE (event_id, user_id)
);

ALTER TABLE public.volunteer_registrations ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden inscribirse / ver sus propias inscripciones
CREATE POLICY "users_own_registrations"
  ON public.volunteer_registrations
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ONGs pueden ver la prelista de sus eventos
CREATE POLICY "ong_read_their_event_registrations"
  ON public.volunteer_registrations
  FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM public.volunteer_events WHERE ong_id = auth.uid()
    )
  );

-- Lectura agregada (recuento de inscritos) para todos
CREATE POLICY "read_registrations_count"
  ON public.volunteer_registrations
  FOR SELECT
  TO authenticated
  USING (true);


-- ── 3. Función RPC: verificar check-in con código ──────────
CREATE OR REPLACE FUNCTION public.verify_volunteer_checkin(
  p_event_id    uuid,
  p_code        text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id      uuid := auth.uid();
  v_event        record;
  v_registration record;
  v_reward       int;
BEGIN
  -- Validar que el usuario esté autenticado
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'No autenticado');
  END IF;

  -- Buscar el evento
  SELECT * INTO v_event
  FROM public.volunteer_events
  WHERE id = p_event_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Evento no encontrado');
  END IF;

  -- Verificar que el código sea correcto y esté activo
  IF v_event.checkin_code != upper(p_code) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Código incorrecto');
  END IF;

  IF NOT v_event.code_active THEN
    RETURN jsonb_build_object('ok', false, 'error', 'El código no está activo todavía');
  END IF;

  -- Verificar que el usuario esté inscrito
  SELECT * INTO v_registration
  FROM public.volunteer_registrations
  WHERE event_id = p_event_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'No estás inscrito en este evento');
  END IF;

  -- Verificar que no haya asistido ya
  IF v_registration.attended THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Ya registraste tu asistencia');
  END IF;

  -- Marcar asistencia
  UPDATE public.volunteer_registrations
  SET attended = true, attended_at = now()
  WHERE event_id = p_event_id AND user_id = v_user_id;

  -- Otorgar huellas
  v_reward := v_event.huellas_reward;
  UPDATE public.profiles
  SET huellas = huellas + v_reward
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'huellas_earned', v_reward,
    'event_title', v_event.title
  );
END;
$$;

-- Permitir que usuarios autenticados llamen a la función
GRANT EXECUTE ON FUNCTION public.verify_volunteer_checkin(uuid, text) TO authenticated;


-- ── 4. Función RPC: activar/desactivar código de check-in ──
CREATE OR REPLACE FUNCTION public.toggle_checkin_code(
  p_event_id  uuid,
  p_active    boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  UPDATE public.volunteer_events
  SET code_active = p_active
  WHERE id = p_event_id AND ong_id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Evento no encontrado o sin permisos');
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_checkin_code(uuid, boolean) TO authenticated;
