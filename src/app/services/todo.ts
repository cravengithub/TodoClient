import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
// Kita bisa definisikan interface sederhana untuk Todo
export interface Todo {
  id: number;
  name: string;
  isComplete: boolean;
  userId: string; // Backend akan mengabaikan ini saat POST/PUT, tapi mengirimkannya saat GET
}
@Injectable({
  providedIn: 'root'
})
export class Todo {
  private apiUrl = `${environment.apiUrl}/TodoItems`; // -> .../api/TodoItems
  constructor(private http: HttpClient) { }
  // GET /api/TodoItems (Hanya milik user ini, berkat token)
  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl);
  }
  // POST /api/TodoItems
  addTodo(todoData: { name: string }): Observable<Todo> {
    // Backend mengharapkan { "name": "..." }
    // Backend akan otomatis mengisi Id, IsComplete=false, dan UserId dari token
    return this.http.post<Todo>(this.apiUrl, todoData);
  }
  // PUT /api/TodoItems/{id}
  updateTodo(id: number, todoData: Todo): Observable<any> {
    // Kita kirim seluruh objek yang diperbarui
    return this.http.put(`${this.apiUrl}/${id}`, todoData);
  }
  // DELETE /api/TodoItems/{id}
  deleteTodo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}