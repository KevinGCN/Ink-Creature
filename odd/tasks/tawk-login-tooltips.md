# Tawk, datos de prueba, modal de login y tooltips

## Alcance

Incluye:

- Quitar Tawk.to de todo el proyecto (script de `index.html`, servicio, botón flotante y estilos).
- Borrar los JSON de datos falsos con correos y contraseñas.
- Corregir el modal de login cuando la ventana se parte a la mitad.
- Etiqueta flotante junto al cursor al pasar sobre botones, enlaces e iconos.
- Crear cuentas de prueba (admin, tatuador, cliente) y probarlas contra el backend desplegado.

No incluye: cambios en el backend, en la base de datos ni en la configuración de Render.

## Requisitos

- [x] No queda ninguna referencia a Tawk en el código (`src`, `public`).
- [x] `src/assets/usuarios.json` y `src/assets/empleados.json` eliminados.
- [x] El modal de login queda centrado y completo entre 360 px y 768 px.
- [x] El modal no desborda a 360 px de ancho (antes medía 383 px).
- [x] El modal entra en pantallas bajas (683×420) con scroll interno.
- [x] Al pasar el mouse por un botón/enlace aparece una etiqueta pequeña junto al cursor.
- [x] La etiqueta se voltea si no cabe en el borde derecho/inferior.
- [x] axe sin violaciones en home y login (1280, 683 y 360).
- [x] Las cuentas admin, tatuador y cliente inician sesión y reciben su rol.

## Tareas

- [x] Eliminar el bloque `<script>` de Tawk en `src/index.html`.
- [x] Eliminar `TawkService` de `app.ts` y `lobby.ts`; borrar `tawk.ts` y `tawk.spec.ts`.
- [x] Quitar el botón `.chat-float` y sus estilos.
- [x] Actualizar el comentario de `public/_headers`.
- [x] Borrar los dos JSON de datos falsos.
- [x] Arreglar el `@media (max-width: 768px)` del login (centrado sin `transform`).
- [x] Añadir `box-sizing: border-box` y `max-height: 94vh` al panel.
- [x] Crear `TooltipDirective` y registrarla en `App`.
- [x] Añadir estilos globales `.cursor-tooltip`.
- [x] `aria-label="Cerrar"` al botón ✕ del modal.
- [x] Crear y promover las cuentas de prueba.

## Estado

Terminado y verificado en local. Pendiente de push y de deploy en Render.

## Evidencias

### Modal de login

Causa: la animación `slideIn` estaba declarada dos veces; Angular renombró la
del ámbito del componente y la del `@media` quedó sin usar, así que el
`transform: translate(50%, -50%)` del centrado se perdía al terminar la
animación.

Medidas con la corrección aplicada (`getBoundingClientRect`):

| Vista | Panel (left→right) | Centrado | Desborde |
| --- | --- | --- | --- |
| 1280×800 | 900→1280 | panel lateral (diseño) | no |
| 683×800 | 152→532 | sí | no |
| 360×800 | 14→346 | sí | no |
| 683×420 | 13→407 (alto) | sí | scroll interno |

Antes de la corrección, a 683 px el panel medía `left: -91, right: 342`.

Flujo real (botón “Sesión” de la barra) a 683 px: `left 152, right 532`,
`scrollWidth 683`.

### Tooltips

- Icono Galería: texto `Galería`, posición `(434, 278)` para cursor en `(420, 260)`.
- Cursor en `(1265, 780)`: se voltea a `left 1192, right 1251`, `top 738, bottom 766` (dentro de 1280×800).
- Botón “Obten una Cotización Rapida”: toma el texto visible.
- `pointerout`: la etiqueta vuelve a `visible: false`.

### Accesibilidad

`agent-browser a11y` (axe): 0 violaciones en `/` (1280 y 360) y en `/loggin` (683).

### Cuentas de prueba (backend desplegado)

| Cuenta | Rol | id |
| --- | --- | --- |
| `prueba.admin.20261112@example.com` | admin | 38 |
| `prueba.tatuador.20261112@example.com` | empleado | 39 |
| `prueba.cliente.20261112@example.com` | cliente | 40 |

- `POST /usuarios` → 201 para las tres (entran como `cliente`).
- `PATCH /usuarios/38/rol` y `/39/rol` con token admin → 200.
- `POST /auth/login` + `GET /auth/me` devuelven el rol correcto en las tres.
- Login desde la interfaz en `localhost:4200`: las tres quedan con
  `logueado=true`, token y rol correcto en `localStorage`.
- Rutas probadas con cliente y admin: `/schedule`, `/profile`, `/employees`,
  `/employeeCV/1`, `/gemini-ia` cargan sin redirección.
- `/employees` con admin muestra 18 botones en `.admin-btns`; el cliente no los ve.

## Pendiente

- Push a `integracion-frontend` (lo hace el usuario: `git push` está bloqueado por política local).
- Revisar en Render tras el deploy: el sitio sigue sirviendo desde `dev-integracion-frontend`.
- Probar el login en la URL de Render cuando el backend permita su origen (`FRONTEND_URL`).
