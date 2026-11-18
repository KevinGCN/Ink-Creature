# Usabilidad, rutas protegidas y escala tipográfica

## Alcance

Incluye:

- Mensajes claros de login: credenciales incorrectas, sin conexión y servidor caído.
- Aviso cuando el servidor tarda más de 6 s (plan gratuito de Render despertando).
- Volver a la página protegida después de iniciar sesión (`?volver=`).
- Aviso contextual al intentar agendar, ver el perfil o usar la IA sin sesión.
- Estados de carga, error y vacío con botón **Reintentar** en Galería y Tatuadores.
- Página **Ajustes** con datos de cuenta, cierre de sesión y eliminación de cuenta.
- Menú superior: **Ajustes** y **Cerrar sesión** (antes solo Perfil y Cerrar sesión).
- Escala tipográfica y de controles común para todas las pantallas.
- Corrección del modal de login: botón principal real y tamaños de 16 px en inputs.
- Interfaz móvil más compacta (≤600 px): lateral de 56 px, textos 15 px, controles 42 px.
- Los botones de cotización con IA quedan **detrás** del modal de login (z-index 900).
- La cotización con IA sin sesión ahora lleva a `/loggin?volver=/gemini-ia`.

No incluye:

- Cambios en el backend.
- Borrado real de cuentas durante las pruebas.
- Cambios de color de marca (se conservaron las paletas existentes).

## Requisitos

- [x] Con contraseña incorrecta se muestra "Correo o contraseña incorrectos…".
- [x] Sin conexión se muestra un mensaje de red, no de contraseña.
- [x] A los 6 s aparece un aviso azul de demora sin bloquear el formulario.
- [x] Al entrar desde `/loggin?volver=/schedule` se vuelve a `/schedule`.
- [x] `/schedule` sin sesión avisa "Para agendar tu cita necesitas iniciar sesión.".
- [x] El enlace de ese aviso lleva a `/loggin?volver=/schedule`.
- [x] La galería muestra "Cargando trabajos…", error con **Reintentar** y vacío.
- [x] Tatuadores muestra error con **Reintentar** y recupera las tarjetas.
- [x] `/ajustes` existe, está protegida y muestra cuenta, sesión y baja.
- [x] "Eliminar mi cuenta" pide escribir `ELIMINAR` antes de continuar.
- [x] El menú desplegable tiene **Ajustes** y **Cerrar sesión**.
- [x] axe sin violaciones en home, galería, tatuadores, ajustes, información y agenda (1280 y 360).
- [x] Sin desbordes horizontales a 360 px.
- [x] El calendario entra completo a 360 px.

## Tareas

- [x] `auth.login()` propaga el error HTTP en vez de devolver siempre `false`.
- [x] `AuthGuard` envía `destino` con `state.url`.
- [x] `Lobby` muestra un mensaje según la ruta protegida y conserva `volver`.
- [x] `Loggin` valida, distingue 401 / sin conexión / 5xx y avisa la demora.
- [x] Galería con señales `cargando` y `errorCarga` + reintento.
- [x] Tatuadores con bloque de error + reintento.
- [x] Página `settings` y ruta `/ajustes` con `AuthGuard`.
- [x] Menú de usuario con Ajustes y Cerrar sesión.
- [x] Tokens de tipografía, radios y altura de controles en `styles.css`.
- [x] Aplicar la escala en lobby, galería, tatuadores, información, agenda, perfil, login, CV, cotizadores, reseñas, ajustes y navbars.
- [x] Galería con tarjetas de proporción 4:5 para que no salte al cargar.
- [x] Quitar `font-family: Arial` suelto y unificar en Poppins.
- [x] Corregir `button:nth-of-type` del login por clases reales.
- [x] Corregir etiquetas de los selects del calendario y contraste de días deshabilitados.
- [x] Compactar el calendario en móvil.
- [x] En móvil el layout reserva 56 px para el lateral y 8 px de padding al contenido.
- [x] Sidebar móvil de 56 px con iconos de 22 px y enlaces de 48 px.
- [x] Barra superior y menú compactos en móvil (botones de 40 px).
- [x] Banner de inicio de 180 px mínimo en móvil y botones de cotización de 40 px.
- [x] Títulos de página un paso más chicos (24–32 px según pantalla).
- [x] Galería móvil en 2 columnas con tarjetas cuadradas y gap de 10 px.
- [x] Foto de tatuador a 200 px y foto de perfil a 150 px en móvil.
- [x] El email largo del perfil ya no desborda la tarjeta.
- [x] Los botones IA quedan detrás del overlay y del panel de login.
- [x] "Inicia Sesión para Premium" abre el login y vuelve a `/gemini-ia` al entrar.
- [x] Botón "Cómo encontrarnos" con borde visible (antes `border: none` lo anulaba).

## Estado

Implementado y verificado en local. Pendiente de commit y push (el push lo ejecuta el usuario).

## Evidencias

### Flujo de login y rutas

| Prueba | Resultado |
| --- | --- |
| `/schedule` sin sesión | `/` + "Para agendar tu cita necesitas iniciar sesión." |
| Enlace del aviso | `/loggin?volver=%2Fschedule` |
| Contraseña incorrecta | "Correo o contraseña incorrectos…" |
| Login correcto | Vuelve a `/schedule` |
| Aviso de demora (XHR retrasado 7 s) | Aparece a los 6 s y desaparece al entrar |
| `/ajustes` sin sesión | Aviso + enlace `volver=/ajustes` |
| Cerrar sesión desde Ajustes | Navega a `/` y limpia `logueado` |

### Estados de datos

| Prueba | Resultado |
| --- | --- |
| Galería con `/galeria` abortado | Error visible + **Reintentar** |
| Reintentar sin bloqueo | 10 imágenes cargadas |
| Tatuadores con `/empleados` abortado | Error visible + **Reintentar** |
| Reintentar sin bloqueo | 9 tarjetas cargadas |

### Tamaños y accesibilidad

- Escala: cuerpo 16 px, secundario 14 px, etiquetas 12 px, sección 24 px, página 32 px.
- Controles: 46 px de alto mínimo; inputs a 16 px (evita el zoom en iOS).
- Galería: 10 tarjetas de 274×342 px (4:5) a 1280; 2 columnas a 360.
- axe: 0 violaciones en home, galería, tatuadores, ajustes, información y agenda (1280 y 360).
- `scrollWidth === innerWidth` en todas las rutas a 360.
- Calendario móvil: `.dates` 190 px de ancho visible = 190 px de contenido (antes 215).
- Layout móvil: `grid-template-columns: 56px 304px` a 360 px (antes 70/290).
- Galería móvil: 2 columnas cuadradas con 10 px de separación.
- Modal de login abierto desde el inicio: `.IA` queda en z-index 900, debajo del
  overlay (1999) y del panel (2000); los botones ya no tapan "Registrarse".
- Cotización IA sin sesión: `/loggin?volver=%2Fgemini-ia`; al entrar vuelve a `/gemini-ia`.
- axe: 0 violaciones en home, galería, tatuadores, ajustes, información, agenda y login (1280 y 360).

### Build

- `npx ng build --configuration production` → OK (solo avisos de presupuesto de CSS).
- `npx ng test --watch=false` → 17 pruebas pasan. Las 21 restantes fallan en el
  `beforeEach` por falta de providers (`Auth` de Firebase, `HttpClient`) en los
  specs; es un problema previo del setup de pruebas, no de estos cambios.

## Pendiente

- Commit en `integracion-frontend` y push a `dev-integracion-frontend` (lo hace el usuario).
- Probar el borrado real de una cuenta descartable (no se ejecutó para no destruir datos).
- Repetir la verificación en Render después del deploy.
