import { Component, ViewChild } from '@angular/core';
import { Loggin } from '../loggin/loggin';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [Loggin],
  templateUrl: './lobby.html',
  styleUrls: ['./lobby.css']
})
export class Lobby {
  @ViewChild('login') login!: Loggin;

<<<<<<< HEAD
  abrirLogin() {
    this.login.abrir();
  }
=======
  @ViewChild('login') login!: Loggin;

  abrirLogin() {
    this.login.abrir();
  }

>>>>>>> parent of 0495e67 (Merge branch 'dev-emerson' of https://github.com/KevinGCN/Angular into dev-emerson)
}