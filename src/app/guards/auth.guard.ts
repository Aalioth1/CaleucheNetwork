import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  // -----------------------------
  //  Guard: verificar autenticación
  // -----------------------------
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();

  if (!user) {
    // Evita retornar antes de que el router cambie
    setTimeout(() => router.navigate(['/login']), 0);
    return false;
  }

  return true;
};
