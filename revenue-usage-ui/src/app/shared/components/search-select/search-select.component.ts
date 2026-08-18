import {
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

export interface SearchSelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-search-select',
  standalone: true,
  imports: [TranslatePipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="search-select" [class.open]="open()">
      <input
        type="text"
        [value]="query()"
        [placeholder]="placeholder() || ('COMMON.SEARCH' | translate)"
        [disabled]="disabled()"
        autocomplete="off"
        (focus)="openPanel()"
        (input)="onQuery($event)"
      />
      @if (open()) {
        <ul class="search-select-menu">
          @for (option of filtered(); track option.value) {
            <li
              [class.active]="option.value === selected()"
              (mousedown)="select(option, $event)"
            >
              {{ option.label }}
            </li>
          } @empty {
            <li class="empty">{{ 'COMMON.NO_DATA' | translate }}</li>
          }
        </ul>
      }
    </div>
  `,
})
export class SearchSelectComponent implements ControlValueAccessor {
  readonly options = input<SearchSelectOption[]>([]);
  readonly placeholder = input('');

  readonly open = signal(false);
  readonly query = signal('');
  readonly disabled = signal(false);
  readonly selected = signal('');

  private readonly host = inject(ElementRef<HTMLElement>);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  readonly filtered = computed(() => {
    const term = this.query().trim().toLowerCase();
    const options = this.options();
    if (!term) {
      return options;
    }

    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(term) || option.value.toLowerCase().includes(term),
    );
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        return;
      }

      const match = this.options().find((option) => option.value === this.selected());
      this.query.set(match?.label ?? '');
    });
  }

  writeValue(value: string | null): void {
    this.selected.set(value ?? '');
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

  openPanel(): void {
    if (!this.disabled()) {
      this.open.set(true);
    }
  }

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.open.set(true);
    if (this.selected()) {
      this.selected.set('');
      this.onChange('');
    }
  }

  select(option: SearchSelectOption, event: MouseEvent): void {
    event.preventDefault();
    this.selected.set(option.value);
    this.query.set(option.label);
    this.open.set(false);
    this.onChange(option.value);
    this.onTouched();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
      this.onTouched();
    }
  }
}
