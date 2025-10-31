import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // <-- Impor

@Component({
  selector: 'app-root',
  standalone: true, // <-- Komponen sudah standalone
  imports: [RouterOutlet], // <-- Impor RouterOutlet
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'TodoClient';
}
