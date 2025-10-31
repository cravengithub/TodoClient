import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Gunakan inject() untuk mendapatkan service
  // avoid shadowing the Auth class name — use a lowercase instance
  const auth = inject(Auth);
  const token = auth.getToken();

  if (token) {
    // Clone request dan tambahkan header
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
