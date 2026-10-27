import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.configure();

  if (auth.isLoggedIn()) return true;

  return router.createUrlTree(['/login']);
};

export const userAreaGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.configure();

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (auth.needsRoleSelection()) {
    return router.createUrlTree(['/select-role']);
  }

  if (auth.isAdmin()) {
    return router.createUrlTree(['/admin/dashboard']);
  }

  return true;
};

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.configure();

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (auth.needsRoleSelection()) {
    return router.createUrlTree(['/select-role']);
  }

  if (!auth.isAdmin()) {
    return router.createUrlTree([auth.defaultPath()]);
  }

  return true;
};

export const selectRoleGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.configure();

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (!auth.hasMultipleRoles()) {
    return router.createUrlTree([auth.defaultPath()]);
  }

  return true;
};

export const homeRedirectGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.configure();

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  return router.createUrlTree([auth.defaultPath()]);
};

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.configure();

  if (!auth.isLoggedIn()) return true;

  return router.createUrlTree([auth.defaultPath()]);
};
