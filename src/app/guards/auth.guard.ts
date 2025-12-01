import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SqliteServices } from '../services/sqlite-services';

export const authGuard: CanActivateFn = async (route, state) => {
  // -----------------------------
  //  Guard: verificar autenticación
  // -----------------------------
  const authService = inject(SqliteServices);
  const router = inject(Router);
  console.debug('authGuard: start for', state?.url);
  const t0 = performance ? performance.now() : Date.now();
  const user = await authService.getCurrentUser();
  const t1 = performance ? performance.now() : Date.now();
  console.debug('authGuard: getCurrentUser time(ms):', (t1 - t0).toFixed(2), 'user=', !!user);

  if (!user) {
    console.debug('authGuard: no user, redirecting to /login');
    // Evita retornar antes de que el router cambie
    setTimeout(() => router.navigate(['/login']), 0);
    return false;
  }

  console.debug('authGuard: allow navigation to', state?.url);
  return true;
};
