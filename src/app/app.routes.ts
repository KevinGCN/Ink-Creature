import { Routes } from '@angular/router';
import { Lobby } from './lobby/lobby';
import { AuthGuard } from './guards/auth.guard';

/**
 * Rutas de la aplicación.
 *
 * `Lobby` se mantiene eager porque es la landing: se pinta sin descargar un
 * chunk extra. El resto usa `loadComponent`, así cada vista viaja en su propio
 * fragmento y el bundle inicial no carga la galería, el panel de empleados ni
 * las herramientas de IA hasta que se navega a ellas.
 */
export const routes: Routes = [
  {
    path: '',
    component: Lobby,
    data: {
      titulo: 'Ink Creature — Estudio de tatuajes',
      descripcion:
        'Estudio de tatuajes Ink Creature: diseños personalizados, tatuadores profesionales y una experiencia segura para tu próxima idea.'
    }
  },
  {
    path: 'loggin',
    loadComponent: () => import('./loggin/loggin').then((m) => m.Loggin),
    data: {
      titulo: 'Iniciar sesión | Ink Creature',
      descripcion:
        'Inicia sesión en Ink Creature para agendar citas, revisar tus diseños y gestionar tu perfil de cliente en segundos.'
    }
  },
  {
    path: 'gallery',
    loadComponent: () => import('./gallery/gallery').then((m) => m.Gallery),
    data: {
      titulo: 'Galería | Ink Creature',
      descripcion:
        'Explora la galería de Ink Creature: tatuajes reales, estilos variados y trabajos de nuestros artistas para inspirar tu próximo diseño.'
    }
  },
  {
    path: 'employees',
    loadComponent: () => import('./employees/employees').then((m) => m.Employees),
    data: {
      titulo: 'Nuestros tatuadores | Ink Creature',
      descripcion:
        'Conoce a los tatuadores de Ink Creature, sus especialidades y trayectoria. Elige al artista ideal para tu próximo tatuaje.'
    }
  },
  {
    path: 'schedule',
    loadComponent: () => import('./schedule/schedule').then((m) => m.Schedule),
    canActivate: [AuthGuard],
    data: {
      titulo: 'Agendar cita | Ink Creature',
      descripcion:
        'Agenda tu cita en Ink Creature, elige fecha y tatuador, y reserva tu espacio con confirmación rápida y segura.'
    }
  },
  {
    path: 'information',
    loadComponent: () => import('./information/information').then((m) => m.Information),
    data: {
      titulo: 'Información | Ink Creature',
      descripcion:
        'Encuentra información útil sobre Ink Creature: cuidados, procesos, ubicación y respuestas a las dudas más frecuentes.'
    }
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile').then((m) => m.Profile),
    canActivate: [AuthGuard],
    data: {
      titulo: 'Mi perfil | Ink Creature',
      descripcion:
        'Consulta y actualiza los datos de tu perfil en Ink Creature, revisa tus citas y mantén tus preferencias al día.'
    }
  },
  {
    path: 'employeeCV/:id',
    loadComponent: () => import('./employee-cv/employee-cv').then((m) => m.EmployeeCV),
    data: {
      titulo: 'Perfil del tatuador | Ink Creature',
      descripcion:
        'Descubre el perfil del tatuador de Ink Creature: especialidades, portafolio y experiencia para elegir a tu artista ideal.'
    }
  },
  {
    path: 'tattoo-ia',
    loadComponent: () => import('./tattoo-quote/tattoo-quote').then((m) => m.TattooQuote),
    data: {
      titulo: 'Cotización rápida | Ink Creature',
      descripcion:
        'Cotiza tu tatuaje en minutos con nuestra herramienta rápida: elige estilo, tamaño y zona para estimar el precio.'
    }
  },
  {
    path: 'gemini-ia',
    loadComponent: () =>
      import('./tattoo-ia-quote/tattoo-ia-quote').then((m) => m.TattooAiQuoteComponent),
    canActivate: [AuthGuard],
    data: {
      titulo: 'Cotización con IA | Ink Creature',
      descripcion:
        'Genera una cotización inteligente con IA en Ink Creature: describe tu idea y recibe una estimación personalizada al instante.'
    }
  },
  {
    path: '**',
    redirectTo: '',
    data: {
      titulo: 'Ink Creature',
      descripcion:
        'Ink Creature es tu estudio de tatuajes: diseños personalizados, artistas profesionales y una experiencia segura.'
    }
  }
];
