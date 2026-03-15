import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MainNavbar } from "../main-navbar/main-navbar";

@Component({
  selector: 'app-user-navbar',
  imports: [RouterLink, MainNavbar],
  templateUrl: './user-navbar.html',
  styleUrl: './user-navbar.css',
})
export class UserNavbar {

}
