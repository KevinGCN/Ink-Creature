# Deploy de prueba en Render

## Alcance

- Probar el backend de la rama `dev-emerson` desplegado en Render.
- Conectar el frontend a ese backend.
- Migrar al backend los datos que vivían en el frontend: tatuadores,
  fotos de perfil, galería y horarios.
- Probar todo desde el navegador, sin tocar `main`.

No incluye:
- Subir nada a `main`.
- Crear un módulo de reseñas en el backend.
- Cambiar el esquema de la base de datos.

## Decisiones

- Sin columnas nuevas: `cargo` se muestra como "Tatuador", la experiencia se
  calcula desde `fecha_contratacion` y se quitaron las estrellas de la vista.
- Kevin Cobo (`kgcobo@gmail.com`) y Emerson Mosquera (`emerson.prueba@gmail.com`)
  ya existían: se reutilizaron sus fichas y solo se les agregaron horarios.
- Se crearon 6 tatuadores nuevos (Emilia, Gabe, Juan David, Valentina,
  Sebastián y Leonardo) y Andrés Patiño (`jpatino@gmail.com`).
- Las cuentas de prueba creadas usan la contraseña `12345678`.
- `assets/empleados.json` y `assets/usuarios.json` se conservan por pedido del
  usuario. `usuarios.json` (100 usuarios demo) no se migró.

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
- [x] Galería contra `/galeria` (lectura, subida y borrado).
- [x] Empleados contra `/empleados` (lectura, alta, edición y borrado).
- [x] CV del tatuador contra `/empleados/:id`.
- [x] Horarios contra `/horarios-trabajador`.
- [x] IA contra `/ia/analyze-tattoo`.
- [x] Usuarios contra `/usuarios`.
- [x] Quitar la clave de Gemini del frontend.
- [x] Build del frontend sin errores.
- [ ] `GEMINI_API_KEY` configurada en Render.
- [x] Citas contra `/citas`.
- [x] Edición de perfil y foto contra `/usuarios`.
- [ ] Deploy del frontend en Netlify.
- [ ] Agregar la URL del frontend a `FRONTEND_URL` en Render.

## Tareas

- [x] Respaldar y actualizar el backend a `main`.
- [x] Verificar build y rutas locales.
- [x] Push de `dev-emerson` y deploy en Render.
- [x] Endpoint `/auth/google` y redeploy.
- [x] Login dual en el frontend.
- [x] Servicios públicos conectados.
- [x] Migrar tatuadores, fotos, galería y horarios a la base.
- [x] Conectar Employees, CV, galería y calendario al backend.
- [x] Probar login desde el navegador desplegado.
- [x] Conectar citas y perfil.
- [ ] Desplegar frontend.

## Estado

Datos migrados y frontend conectado. Bloqueado por `GEMINI_API_KEY` en Render,
por el deploy del frontend y por la migración de citas.

## Evidencias

- Render: `200 /empleados`, `404 /api/empleados`.
- Render: `400 POST /auth/google {}`, `401` con token falso.
- Render: `200 POST /auth/login` con `emerson.prueba@gmail.com`.
- Render: `200 GET /galeria`.
- Render: `503 POST /ia/analyze-tattoo` → falta `GEMINI_API_KEY`.
- Base: `usuarios=15`, `empleados=9`, `imagenes=16`, `galeria=10`,
  `horarios_trabajador=21`.
- `/empleados` devuelve los 9 tatuadores activos con especialidad, biografía,
  foto y fecha de contratación.
- `/horarios-trabajador` devuelve 21 franjas (3 empleados × 7 días).
- `/galeria` devuelve 10 filas; las 7 nuevas apuntan a `/imagenes/15..21`.
- Login de `jpatino@gmail.com` / `12345678`: `201` con JWT (hash scrypt correcto).
- E2E contra Render: crear usuario, subir foto, crear ficha, editar usuario y
  ficha, subir imagen de galería, crear fila, borrar fila, ficha y usuario.
  Todo en `200/201`; limpieza sin residuos.
- Capturas reales con Firefox headless:
  - `/tmp/opencode/employees-ok.png` (9 tarjetas).
  - `/tmp/opencode/gallery-ok.png` (10 imágenes).
  - `/tmp/opencode/cv-ok.png` (perfil de Emilia Soplano).
- Frontend: `npm run build` OK (bundle 604.51 kB).
- Citas y perfil: build OK, 11 pruebas OK y E2E contra Render OK
  (crear, listar, 409 duplicado, editar, borrar cita; editar perfil y foto).

## Pendiente

- Configurar `GEMINI_API_KEY` en Render.
- Publicar la rama del frontend y agregar la URL de Netlify a `FRONTEND_URL`.
- Arreglar los specs viejos que no declaran proveedores de `Auth`,
  `HttpClient` o `Router`.
