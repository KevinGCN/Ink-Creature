import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Comments } from "../comments/comments";import { AuthService } from '../services/auth';

@Component({
  selector: 'app-lobby',
  imports: [RouterLink, Comments],
  standalone: true,
  templateUrl: './lobby.html',
  styleUrls: ['./lobby.css']
})

export class Lobby {
  constructor(public auth: AuthService) {}
}