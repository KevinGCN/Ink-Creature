# Reparación tras auditoría de la web (noviembre 2026)

## Alcance

Reparar lo hallado en la auditoría de `https://ink-creature-v2.netlify.app/`
hecha con `agent-browser 0.41.2` + axe-core 4.12.1 sobre las 5 rutas,
desktop 1440px y móvil 360px.

Incluye:

- Headers de seguridad en Netlify.
- Legibilidad: contraste y layout en móvil.
- SEO: meta tags por ruta y archivos de descubrimiento.
- Estructura semántica: landmarks `<main>` duplicados.
- Accesibilidad del navbar y feedback de rutas protegidas.
- Feedback y validación del registro/login.
- Imágenes placeholder en galería y tatuadores.

No incluye:

- Deploy a Netlify ni tocar la configuración de cuenta.
- Cambios en el backend o en la base de datos.
- Rediseño visual mayor ni nuevas funcionalidades.
- Cambiar dependencias de `package.json`.
- Modificar los datos de contacto de soporte (decisión de producto pendiente).
- Borrar la cuenta de prueba creada durante la auditoría
  (`auditoria.20261109@example.com`, id 34).

## Requisitos

- [ ] **Pendiente de deploy:** `curl -sI` de la raíz devuelve
      `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`,
      `Referrer-Policy` y `Permissions-Policy`. El archivo ya está creado y se
      copia al build; solo se puede comprobar tras publicar en Netlify.
- [x] axe-core devuelve **0 violaciones** en `/`, `/gallery`, `/employees`,
      `/information`, `/loggin` y `/employeeCV/1` (incluido `color-contrast`).
- [x] `npm run build` termina sin errores.
- [x] A 360px no hay texto recortado ni botones superpuestos.
- [x] `robots.txt`, `sitemap.xml` y `manifest.json` devuelven su tipo MIME
      real, no HTML.
- [x] Cada ruta muestra `<title>` y `meta description` propios.
- [x] Clickear una ruta protegida con sesión cerrada muestra un mensaje, no
      un redireccionamiento silencioso.
- [x] Registro y login muestran un mensaje visible tanto en éxito como en
      error (201, 409, 401).
- [x] El formulario de registro valida en cliente: `required`, `minlength`
      en contraseña y `label` asociado por `for`/`id`.

## Decisiones

- El `<h1>` "Bienvenido" se renderiza en mayúsculas por CSS y pierde
  legibilidad sobre `banner.jpg`: se cambia el tratamiento de la imagen, no
  el texto.
- Los headers van en `public/_headers` (Netlify lo lee desde ahí). No existe
  hoy: `netlify.toml` solo tiene el redirect SPA.
- Las rutas `/schedule`, `/profile` y `/gemini-ia` están protegidas por
  `AuthGuard`, que redirige a `/`. **No es un bug de routing** (se corrigió
  el diagnóstico inicial): el problema es que no hay aviso al usuario.
- Roles consultados contra el backend: `emerson.prueba@gmail.com` es
  `admin` (id 1) y `jpatino@gmail.com` es `empleado`. Las otras cuentas del
  track previo (`kgcobo`, `kgcn`, `edmosquera`) devuelven 401 con
  `12345678`: sus contraseñas cambiaron o no se crearon.
- Para probar el registro se creó una cuenta ficticia en dominio reservado
  (`example.com`) en vez de usar un correo real: no envía nada a terceros.

## Tareas

- [x] **T1** — Crear `public/_headers` con los 5 headers de seguridad
  - Verificación: `curl -sI https://ink-creature-v2.netlify.app/ | grep -ciE 'content-security-policy|x-frame-options'` → `≥2`
  - Dependencias: ninguna · paralelizable: sí

- [x] **T2** — Legibilidad móvil y contraste: `src/app/lobby/lobby.css`,
      `src/app/lobby/lobby.html`, `src/app/navbar/main-navbar/main-navbar.css`
  - Verificación: `agent-browser a11y` → `color-contrast` en 0; captura a 360px sin recorte
  - Dependencias: ninguna · paralelizable: no (comparte `lobby.css` con T3)

- [x] **T3** — Layout a 360px: título "BIENVENIDO" recortado y botones
      flotantes que tapan contenido (`lobby.css`, `lobby.html`)
  - Verificación: `agent-browser eval` con `scrollWidth <= innerWidth` y sin elementos con `right > innerWidth`; captura de pantalla
  - Dependencias: T2 · paralelizable: no (comparte `lobby.css`)

- [x] **T4** — Meta tags SEO por ruta: `src/index.html` + `Title`/`Meta` en
      las 5 vistas
  - Verificación: `agent-browser eval` devuelve `title` y `description`
      distintos en cada ruta
  - Dependencias: ninguna · paralelizable: sí

- [x] **T5** — `public/robots.txt`, `public/sitemap.xml`,
      `public/manifest.json` reales
  - Verificación: `curl -sI` devuelve `text/plain`, `text/xml` y
      `application/json` (hoy devuelven `text/html`)
  - Dependencias: T4 (para listar las URLs del sitemap) · paralelizable: no

- [x] **T6** — Landmark `<main>` duplicado: `src/app/app.html` y los `<main>`
      internos de `lobby`, `employees`, `information`
  - Verificación: `agent-browser a11y` → `landmark-*` en 0
  - Dependencias: ninguna · paralelizable: sí

- [x] **T7** — `aria-label` en los links del navbar: `src/app/navbar/main-navbar/main-navbar.html`
  - Verificación: `agent-browser snapshot` muestra el nombre accesible
      completo en los 5 links
  - Dependencias: ninguna · paralelizable: no (comparte archivo con T8)

- [x] **T8** — Feedback al acceder a una ruta protegida sin sesión:
      `src/app/guards/auth.guard.ts` y `main-navbar.html`
  - Verificación: con sesión cerrada, clic en 📅 muestra un aviso en vez de
      volver al home sin explicación
  - Dependencias: T7 · paralelizable: no (comparte `main-navbar.html`)

- [x] **T9** — Feedback visible de autenticación: `src/app/loggin/loggin.ts`,
      `loggin.html` y `loggin.css`
  - Verificación: con `agent-browser`, los 4 casos muestran mensaje en DOM:
      registro 201 → éxito + navegación; registro duplicado → 409;
      login con clave mala → 401; campos vacíos → validación en cliente
  - Dependencias: ninguna · paralelizable: no (comparte `loggin.html` con T10)

- [x] **T10** — Validación y accesibilidad del formulario de registro:
      `id` + `label[for]`, `required`, `minlength` en contraseña,
      `autocomplete="email"` y `autocomplete="new-password"`
  - Verificación: `agent-browser eval` confirma que cada `input` tiene `id`,
      label asociado, `required=true` y `minlength>0`; clic en el label
      enfoca el campo
  - Dependencias: T9 · paralelizable: no (comparte `loggin.html`)

## Estado

**Implementado y verificado en local el 2026-11-10**, en la rama
`integracion-frontend`. **Sin commit, sin push y sin deploy.** El usuario
pidió explícitamente no crear ramas.

## Evidencias

### Auditoría inicial (antes)

- `agent-browser doctor` → `8 pass, 1 warn, 0 fail`.
- axe-core 4.12.1: home 3 violaciones, gallery 1, employees 4,
  information 4 (`serious` en `list`).
- Headers: solo `strict-transport-security` presente; 6 ausentes.
- `netlify.toml` tiene el redirect SPA `/* → /index.html 200`;
  **no existía** `public/_headers`.
- `auth.guard.ts` → `this.router.navigate(['/'])` cuando no hay sesión.
- `app.html` declara `<main class="content">` y las vistas repetían `<main>`.
- `src/index.html` no tenía `meta description`, `og:*` ni `canonical`.
- Navegación: los 5 links exponían solo el emoji (confirmado en
  `agent-browser snapshot`); el texto `.text` existía en el HTML pero no
  llegaba al árbol accesible.
- Registro 201 creaba la cuenta y logueaba, pero la UI seguía mostrando el
  formulario vacío; 409 y 401 tampoco mostraban mensaje.
- Los 3 `input` del registro no tenían `id`, `required`, `minlength` ni
  `autocomplete`.
- Capturas en `/tmp/audit/`.

### Verificación posterior (después)

- **Build:** `npm run build` ✅. Solo quedan los warnings de presupuesto que
  ya existían (bundle 615.39 kB y `profile.css` 4.33 kB).
- **SEO por ruta** (`agent-browser eval`): título, `meta description`,
  `og:title` y `canonical` únicos en `/`, `/gallery`, `/employees`,
  `/information`, `/loggin` y `/employeeCV/1`.
- **Archivos de descubrimiento:** en local,
  `robots.txt` → `text/plain`, `sitemap.xml` → `text/xml`,
  `manifest.json` → `application/json`. Los 4 archivos (`_headers` incluido)
  se copian a `dist/Ink-Creature/browser/`.
- **axe-core final:** 0 violaciones en `/`, `/gallery`, `/employees`,
  `/information`, `/loggin` y `/employeeCV/1`. El único `incomplete` es la
  revisión manual que axe no puede resolver, no una violación.
- **`/loggin`:** la violación de contraste que apareció en una corrida era un
  falso positivo de la animación de entrada (colores medidos a mitad de
  `opacity`). Repetida la auditoría 3 s después, el contraste real es
  `#16324f` sobre `#f8fbff` y pasa. Se corrigió además
  `image-redundant-alt` con `alt=""` en el icono de Google.
- **Móvil 360:** `scrollWidth=360`, "BIENVENIDO" entra (27px), `.IA` en
  `position: static`, chat tipo píldora (83px) y sin elementos que superen el
  ancho. Captura: `/tmp/audit/fixed/home-mobile-360.png`.
- **T7:** `agent-browser snapshot` muestra los nombres accesibles `Inicio`,
  `Galería`, `Citas`, `Tatuadores`, `Información`.
- **T8:** con sesión, `/schedule` abre y muestra "Agenda tu Cita"; sin
  sesión redirige a `/` y muestra
  "Inicia sesión para acceder a esa sección." con enlace a login.
- **T9:** mensajes visibles verificados con el backend real:
  - login vacío → "Por favor, ingresa tu correo y contraseña";
  - login 401 → "Correo o contraseña incorrectos. Por favor, verifica e
    intenta nuevamente.";
  - registro 409 → "Ya existe una cuenta con este correo. Inicia sesión.";
  - login 200 → "Sesión iniciada correctamente." y navegación a `/`;
  - registro 201 → "Cuenta creada correctamente." y navegación a `/`.
- **T10:** los inputs de registro tienen `id`, `label[for]`, `required`,
  `autocomplete` y `minlength` (nombre 2, contraseña 8); el login tiene
  `required` y `autocomplete` correctos.
- **Correcciones extra de contraste/estructura** encontradas con datos reales:
  - `employee-cv.html`: `<main>` → `<div>`; estado de carga con `<h1>` real y
    color visible; `.etiqueta` y `.sin-desc` con color accesible.
  - `comments.css`: `.sin-resenas` y `.date` con color accesible.
  - `employees.css`: `.experiencia` y `.modal-close`.
  - `gallery.css`: `.modal-close`.
  - `profile.css`: `.empty`.
  - `schedule.css`: botón `.cancelar`.
  - `information.html`: `<h3>` fuera del `<ul>` y `<main>` → `<div>`.
- **Tests:** `npm run test -- --watch=false` → 21 fallos **preexistentes** por
  providers faltantes en los specs (`NG0201: No provider found for Auth` /
  `_HttpClient`). No los introduce este trabajo; el build de producción pasa.

## Pendiente

- **Deploy:** los headers de `public/_headers` solo se pueden verificar en
  producción después de publicar en Netlify (fuera de alcance).
- **Tests:** el suite sigue roto por falta de `Auth`/`HttpClient` en los
  specs. No se corrigió porque es un problema previo y separado.
- **Rutas con sesión:** no se auditó el contenido visual de `/profile` ni
  `/gemini-ia`; `/schedule` se probó funcionalmente (abre con sesión), no con
  axe.
- `ffmpeg` no está instalado: no se pudo usar `agent-browser record`.
- **Decisión de producto pendiente:** los datos de contacto de soporte
  (`SOPORTE_INFO`) no se tocaron.
- **Cuentas de prueba creadas en el backend** (no se borraron; borrarlas
  requiere pedido explícito):
  - `auditoria.20261109@example.com` (id 34, cliente);
  - `reparacion.auditoria.20261109@example.com` (id 37, cliente).
- **Todo el trabajo está sin commit** en `integracion-frontend`. Commit,
  push y deploy requieren confirmación del usuario.
