import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

let translator: TranslateService | null = null;

/**
 * Registered once at bootstrap. These messages are shown to users in both languages,
 * but `extractHttpError` is a plain function called from error callbacks, which are
 * not an injection context.
 */
export function useErrorTranslations(service: TranslateService): void {
  translator = service;
}

function message(key: string): string {
  return translator?.instant(key) ?? key;
}

export function extractHttpError(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) {
    return message('ERRORS.GENERIC');
  }

  if (err.status === 0) {
    return message('ERRORS.OFFLINE');
  }

  // A message from the API describes a business rule the user can act on
  // ("Insufficient account balance"), so it beats anything generic.
  const body = err.error;
  if (body && typeof body === 'object' && 'message' in body && body.message) {
    return String(body.message);
  }

  if (typeof body === 'string' && body) {
    return body;
  }

  if (err.status === 401) {
    return message('ERRORS.SESSION_EXPIRED');
  }

  if (err.status === 403) {
    return message('ERRORS.FORBIDDEN');
  }

  if (err.status === 404) {
    return message('ERRORS.NOT_FOUND');
  }

  if (err.status >= 500) {
    return message('ERRORS.SERVER');
  }

  return message('ERRORS.GENERIC');
}
