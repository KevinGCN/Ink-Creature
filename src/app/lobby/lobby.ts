import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Comments } from "../comments/comments";
import { AuthService } from '../services/auth';
import { TawkService } from '../services/tawk';

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
    private tawk: TawkService
  ) {}

  irChat() {
    this.tawk.abrirChat();
  }
}