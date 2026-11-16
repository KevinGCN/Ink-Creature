# Prueba E2E: tatuador, cliente, cita y cancelación

## Alcance

Prueba funcional completa en local (`http://localhost:4200`) con backend de Render:

1. Crear una imagen de tatuador (diseño local; la IA no tenía saldo).
2. Alta de un tatuador con foto desde el panel de admin.
3. Alta de un cliente nuevo desde el registro público.
4. El cliente ve el perfil del tatuador y reserva una cita.
5. El cliente cancela la cita escribiendo el motivo.
6. El tatuador confirma la cancelación desde su agenda.
7. El cliente ve "Cancelación confirmada por el tatuador".
8. El admin elimina la foto de la galería.
9. Recorrido de todas las rutas y de los tres inicios de sesión (admin, empleado, cliente).
10. Usabilidad: X del login en `/loggin` y en el modal; sidebar detrás del login; iconos más chicos; login móvil más chico; barra de carga tras cada interacción.

No incluye: borrar cuentas de prueba existentes.

## Requisitos

- [x] El cliente puede escribir el motivo al cancelar.
- [x] La cita cancelada muestra el motivo.
- [x] El tatuador ve las citas asignadas a él y puede confirmar la cancelación.
- [x] El cliente ve "Cancelación confirmada por el tatuador".
- [x] El admin puede subir y eliminar una foto de la galería.
- [x] Las tres cuentas inician sesión y llegan a su inicio.
- [x] La X del login cierra en `/loggin` (navega a `volver` o `/`) y en el modal (emite `cerrar`).
- [x] Sidebar debajo del login (`.main-navbar` z-index 900; overlay 1999; panel 2000).
- [x] Iconos más chicos (22 px escritorio, 19 px móvil; toggle 16 px móvil).
- [x] Login móvil más compacto (panel 338×501, padding 18 px, controles 42 px).
- [x] Barra de carga global tras cada interacción (peticiones + navegación SPA).
- [x] Tatuadores aparecen antes que horarios en Citas, con aviso de carga y Reintentar.
- [x] Caché del catálogo de empleados (shareReplay + timeout 2500), se invalida al crear/editar/eliminar.

## Evidencias (verificadas en local)

- Alta de tatuador "Tatuador E2E" con foto: lista pasó a 10 tarjetas, el nuevo aparece. `/tmp/opencode/shots/e2e-alta-tatuador-form.png`
- Registro cliente `cliente.e2e.20261112@example.com` / `ClienteE2E2026!`: sesión iniciada, rol `cliente`.
- Perfil tatuador `/employeeCV/13`: foto cargada, especialidad Realismo. `/tmp/opencode/shots/e2e-perfil-tatuador.png`
- Reserva de cita: 13/11/2026 10:00 AM con Tatuador E2E. `/tmp/opencode/shots/e2e-cita-creada.png`
- Cancelación con motivo: "Cancelada por el cliente: Me surgió un viaje familiar".
- Tatuador confirma cancelación en `/schedule` (botón "Confirmar cancelación").
- Cliente ve "✓ Cancelación confirmada por el tatuador" en `/profile`. `/tmp/opencode/shots/e2e-cliente-ve-confirmacion.png`
- Admin elimina foto de galería: de 11 imágenes a 10, la del tatuador E2E desaparece. `/tmp/opencode/shots/e2e-galeria-eliminada.png`
- Barra de carga visible en login, navegación SPA y peticiones HTTP.

## Tareas pendientes

- [ ] Corrige `cerrarModal()` en `loggin.ts` (hecho, sin push).
- [ ] Barra de carga global `LoadingService` + interceptor + `LoadingBar` (hecho, sin push).
- [ ] Build de producción: OK.
- [ ] axe: no disponible vía `agent-browser`; revisado manualmente sin errores nuevos.
- [ ] Commit de los cambios pendientes (espera confirmación del usuario).
- [ ] Push: bloqueado por configuración; el usuario debe ejecutarlo.

## Estado

Completado y verificado. Pendiente: confirmación del usuario para commit y push.
