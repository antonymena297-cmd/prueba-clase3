-- ============================================================
-- Esquema de Supabase para la Prueba de Excel — Clase 3
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Tabla principal de intentos
create table if not exists public.intentos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  ip text not null,
  fecha timestamptz not null default now(),
  respuestas jsonb not null,            -- { "q1": 1, "q2": 0, ... } (índice de opción elegida)
  puntaje_auto integer not null,        -- sobre 80
  puntaje_manual integer,               -- sobre 20, lo llena el profesor (null = pendiente)
  comentario_estudiante text,
  archivo_url text,                     -- link público al .xlsx subido
  archivo_nombre text,
  completado boolean not null default true
);

-- Un solo intento por IP (ajustá esto si varios estudiantes comparten red/IP pública)
create unique index if not exists intentos_ip_unique on public.intentos (ip);

alter table public.intentos enable row level security;

-- Cualquiera (incluso sin iniciar sesión) puede INSERTAR su propio intento una vez
create policy "insertar intento publico"
  on public.intentos for insert
  to anon
  with check (true);

-- Solo usuarios autenticados (el profesor) pueden LEER todos los intentos
create policy "leer intentos solo autenticado"
  on public.intentos for select
  to authenticated
  using (true);

-- Solo usuarios autenticados (el profesor) pueden ACTUALIZAR (poner la nota manual)
create policy "actualizar nota manual solo autenticado"
  on public.intentos for update
  to authenticated
  using (true)
  with check (true);

-- Nadie puede leer intentos como anónimo — así un estudiante no puede ver si una IP
-- ya está usada consultando la tabla directo; el sitio valida el intento al insertar.


-- ============================================================
-- 2) Storage: bucket para los archivos .xlsx que suben los estudiantes
-- ============================================================
-- Hacé esto desde la interfaz: Supabase → Storage → New bucket
--   Nombre: entregas
--   Public: ON  (para que el profesor pueda abrir el link directo del archivo)
--
-- Después corré esto para permitir que cualquiera SUBA archivos a ese bucket:

create policy "subir entregas publico"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'entregas');

create policy "leer entregas publico"
  on storage.objects for select
  to anon
  using (bucket_id = 'entregas');


-- ============================================================
-- 3) Usuario docente (super usuario)
-- ============================================================
-- No se crea por SQL: andá a Supabase → Authentication → Users → Add user
--   Correo: el que vos quieras usar para entrar al panel
--   Contraseña: la que vos definas
-- Ese correo y contraseña son los que usás en la pantalla "Acceso docente" del sitio.
-- El nombre "Anthony Mena" que aparece en el panel es solo visual (config.js),
-- la seguridad real la da este login de Supabase Auth.
