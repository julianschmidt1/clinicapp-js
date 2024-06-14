import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  
  const storedUser = localStorage.getItem('user');

  if (!storedUser) {
    router.navigateByUrl('');
  }

  return Boolean(storedUser);
};