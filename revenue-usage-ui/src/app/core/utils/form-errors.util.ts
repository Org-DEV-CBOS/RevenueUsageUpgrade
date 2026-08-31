import { AbstractControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

export function getFieldError(
  form: FormGroup,
  field: string,
  translate: TranslateService,
): string | null {
  const control = form.get(field);
  if (!control || !control.touched || !control.errors) {
    return null;
  }

  const errors = control.errors;
  if (errors['required']) {
    return translate.instant('COMMON.REQUIRED');
  }
  if (errors['min']) {
    return translate.instant('VALIDATION.MIN_VALUE', { min: errors['min'].min });
  }
  if (errors['duplicateAccountNumber']) {
    return translate.instant('ACCOUNTS.DUPLICATE_NUMBER');
  }
  if (errors['currencyTaken']) {
    return translate.instant('ACCOUNTS.CURRENCY_TAKEN');
  }

  return translate.instant('COMMON.ERROR');
}

export function markFormTouched(form: FormGroup): void {
  Object.values(form.controls).forEach((control: AbstractControl) => {
    control.markAsTouched();
    control.updateValueAndValidity();
  });
}
