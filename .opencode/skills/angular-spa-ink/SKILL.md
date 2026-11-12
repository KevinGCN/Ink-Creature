---
name: SPA Projecto INK (Angular)
description: Convenciones de la SPA de Projecto INK (Angular 21 standalone + signals, Vitest, backend NestJS en `environment.apiUrl`). Úsala al crear o modificar componentes, rutas, servicios HTTP, formularios, tests o estilos dentro de `Ink-Creature/`.
---

# SPA de Projecto INK (Angular 21)

Para dudas de API de Angular (signals, formularios, router, testing, estilos),
carga también la skill `angular-developer` (documentación oficial de Google, con
43 referencias en `.agents/skills/angular-developer/references/`). Esta skill
manda sobre las **convenciones de este repo**.

## Reglas del repo

1. **Standalone components only.** Sin `NgModules`. En plantillas, control de flujo
   nativo `@if` / `@for` / `@switch` (nunca `*ngIf` / `*ngFor`).
2. **Estado con signals**: `signal()`, `computed()`, `effect()` cuando haga falta.
   Nada de `BehaviorSubject` nuevo; los servicios existentes exponen
   `isLoggedIn$`/`usuario$` como observables por compatibilidad, no los copies como patrón.
3. **Todo HTTP pasa por un servicio de `src/app/services/`** con `HttpClient`
   (`provideHttpClient` + `authInterceptor` ya están en `app.config.ts`). Un
   componente no llama `HttpClient` directamente.
4. **URLs de imagen siempre por `urlImagen()`** (`src/app/utils/imagen-url.ts`).
   El backend guarda rutas relativas (`/api/imagenes/12`); pintarlas en crudo
   rompe en el navegador. Nunca `[src]="foto"` con el valor de la BD.
5. **Nada de secretos ni llaves en el frontend.** La única configuración es
   `environment.apiUrl` (`http://localhost:3000/api` en local). Las llamadas a IA
   van por el backend (`services/gemini.ts` → `POST /api/ia/analyze-tattoo`).
6. **Comentarios y textos de UI en español.**

## Servicios: patrón vigente

```ts
@Injectable({ providedIn: 'root' })
export class EjemploService {
  private readonly http = inject(HttpClient);
  // apiUrl ya trae /api: no repetirlo al construir la ruta.
  private readonly base = `${environment.apiUrl}/ejemplo`;

  listar() {
    return this.http.get<Ejemplo[]>(this.base);
  }
}
```

- El `authInterceptor` añade `Authorization: Bearer` y, ante un 401 fuera de
  `/auth/login`, limpia `localStorage['access_token']` y navega a `/`. No dupliques
  ese manejo de sesión.
- `services/auth.ts` restaura la sesión con `GET /api/auth/me` al arrancar.

## Rutas

`src/app/app.routes.ts`. Las vistas que leen o escriben datos personales llevan
`canActivate: [authGuard]` (`schedule`, `profile`, `gemini-ia`). Rutas existentes:
`''` lobby, `loggin`, `gallery`, `employees`, `employeeCV/:id`, `information`,
`schedule`, `profile`, `tattoo-ia`, `gemini-ia`, y `**` → `''`.

## Roles y permisos en la UI

- `usuario.rol` ∈ `cliente | empleado | admin`. La UI solo **oculta** acciones;
  la autorización real la hace el backend (no confíes en el `@if`).
- Ser tatuador = fila en `empleados` + `rol = 'empleado'`. La ficha de `empleados`
  **no** tiene `rol`: al editar un tatuador no se debe tocar el rol del usuario
  (bug corregido en `employees.ts`; no lo reintroduzcas).

## Tests (Vitest vía `@angular/build:unit-test`)

- Archivos `*.spec.ts` junto al código; 20 archivos / 42 tests en verde.
- Usar `provideHttpClient()` + `provideHttpClientTesting()`, `HttpTestingController`
  y la API de signals (`set()`, `()`). Mockear siempre el HTTP: los tests no
  hablan con el backend.
- Comando: `npm run test`.

## Comandos

```powershell
npm start     # ng serve -> http://localhost:4200
npm run build # prebuild (genera environment.prod.ts desde API_URL) + ng build
npm run test  # Vitest
```

El warning de presupuesto del bundle (~501 kB vs 500 kB) es **esperado**.
`anyComponentStyle` está en 10 kB warning / 16 kB error.

## Estilos

SCSS por componente (`styleUrl`). Si un componente supera el presupuesto de estilos,
divide el componente o reutiliza estilos; no infles el presupuesto de `angular.json`.

## Estructura

`src/app/`: `lobby`, `loggin`, `gallery`, `employees`, `employee-cv`, `profile`,
`schedule`, `information`, `tattoo-quote`, `tattoo-ia-quote`, `comments`, `navbar`,
`guards`, `interceptors`, `services`, `models`, `utils`.
