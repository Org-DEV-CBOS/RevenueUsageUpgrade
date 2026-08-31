import { Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const moneyFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function parseMoney(value: string): number | null {
  const cleaned = value.replace(/,/g, '').trim();
  if (!cleaned) {
    return null;
  }

  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : null;
}

function formatMoney(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return '';
  }

  return moneyFormatter.format(value);
}

@Component({
  selector: 'app-money-input',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MoneyInputComponent),
      multi: true,
    },
  ],
  template: `
    <input
      type="text"
      inputmode="decimal"
      class="money-input"
      [value]="display()"
      [disabled]="disabled()"
      (input)="onInput($event)"
      (focus)="onFocus()"
      (blur)="onBlur()"
    />
  `,
})
export class MoneyInputComponent implements ControlValueAccessor {
  readonly display = signal('');
  readonly disabled = signal(false);

  private focused = false;
  private numericValue: number | null = null;
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    this.numericValue = value === null || value === undefined ? null : Number(value);
    if (!this.focused) {
      this.display.set(formatMoney(this.numericValue));
    }
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onFocus(): void {
    this.focused = true;
    if (this.numericValue !== null && Number.isFinite(this.numericValue)) {
      this.display.set(String(this.numericValue));
    }
  }

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.display.set(raw);
    const parsed = parseMoney(raw);
    this.numericValue = parsed;
    this.onChange(parsed);
  }

  onBlur(): void {
    this.focused = false;
    const parsed = parseMoney(this.display());
    this.numericValue = parsed;
    this.display.set(formatMoney(parsed));
    this.onChange(parsed);
    this.onTouched();
  }
}
