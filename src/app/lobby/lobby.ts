/**
 * Página de inicio (Lobby) — ruta pública `''`.
 *
 * Es la landing: presenta el estudio y delega las reseñas al componente
 * `Comments`, que el Lobby inserta directamente en su plantilla.
 */
import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Comments } from "../comments/comments";
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-lobby',
  imports: [RouterLink, Comments],
  standalone: true,
  templateUrl: './lobby.html',
  styleUrls: ['./lobby.css']
})

export class Lobby {
  // `auth` se expone para que la plantilla decida qué mostrar según haya sesión.
  constructor(public auth: AuthService) {}
}