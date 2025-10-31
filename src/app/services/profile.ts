import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
// Impor DTO yang SAMA PERSIS dengan backend (UserDTO.cs)
// DTO ini berisi: Username, Name, Address, Phone, Email, NoTin
export interface UserDTO {
  username: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  noTin: string;
}
@Injectable({
  providedIn: 'root'
})
export class Profile { // <-- Nama kelas diubah (sebelumnya ProfileService)
  // Panggil endpoint 'me' yang aman, BUKAN '/api/Users'
  private apiUrl = `${environment.apiUrl}/Profile/me`;
  constructor(private http: HttpClient) { }
  /**
  * GET: /api/Profile/me
  * Mengambil data profil milik user yang sedang login (dari token).
  */
  getMyProfile(): Observable<UserDTO> {
    return this.http.get<UserDTO>(this.apiUrl);
  }
  /**
  * PUT: /api/Profile/me
  * Memperbarui data profil milik user yang sedang login.
  */
  updateMyProfile(profileData: UserDTO): Observable<any> {
    return this.http.put(this.apiUrl, profileData);
  }
  /**
  * DELETE: /api/Profile/me
  * Menghapus akun milik user yang sedang login.
  */
  deleteMyAccount(): Observable<any> {
    return this.http.delete(this.apiUrl);
  }
}