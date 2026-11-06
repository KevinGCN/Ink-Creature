# Deploy de prueba en Render

## Alcance

- Probar el backend de la rama `dev-emerson` desplegado en Render.
- Conectar el frontend a ese backend.
- Probar todo desde el navegador, sin tocar `main`.

No incluye:
- Subir nada a `main`.
- Crear un módulo de reseñas en el backend.

## Requisitos

- [x] Backend compila en local.
- [x] Rama `dev-emerson` subida a GitHub.
- [x] Render sirve `/empleados` con el código nuevo.
- [x] `POST /auth/login` devuelve JWT.
- [x] `POST /auth/google` existe y verifica el token de Firebase.
- [x] `environment.apiUrl` sin `/api`.
- [x] Rutas centralizadas en `src/app/core/api.routes.ts`.
- [x] Login por correo contra el backend.
- [x] Login con Google contra `/auth/google`.
- [x] Interceptor que agrega `Authorization: Bearer`.
- [x] Galería contra `/galeria`.
- [x] Empleados contra `/empleados`.
- [x] IA contra `/ia/analyze-tattoo`.
- [x] Usuarios contra `/usuarios`.
- [x] Quitar la clave de Gemini del frontend.
- [x] Build del frontend sin errores.
- [ ] `GEMINI_API_KEY` configurada en Render.
- [ ] Citas contra `/citas`.
- [ ] Borrar `assets/empleados.json` y `assets/usuarios.json` (contraseñas en texto plano).
- [ ] Deploy del frontend en Netlify.
- [ ] Agregar la URL del frontend a `FRONTEND_URL` en Render.

## Tareas

- [x] Respaldar y actualizar el backend a `main`.
- [x] Verificar build y rutas locales.
- [x] Push de `dev-emerson` y deploy en Render.
- [x] Endpoint `/auth/google` y redeploy.
- [x] Login dual en el frontend.
- [x] Servicios públicos conectados.
- [ ] Probar login desde el navegador.
- [ ] Conectar citas.
- [ ] Desplegar frontend.

## Estado

En curso. Bloqueado por `GEMINI_API_KEY` en Render y por la migración de citas.

## Evidencias

- Backend local: `200 /empleados`, `404 /api/empleados`.
- Render: `200 /empleados`, `404 /api/empleados`.
- Render: `400 POST /auth/google {}`, `401` con token falso.
- Render: `200 POST /auth/login` con `emerson.prueba@gmail.com`.
- Render: `200 GET /galeria`.
- Render: `503 POST /ia/analyze-tattoo` → falta `GEMINI_API_KEY`.
- Frontend: `npm run build` OK (bundle 589 kB, antes 880 kB).

## Pendiente

- Configurar `GEMINI_API_KEY` en Render.
- Migrar `CitaService` a `/citas` (requiere convertir fecha `dd/mm/yyyy` a ISO y hora 12h a 24h).
- Borrar los JSON con contraseñas del bundle.
- Probar login por correo y con Google en el navegador.
- Publicar la rama del frontend y ajustar CORS.
