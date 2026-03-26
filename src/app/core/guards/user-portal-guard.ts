import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const userPortalGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.ensureSessionLoaded();

  if (auth.isLoggedIn()) {
    const role = auth.getRole();
    if (role === 'Owner') {
      await router.navigate(['/owner']);
      return false;
    }
    if (role === 'Admin') {
      await router.navigate(['/admin']);
      return false;
    }
  }

  return true;
};
