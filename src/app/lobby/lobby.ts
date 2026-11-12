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

  mensajeAcceso = '';

  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('acceso') === 'restringido') {
      this.mensajeAcceso = 'Inicia sesión para acceder a esa sección.';
      this.router.navigate(['/'], { queryParams: {}, replaceUrl: true });
    }
  }
}
