import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainNavbar } from "./navbar/main-navbar/main-navbar";
import { UserNavbar } from "./navbar/user-navbar/user-navbar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MainNavbar, UserNavbar],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Ink-Creature');
}
