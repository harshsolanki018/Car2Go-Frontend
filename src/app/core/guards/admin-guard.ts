import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.ensureSessionLoaded();

  if (!auth.isLoggedIn()) {
    await router.navigate(['/login']);
    return false;
  }

  if (auth.getRole() !== 'Admin') {
    await router.navigate(['/']);
    return false;
  }

  return true;
};
