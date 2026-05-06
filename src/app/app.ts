import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserNavbar } from "./navbar/user-navbar/user-navbar";
import { MainNavbar } from "./navbar/main-navbar/main-navbar";
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserNavbar, MainNavbar, HttpClientModule],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Ink-Creature');
}
