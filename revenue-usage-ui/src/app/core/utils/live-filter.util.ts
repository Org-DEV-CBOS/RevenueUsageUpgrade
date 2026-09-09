import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

const SEARCH_DEBOUNCE_MS = 300;

/** Reloads a list as the user types or changes a filter, with no Apply click. */
export function bindLiveFilter(
  destroyRef: DestroyRef,
  onChange: () => void,
  ...controls: AbstractControl[]
): void {
  for (const control of controls) {
    control.valueChanges
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed(destroyRef))
      .subscribe(() => onChange());
  }
}
