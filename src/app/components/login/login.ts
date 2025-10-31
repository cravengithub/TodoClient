import { Component } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <-- Impor untuk ngModel
import { CommonModule } from '@angular/common'; // <-- Impor untuk @if
 
@Component({
  selector: 'app-login',
  standalone: true,
  // Impor modul/komponen yang dibutuhkan oleh template ini
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  // Gunakan ngModel untuk data binding
  model: any = { username: '', password: '' };
  errorMessage: string = '';
 
  constructor(private auth: Auth, private router: Router) {}
 
  login() {
    this.auth.login(this.model).subscribe({
      next: (token) => {
        console.log('Login berhasil, token:', token);
        this.router.navigate(['/todos']); // Arahkan ke daftar todo
      },
      error: (err) => {
        console.error('Login gagal', err);
        this.errorMessage = 'Username atau password salah.';
      }
    });
  }
}
