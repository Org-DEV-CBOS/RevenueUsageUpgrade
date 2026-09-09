import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-search-field',
  standalone: true,
  imports: [TranslatePipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchFieldComponent),
      multi: true,
    },
  ],
  template: `
    <div class="search-field">
      <input
        type="search"
        [value]="value()"
        [placeholder]="placeholder() || ('COMMON.SEARCH' | translate)"
        [disabled]="disabled()"
        autocomplete="off"
        (input)="onInput($event)"
      />
      @if (value()) {
        <button
          type="button"
          class="search-field-clear"
          [attr.aria-label]="'COMMON.CLEAR' | translate"
          [title]="'COMMON.CLEAR' | translate"
          [disabled]="disabled()"
          (click)="clear()"
        >
          &times;
        </button>
      }
    </div>
  `,
})
export class SearchFieldComponent implements ControlValueAccessor {
  readonly placeholder = input('');

  readonly value = signal('');
  readonly disabled = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
  }

  clear(): void {
    if (this.disabled()) {
      return;
    }

    this.value.set('');
    this.onChange('');
    this.onTouched();
  }
}
