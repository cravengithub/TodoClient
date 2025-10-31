import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
// Impor service dengan nama baru dari file baru
import { Profile as ProfileService, UserDTO } from '../../services/profile';
import { Auth } from '../../services/auth';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html', // <-- Ubah nama file
  styleUrls: ['./profile.css'] // <-- Ubah nama file
})
// Ubah nama kelas
export class Profile implements OnInit {
  // Model untuk form, sesuai dengan UserDTO.cs
  model: UserDTO = {
    username: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    noTin: ''
  };
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  submitted = false;
  constructor(
    private profileService: ProfileService, // <-- Gunakan nama kelas service baru
    private authService: Auth,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.loadProfile();
  }
  loadProfile() {
    this.isLoading = true;
    this.errorMessage = '';
    // Panggil service yang AMAN
    this.profileService.getMyProfile().subscribe({
      next: (data) => {
        this.model = data; // Isi form dengan data dari API
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Gagal memuat profil.';
        this.isLoading = false;
      }
    });
  }
  saveChanges(form?: NgForm) {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';
    // Jika form diberikan dan tidak valid, batalkan pengiriman
    if (form && form.invalid) {
      this.errorMessage = 'Form belum valid. Mohon periksa isian.';
      return;
    }

    // Tampilkan loading saat menyimpan
    this.isLoading = true;

    // Panggil service yang AMAN
    this.profileService.updateMyProfile(this.model).subscribe({
      next: () => {
        // Pastikan loading dimatikan dan pesan sukses ditampilkan
        this.isLoading = false;
        this.successMessage = 'Profil berhasil diperbarui!';
        this.submitted = false;
        // Sembunyikan pesan sukses setelah 3 detik
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Gagal menyimpan perubahan.';
      }
    });
  }
  deleteAccount() {
    // Tampilkan konfirmasi yang aman (bukan window.confirm)
    // Untuk saat ini, kita gunakan 'confirm' sederhana untuk demo
    if (!confirm('PERINGATAN: Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }
    // Panggil service yang AMAN
    this.profileService.deleteMyAccount().subscribe({
      next: () => {
        // Jika sukses, logout dan paksa ke halaman login
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = 'Gagal menghapus akun.';
      }
    });
  }
}