/**
 * Mapa de rutas de la SPA.
 *
 * Los componentes se importan de forma estática (no `loadComponent`) porque
 * el bundle inicial ya se mantiene pequeño y así no hay parpadeo al navegar.
 *
 * Tres rutas exigen sesión (`authGuard`): son las que leen o escriben datos
 * personales contra el backend, y el guard evita el "pantallazo" de una vista
 * vacía cuando el JWT no existe o ya expiró.
 */
import { Routes } from '@angular/router';
import { Lobby } from './lobby/lobby';
import { Loggin } from './loggin/loggin';
import { Gallery } from './gallery/gallery';
import { Employees } from './employees/employees';
import { Schedule } from './schedule/schedule';
import { Information } from './information/information';
import { Profile } from './profile/profile';
import { EmployeeCV } from './employee-cv/employee-cv';
import { authGuard } from './guards/auth.guard';
import { TattooQuote } from './tattoo-quote/tattoo-quote';
import { TattooAiQuoteComponent } from './tattoo-ia-quote/tattoo-ia-quote';

// El orden importa: el comodín `**` va al final para que no se "trague" al
// resto de rutas, y redirige al lobby en vez de mostrar un 404 sin salida.
export const routes: Routes = [
  { path: '', component: Lobby },
  { path: 'loggin', component: Loggin },
  { path: 'gallery', component: Gallery },
  { path: 'employees', component: Employees },
  // Agenda: requiere sesión porque necesita el `usuario_id` del token para
  // listar y crear citas propias.
  { path: 'schedule', component: Schedule, canActivate: [authGuard] },
  { path: 'information', component: Information },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'employeeCV/:id', component: EmployeeCV },
  { path: 'tattoo-ia', component: TattooQuote },
  // La cotización con IA se protege porque cada llamada consume la cuota de
  // Gemini del backend; sin sesión no debe poder invocarse.
  { path: 'gemini-ia', component: TattooAiQuoteComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
