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
import { TattooQuote } from './tattoo-quote/tattoo-quote';
import { TattooAiQuoteComponent } from './tattoo-ia-quote/tattoo-ia-quote';

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
    component: Loggin,
    data: {
      titulo: 'Iniciar sesión | Ink Creature',
      descripcion:
        'Inicia sesión en Ink Creature para agendar citas, revisar tus diseños y gestionar tu perfil de cliente en segundos.'
    }
  },
  {
    path: 'gallery',
    component: Gallery,
    data: {
      titulo: 'Galería | Ink Creature',
      descripcion:
        'Explora la galería de Ink Creature: tatuajes reales, estilos variados y trabajos de nuestros artistas para inspirar tu próximo diseño.'
    }
  },
  {
    path: 'employees',
    component: Employees,
    data: {
      titulo: 'Nuestros tatuadores | Ink Creature',
      descripcion:
        'Conoce a los tatuadores de Ink Creature, sus especialidades y trayectoria. Elige al artista ideal para tu próximo tatuaje.'
    }
  },
  {
    path: 'schedule',
    component: Schedule,
    canActivate: [AuthGuard],
    data: {
      titulo: 'Agendar cita | Ink Creature',
      descripcion:
        'Agenda tu cita en Ink Creature, elige fecha y tatuador, y reserva tu espacio con confirmación rápida y segura.'
    }
  },
  {
    path: 'information',
    component: Information,
    data: {
      titulo: 'Información | Ink Creature',
      descripcion:
        'Encuentra información útil sobre Ink Creature: cuidados, procesos, ubicación y respuestas a las dudas más frecuentes.'
    }
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [AuthGuard],
    data: {
      titulo: 'Mi perfil | Ink Creature',
      descripcion:
        'Consulta y actualiza los datos de tu perfil en Ink Creature, revisa tus citas y mantén tus preferencias al día.'
    }
  },
  {
    path: 'employeeCV/:id',
    component: EmployeeCV,
    data: {
      titulo: 'Perfil del tatuador | Ink Creature',
      descripcion:
        'Descubre el perfil del tatuador de Ink Creature: especialidades, portafolio y experiencia para elegir a tu artista ideal.'
    }
  },
  {
    path: 'tattoo-ia',
    component: TattooQuote,
    data: {
      titulo: 'Cotización rápida | Ink Creature',
      descripcion:
        'Cotiza tu tatuaje en minutos con nuestra herramienta rápida: elige estilo, tamaño y zona para estimar el precio.'
    }
  },
  {
    path: 'gemini-ia',
    component: TattooAiQuoteComponent,
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
