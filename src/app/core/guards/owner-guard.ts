import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const ownerGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.ensureSessionLoaded();

  if (!auth.isLoggedIn() || auth.getRole() !== 'Owner') {
    await router.navigate(['/owner-login']);
    return false;
  }

  return true;
};
