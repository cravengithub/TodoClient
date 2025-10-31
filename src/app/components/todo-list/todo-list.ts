import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Todo } from '../../services/todo'; // Impor service & interface
@Component({
  selector: 'app-todo-list',
  standalone: true,
  // Pastikan imports ini ada
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.css'
})
export class TodoList implements OnInit {
  // State untuk daftar todo
  todos: Todo[] = [];
  // State untuk form tambah baru
  name: string = '';
  // State untuk UI
  isLoading: boolean = true;
  errorMessage: string = '';
  constructor(
    private todo: Todo,
    private auth: Auth // Untuk tombol logout
  ) { }
  ngOnInit(): void {
    this.loaDTOdos();
  }
  // === METODE DATA ===
  loaDTOdos() {
    this.isLoading = true;
    this.errorMessage = '';
    this.todo.getTodos().subscribe({
      next: (data) => {
        this.todos = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Gagal memuat daftar todo. Silakan coba lagi.';
        this.isLoading = false;
      }
    });
  }
  addTodo() {
    if (!this.name.trim()) return; // Jangan tambah jika kosong
    this.errorMessage = '';
    const todoData = { name: this.name.trim() };
    this.todo.addTodo(todoData).subscribe({
      next: (newTodo) => {
        // Tambahkan ke UI secara instan
        this.todos.push(newTodo);
        this.name = ''; // Kosongkan form
      },
      error: (err) => {
        this.errorMessage = 'Gagal menambahkan todo.';
      }
    });
  }
  // Update saat checkbox di-klik
  toggleComplete(todo: Todo) {
    // 1. Update state UI (optimistic)
    todo.isComplete = !todo.isComplete;
    // 2. Kirim ke API
    this.todo.updateTodo(todo.id, todo).subscribe({
      next: () => {
        // Sukses, tidak perlu lakukan apa-apa
      },
      error: (err) => {
        // Gagal, kembalikan state UI ke semula
        todo.isComplete = !todo.isComplete;
        this.errorMessage = 'Gagal memperbarui todo.';
      }
    });
  }
  deleteTodo(id: number) {
    if (!confirm('Apakah Anda yakin ingin menghapus todo ini?')) return;
    this.errorMessage = '';
    this.todo.deleteTodo(id).subscribe({
      next: () => {
        // Hapus dari UI secara instan
        this.todos = this.todos.filter(t => t.id !== id);
      },
      error: (err) => {
        this.errorMessage = 'Gagal menghapus todo.';
      }
    });
  }
  // === METODE BANTU ===
  logout() {
    this.auth.logout();
  }
}