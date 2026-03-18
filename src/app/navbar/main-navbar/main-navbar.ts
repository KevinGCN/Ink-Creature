import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main-navbar',
  imports: [RouterLink],
  templateUrl: './main-navbar.html',
  styleUrl: './main-navbar.css',
})
export class MainNavbar {
  collapsed = true;
  toggleNavbar(){
    this.collapsed = !this.collapsed;
  }
}
