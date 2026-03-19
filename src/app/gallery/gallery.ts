import { Component } from '@angular/core';
<<<<<<< HEAD

@Component({
  selector: 'app-gallery',
  imports: [],
  standalone: true,
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})
export class Gallery {

}
=======
import { CommonModule } from '@angular/common';
imports: [CommonModule]

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.css']
})
export class Gallery {

  
images = [
  'image/bendy.jpg',
  'image/goku.webp',
  'image/banner.jpg',
  'image/instagram.png',
  'image/ubicacion.png',
  'image/whatsapp.webp'
];

  // visor
  selectedImage: string | null = null;

  openImage(img: string) {
    this.selectedImage = img;
  }

  closeImage() {
    this.selectedImage = null;
  }

}
>>>>>>> master
