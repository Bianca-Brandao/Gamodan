import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.isLogado()) {
    return true;
  }

  router.navigate(['/admin'], { queryParams: { returnUrl: state.url } });
  return false;
};