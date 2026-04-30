import { Routes } from '@angular/router';
import { Lobby } from './lobby/lobby';
import { Loggin } from './loggin/loggin';
import { Gallery } from './gallery/gallery';
import { Employees } from './employees/employees';
import { Schedule } from './schedule/schedule';
import { Information } from './information/information';
import { Profile } from './profile/profile';
import { EmployeeCV } from './employee-cv/employee-cv';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Lobby },
  { path: 'loggin', component: Loggin },
  { path: 'gallery', component: Gallery },
  { path: 'employees', component: Employees },
  { path: 'schedule', component: Schedule, canActivate: [AuthGuard] },
  { path: 'information', component: Information },
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },
  { path: 'employeeCV/:id', component: EmployeeCV },
  { path: '**', redirectTo: '' }
];
