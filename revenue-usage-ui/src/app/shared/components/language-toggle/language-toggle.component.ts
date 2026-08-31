import { Component, inject, input } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  template: `
    <button type="button" class="lang-toggle" [class.lang-toggle-light]="variant() === 'light'" (click)="toggle()">
      {{ label }}
    </button>
  `,
})
export class LanguageToggleComponent {
  readonly variant = input<'dark' | 'light'>('dark');
  private readonly languageService = inject(LanguageService);

  get label(): string {
    return this.languageService.currentLanguage() === 'ar' ? 'EN' : 'AR';
  }

  toggle(): void {
    this.languageService.toggleLanguage();
  }
}
