import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = environment.apiUrl;
  private isBrowser: boolean;

  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/register`, user);
  }

  login(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/login`, user, { responseType: 'text' }) // Terima token sebagai teks
      .pipe(
        tap((token: string) => {
          // Only use localStorage in the browser (guard SSR)
          if (this.isBrowser) {
            localStorage.setItem('authToken', token); // Simpan token
          }
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('authToken');
      this.router.navigate(['/login']);
    }
  }

  isLoggedIn(): boolean {
    return this.isBrowser ? !!localStorage.getItem('authToken') : false;
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('authToken') : null;
  }
  // === TAMBAHAN BARU ===
  // GET /api/Profile/me (dari modul latihan) atau /api/Users/me
  getProfile(): Observable<any> {
    // Sesuaikan URL jika nama controller Anda berbeda (mis: "Users")
    return this.http.get(`${this.apiUrl}/Profile`);
  }
  // PUT /api/Profile/me
  updateProfile(data: { newUsername: string }): Observable<any> {
    // Pastikan DTO di Angular cocok dengan DTO di .Net
    // Di backend kita menamakannya "NewUsername", jadi kita kirim objek
    // { "newUsername": "nilai-baru" }
    return this.http.put(`${this.apiUrl}/Profile`, data);
  }
  // DELETE /api/Profile/me
  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Profile`);
  }
  // === BATAS TAMBAHAN ===

}
