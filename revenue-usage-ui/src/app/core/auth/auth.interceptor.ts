import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest =
    req.url.startsWith(environment.apiUrl) ||
    req.url.startsWith('/api') ||
    req.url.includes('/HealthCheck');

  if (!isApiRequest) {
    return next(req);
  }

  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getAccessToken();
  const activeRoleId = auth.activeRoleId();

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (activeRoleId) headers['X-Active-Role-Id'] = activeRoleId;

  const cloned = Object.keys(headers).length ? req.clone({ setHeaders: headers }) : req;

  return next(cloned).pipe(
    catchError((err) => {
      if (err.status === 401 && !environment.bypassAuth) {
        auth.clearAuthContext();
        void router.navigate(['/login'], { queryParams: { session: 'expired' } });
      }
      return throwError(() => err);
    }),
  );
};
