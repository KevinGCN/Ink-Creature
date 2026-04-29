import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-main-navbar',
  imports: [RouterLink],
  templateUrl: './main-navbar.html',
  styleUrl: './main-navbar.css',
})
export class MainNavbar {
  gridTemplateColumnsLayout = 'grid-template-columns:0px 1fr;';
  collapsed = true;
  
  constructor(public auth: AuthService) {}

  toggleNavbar(){
    this.collapsed = !this.collapsed;
    this.gridTemplateColumnsLayout = 'grid-template-columns:0px 1fr;';
  }
}
