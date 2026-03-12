import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Ink-Creature');
  reviews = [
    {
      name: "Pepito Perez",
      date: "12/02/2026",
      text: "Estoy muy contento con el servicio y el diseño que realizó el tatuador."
    },
    {
      name: "Karen Figderald",
      date: "24/12/2025",
      text: "Estoy contenta, el artista entendió lo que quería."
    }
  ];
}
