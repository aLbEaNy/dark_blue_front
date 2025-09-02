import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLogin()) {
    return true; // ✅ usuario autenticado
  } else {
    router.navigate(['/login']); // 🚫 redirigir si no está logueado
    return false;
  }
};
