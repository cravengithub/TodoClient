import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { TodoList } from './components/todo-list/todo-list';
import { authGuard } from './guards/auth-guard'; // <-- Impor guard fungsional
import { Profile } from './components/profile/profile'; // <-- Impor komponen profil

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    {
        path: 'todos',
        component: TodoList,
        canActivate: [authGuard] // <-- Gunakan guard fungsional di sini
    },
    //  === TAMBAHAN BARU ===
    {
        path: 'profile',
        component: Profile,
        canActivate: [authGuard] // <-- Lindungi juga!
    },
    // === BATAS TAMBAHAN ===
    { path: '', redirectTo: '/todos', pathMatch: 'full' },
    { path: '**', redirectTo: '/todos' } // Pengaman

];
