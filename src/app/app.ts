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
  isClosed = false;

  toggleSidebar(){
    this.isClosed = !this.isClosed;
  }
  
  protected readonly title = signal('Ink-Creature');
}
