# Menú lateral, botón Premium y revisión de botones/tipografía

## Alcance

Incluye:

- Ocultar el botón "Inicia Sesión para Premium" cuando no hay sesión.
- Mostrar "Obten una Cotización con IA" solo con sesión iniciada.
- Menú lateral completamente oculto al cerrarse (sin franja de iconos): solo
  queda el botón ☰ en la barra superior y el contenido ocupa todo el ancho.
- Al abrir, el menú empuja el contenido para que no lo tape.
- Reducción de tamaños de botones, incluidos los de cotización.
- Ajuste de tipografía de botones y títulos a la escala del sitio.

No incluye:

- Cambios de backend.
- Rediseño de la paleta ni de la estructura general.
- Cambios de lógica de autenticación.

## Requisitos

- [x] Sin sesión, en el inicio solo aparece "Obten una Cotización Rápida".
- [x] Con sesión, aparece también "Obten una Cotización con IA".
- [x] Cerrado, el menú no muestra iconos ni ocupa ancho; solo queda ☰.
- [x] Abierto, el botón cambia a ✕ y el contenido se reacomoda.
- [x] En móvil no hay desbordes horizontales con el menú abierto o cerrado.
- [x] Los botones de acción usan alturas más compactas.
- [x] Los botones de cotización son más chicos.

## Tareas

- [x] Condicionar el botón Premium al estado de sesión.
- [x] Ocultar por completo el sidebar cerrado y liberar su columna.
- [x] Mover el botón ☰/✕ a la barra superior.
- [x] Reacomodar la grilla del layout al abrir/cerrar.
- [x] Reducir alturas y tamaños de letra de botones.
- [x] Resolver el merge de `origin/dev-emerson` en `dev-emerson`.
- [x] Compilar y revisar el resultado.

## Estado

Terminado en local. Pendiente de commit/push en `integracion-frontend`.

## Evidencias

### Compilación

- `npx ng build --configuration production` → OK.
  - Solo avisos de presupuesto de CSS/bundle (preexistentes).

### Capturas (Firefox headless)

- Escritorio cerrado: sin franja lateral; contenido a todo el ancho; ☰ arriba.
- Escritorio abierto: ✕, lateral de 148 px y contenido reacomodado.
- Móvil cerrado: contenido completo y botones del banner a una línea.
- Móvil abierto: lateral de 140 px sin desbordes.
- Inicio sin sesión: un solo botón de cotización, más compacto.

### Merge

- Merge de `origin/dev-emerson` resuelto y comprometido en `dev-emerson`
  (`03df34d`), conservando el rediseño de galería y los toasts/modal entrantes,
  y los mensajes detallados de login del lado local.

## Pendiente

- Verificación visual del botón "Obten una Cotización con IA" con una sesión
  real.
- Commit y push de este cambio en `integracion-frontend` (lo ejecuta el usuario).
