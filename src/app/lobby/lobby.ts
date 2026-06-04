import { Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { Comments } from "../comments/comments";
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [RouterLink, Comments],
  templateUrl: './lobby.html',
  styleUrls: ['./lobby.css']
})
export class Lobby {

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  irChat() {
    this.router.navigate(['/chat']);
  }
}