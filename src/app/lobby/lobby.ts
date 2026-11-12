import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Comments } from "../comments/comments";
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [RouterLink, Comments],
  templateUrl: './lobby.html',
  styleUrls: ['./lobby.css']
})
export class Lobby implements OnInit {

  /** Texto del aviso cuando se intenta entrar a una sección protegida. */
  mensajeAcceso = '';

  /** Ruta protegida a la que el usuario quería entrar (para volver luego). */
  destinoAcceso = '';

  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('acceso') === 'restringido') {
      const destino = this.route.snapshot.queryParamMap.get('destino') || '';
      this.destinoAcceso = destino;
      this.mensajeAcceso = this.mensajePara(destino);

      // Limpia la URL para que al refrescar no vuelva a aparecer el aviso.
      this.router.navigate(['/'], { queryParams: {}, replaceUrl: true });
    }
  }

  /** Mensaje entendible según la sección que quiso abrir el visitante. */
  private mensajePara(destino: string): string {
    if (destino.startsWith('/schedule')) {
      return 'Para agendar tu cita necesitas iniciar sesión.';
    }
    if (destino.startsWith('/profile')) {
      return 'Para ver tu perfil necesitas iniciar sesión.';
    }
    if (destino.startsWith('/gemini-ia')) {
      return 'Para usar el asistente de tatuajes necesitas iniciar sesión.';
    }
    return 'Inicia sesión para acceder a esa sección.';
  }
}
