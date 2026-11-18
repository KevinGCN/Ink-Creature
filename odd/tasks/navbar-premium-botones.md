# Menú lateral, botón Premium y revisión de botones/tipografía

## Alcance

Incluye:

- Ocultar el botón "Inicia Sesión para Premium" cuando no hay sesión.
- Mostrar "Obten una Cotización con IA" solo con sesión iniciada.
- Menú lateral: abrir/cerrar con icono ☰/✕ y que el contenido se reacomode
  (sin que el panel se monte encima del contenido).
- Revisión de tamaños de botones y tipografía en las pantallas existentes.

No incluye:

- Cambios de backend.
- Rediseño de la paleta ni de la estructura general.
- Cambios de lógica de autenticación.

## Requisitos

- [x] Sin sesión, en el inicio solo aparece "Obten una Cotización Rapida".
- [x] Con sesión, aparece también "Obten una Cotización con IA".
- [x] El botón de menú muestra ☰ cerrado y ✕ abierto.
- [x] Al abrir el menú, el contenido se desplaza y conserva su ancho útil.
- [x] En móvil no hay desbordes horizontales con el menú abierto o cerrado.
- [x] Los botones de acción usan la escala común de alturas.
- [x] Los textos de botones no bajan de 12 px y usan los tokens del sitio.

## Tareas

- [x] Condicionar el botón Premium al estado de sesión.
- [x] Compartir el estado del menú entre `MainNavbar` y `App`.
- [x] Reacomodar la grilla del layout al abrir/cerrar.
- [x] Normalizar alturas y tamaños de letra de botones.
- [x] Compilar y revisar el resultado.

## Estado

Terminado en local. Pendiente de commit/push por el usuario.

## Evidencias

### Compilación

- `npx ng build --configuration production` → OK.
  - Solo avisos de presupuesto de CSS/bundle (preexistentes).

### Pruebas automáticas

- `npx ng test --watch=false` → 18 pasan, 20 fallan.
  - Los fallos son los mismos del setup previo: faltan providers de `Auth`
    (Firebase) y `HttpClient` en varios specs. No hay fallos nuevos ligados a
    este cambio.

### Capturas (Firefox headless, 1280×900 y 360×740)

- Escritorio cerrado: ☰ visible arriba a la izquierda y un solo botón de IA
  ("Obten una Cotización Rápida").
- Escritorio abierto: ✕ en lugar de ☰, lateral de 148 px y contenido
  reacomodado.
- Móvil cerrado (360 px): layout de 56 px, sin desborde.
- Móvil abierto: lateral de 140 px, contenido reacomodado, título del banner
  sin recortes y botones a una línea.

## Pendiente

- Verificación visual del botón "Obten una Cotización con IA" con una sesión
  real (se validó la condición `isLoggedIn$`, no un login real).
- Commit y push en `integracion-frontend` (lo ejecuta el usuario).
