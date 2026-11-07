# Citas y perfil contra el backend

## Alcance

- Migrar `CitaService` de `localStorage` a `/citas`.
- Conectar la agenda (`/schedule`) y “Mis citas” (`/profile`) a la API.
- Conectar la edición de perfil y la foto a `PATCH /usuarios/:id` y
  `POST /usuarios/:id/foto`.

No incluye:
- Cambiar el esquema de la base.
- Cambiar las reglas de negocio de citas del backend.
- Rediseñar la interfaz.

## Requisitos

- [x] Crear cita con `usuario_id`, `empleado_id`, fecha ISO y horas 24h.
- [x] Editar una cita existente.
- [x] Listar solo las citas del usuario logueado.
- [x] Eliminar una cita.
- [x] Mostrar errores reales: 401, 403, 409 (horario ocupado).
- [x] Guardar nombre, apellido, email y teléfono en el backend.
- [x] Subir la foto de perfil al backend.
- [x] Refrescar el usuario en `localStorage` después de guardar.
- [x] Build sin errores.

## Tareas

- [x] Leer el contrato de `/citas` y `/usuarios`.
- [x] Reescribir `CitaService` con `HttpClient`.
- [x] Adaptar `models/cita.ts`.
- [x] Adaptar `schedule.ts` (crear/editar/listar).
- [x] Adaptar `profile.ts` (listar/eliminar/editar/foto).
- [x] Añadir formulario de edición en `profile.html`.
- [x] Añadir `actualizarPerfil` y `subirFotoPerfil` a `AuthService`.
- [x] Actualizar pruebas de citas, agenda, perfil y auth.
- [x] Verificar con API real y capturas.

## Decisiones

- La duración de una cita nueva es de 30 minutos (`hora_fin = hora_inicio + 30`).
- La agenda sigue mostrando horas de 12h y fechas `dd/mm/yyyy`; el servicio
  traduce a `YYYY-MM-DD` y `HH:mm` al hablar con el backend.
- El tatuador se selecciona por `empleado.id`; el nombre completo se usa solo
  para mostrar, así se evita confundir artistas con el mismo nombre.
- Los duplicados ya no se detectan en el navegador: se deja que el índice
  único del backend responda `409`.
- El formulario de perfil no permite cambiar contraseña ni rol.

## Estado

Implementado y verificado en local contra el backend de Render. Falta commit,
push y deploy del frontend.

## Evidencias

- `npm run build`: OK, bundle `604.51 kB` (advertencia de presupuesto de 500 kB,
  no error). `profile.css` queda 325 bytes sobre el presupuesto de advertencia.
- Pruebas de citas, auth, agenda y perfil: `4 archivos`, `11 pruebas`, todas OK.
- E2E contra Render con usuario temporal y limpieza:
  - alta de usuario y login,
  - `PATCH /usuarios/:id` (nombre y teléfono),
  - `POST /usuarios/:id/foto` (PNG),
  - `POST /citas` (201),
  - `GET /citas?usuario_id=` (aparece la cita),
  - mismo hueco repetido (409),
  - `PATCH /citas/:id` (200),
  - `DELETE /citas/:id` (200),
  - `DELETE /usuarios/:id` como admin (200).
- Capturas locales con Firefox headless:
  - `/tmp/opencode/profile-ok.png` (perfil con teléfono y botón editar).
  - `/tmp/opencode/profile-edit-ok.png` (formulario de edición).
  - `/tmp/opencode/schedule-ok.png` (agenda con los 9 tatuadores).
- `ng test` ahora arranca: se completó `angular.json` (`buildTarget`,
  `tsConfig`, `runner`) y se agregó `src/polyfills.ts` a `tsconfig.spec.json`.
- La suite completa sigue con fallos previos en specs de componentes que no
  declaran proveedores de `Auth`, `HttpClient` o `Router`; no son de citas ni
  de perfil.

## Pendiente

- Commit y push de la rama `integracion-frontend`.
- Deploy del frontend y prueba del flujo real en Netlify.
- Arreglar los specs viejos que aún no declaran proveedores.
- `GEMINI_API_KEY` sigue pendiente en Render (no afecta citas ni perfil).
