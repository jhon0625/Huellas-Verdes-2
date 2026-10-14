# 🌱 Huellas Verdes

App móvil (React, funciona como web app responsive que se comporta como
app en el celular) + backend en Python (FastAPI) + Supabase (login,
base de datos y seguridad por RLS).

Permite a cualquier persona reportar amenazas ambientales en un mapa
interactivo, y a los vecinos cercanos validar en tiempo real ("yo
también lo veo" / "no lo veo") si el reporte es real, generando un
mapa de confianza comunitaria. También muestra convocatorias de
voluntariado de ONG.

## Estructura del proyecto

```
huellas-verdes/
├── frontend/          React + Vite (la "app móvil")
├── backend/           FastAPI (Python) — lógica de cercanía y agregaciones
├── supabase/
│   └── schema.sql     Tablas, seguridad (RLS) y triggers para Supabase
└── README.md          Este archivo
```

- **Supabase** guarda los usuarios (login), los reportes (`threats`) y
  los votos de validación (`threat_validations`). El frontend habla
  directo con Supabase para login y para leer/escribir datos (protegido
  por Row Level Security).
- **FastAPI** calcula todo lo que Supabase no resuelve con un simple
  query: distancia entre el usuario y cada amenaza (fórmula de
  Haversine), detección de posibles reportes duplicados cercanos,
  convocatorias de voluntariado cercanas y estadísticas agregadas.

---

## 1. Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior (para el frontend)
- [Python](https://www.python.org/) 3.10 o superior (para el backend)
- Una cuenta gratuita en [supabase.com](https://supabase.com/)

## 2. Configurar Supabase (una sola vez)

1. Entra a [supabase.com](https://supabase.com/), crea un proyecto nuevo
   (elige una contraseña de base de datos y guárdala).
2. Ve a **SQL Editor** → **New query**, pega **todo** el contenido de
   `supabase/schema.sql` y dale a **Run**. Esto crea las tablas,
   políticas de seguridad y triggers.
   - Si el proyecto ya estaba creado, ejecuta solo el contenido de
     `supabase/update_threat_categories.sql` para permitir las categorías
     actuales del formulario de reportes.
   - Para habilitar las fotos en un proyecto existente, ejecuta también
     `supabase/enable_threat_photo_storage.sql`. El bucket es público para
     que la URL guardada en cada reporte pueda abrirse.
3. Ve a **Authentication → Providers** y confirma que **Email** esté
   habilitado (viene así por defecto).
   - Opcional para probar más rápido: en **Authentication → Settings**
     puedes desactivar "Confirm email" mientras desarrollas, así el
     registro no exige revisar el correo.
4. Ve a **Project Settings → API** y copia estos 3 valores, los vas a
   necesitar en el paso 3 y 4:
   - `Project URL`
   - `anon public` key
   - `service_role` key (¡secreta! solo va en el backend)

## 3. Levantar el backend (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # En Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Abre .env y pega tu Project URL y tu service_role key de Supabase

uvicorn app.main:app --reload --port 8000
```

Verifica que quedó arriba entrando a `http://localhost:8000/health`
(debe responder `{"status":"ok", ...}`) o a `http://localhost:8000/docs`
para ver la documentación interactiva (Swagger) de todos los endpoints.

## 4. Levantar el frontend (React)

En otra terminal:

```bash
cd frontend
npm install

cp .env.example .env
# Abre .env y pega tu Project URL y tu anon key de Supabase
# (VITE_API_URL puedes dejarlo apuntando a http://localhost:8000)

npm run dev
```

Abre la URL que muestra la terminal (normalmente `http://localhost:5173`).
Como está hecha "mobile-first", ábrela con las herramientas de
desarrollador del navegador en modo dispositivo móvil (o desde el
celular en la misma red usando la IP que muestra Vite) para verla como
app.

## 5. Probar el flujo completo

1. Entra a la app → **Crear cuenta** (elige si eres "ciudadano" u "ONG").
2. Si dejaste activa la confirmación de correo en Supabase, revisa tu
   bandeja y confirma antes de iniciar sesión.
3. Inicia sesión → caerás en el **Mapa**. El navegador pedirá permiso
   de ubicación (acéptalo para ver amenazas cercanas reales).
4. Toca cualquier punto del mapa (o el botón `+`) para reportar una
   amenaza: título, categoría y descripción.
5. Ve a la pestaña **Reportes** para ver el feed y usar los botones
   "Yo también lo veo" / "No lo veo": eso alimenta el puntaje de
   confianza comunitaria que ves en el mapa (punto dorado = confirmado,
   café = sin validar, terracota = descartado).
6. La pestaña **Voluntariados** consulta al backend las convocatorias
   de ONG cercanas a tu ubicación (tabla `volunteer_calls`, vacía por
   defecto — se llena cuando una ONG crea una convocatoria, por
   ejemplo directo desde el SQL Editor de Supabase mientras no exista
   una pantalla de administración para ONG).

## 6. Generar el build de producción del frontend

```bash
cd frontend
npm run build
```

Esto genera `frontend/dist/`, listo para publicarlo en cualquier
hosting estático (Vercel, Netlify, GitHub Pages, etc.). El backend se
despliega aparte (Render, Railway, Fly.io, un VPS, etc.) — solo
recuerda actualizar `VITE_API_URL` en el `.env` de frontend con la URL
pública del backend antes de compilar.

## Notas y próximos pasos sugeridos

- Las **notificaciones push reales** a ciudadanos cercanos ("¿tú
  también ves esto?") necesitan un servicio como Firebase Cloud
  Messaging o OneSignal y guardar el token del dispositivo por
  usuario; aquí se dejó el endpoint `POST /threats/check-duplicates`
  como base para esa lógica (detecta reportes cercanos), pero el envío
  de la notificación en sí queda como siguiente paso.
- Para producción, considera subir fotos de las amenazas a
  **Supabase Storage** y guardar la URL en `threats.photo_url` (la
  columna ya existe en el esquema).
- Si quieres una pantalla para que las ONG creen convocatorias de
   voluntariado desde la app (hoy se hace insertando directo en
   `volunteer_calls` desde Supabase), es la siguiente función natural
   a construir sobre esta base.
