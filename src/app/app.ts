import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserNavbar } from "./navbar/user-navbar/user-navbar";
import { MainNavbar } from "./navbar/main-navbar/main-navbar";
import { HttpClientModule } from '@angular/common/http';
import { SeoService } from './core/seo.service';
import { TooltipDirective } from './core/tooltip.directive';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserNavbar, MainNavbar, HttpClientModule, TooltipDirective],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Ink-Creature');

  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.init();
  }
}
