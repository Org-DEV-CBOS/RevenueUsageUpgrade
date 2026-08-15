import { HttpErrorResponse } from '@angular/common/http';

export function extractHttpError(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) {
    return 'COMMON.ERROR';
  }

  if (err.status === 0) {
    return 'Cannot connect to API. Start RevenuUsage.API (dotnet run) on http://localhost:5035';
  }

  const body = err.error;
  if (body && typeof body === 'object' && 'message' in body && body.message) {
    return String(body.message);
  }

  if (typeof body === 'string' && body) {
    return body;
  }

  return `HTTP ${err.status}: ${err.statusText || 'Request failed'}`;
}
