import { Routes } from '@angular/router';
import { Lobby } from './lobby/lobby';
import { Loggin } from './loggin/loggin';
import { Gallery } from './gallery/gallery';
import { Employees } from './employees/employees';
import { Schedule } from './schedule/schedule';
import { Information } from './information/information';
import { Profile } from './profile/profile';
import { EmployeeCV } from './employee-cv/employee-cv';

export const routes: Routes = [
  { path: '', component: Loggin }, // ruta por defecto
  { path: 'lobby', component: Lobby },
  { path: 'gallery', component: Gallery },
  { path: 'employees', component: Employees },
  { path: 'schedule', component: Schedule },
  { path: 'information', component: Information },
  { path: 'profile', component: Profile },
  { path: 'employeeCV', component: EmployeeCV },
  { path: '**', redirectTo: '' } // ruta comodín (si no existe)
];