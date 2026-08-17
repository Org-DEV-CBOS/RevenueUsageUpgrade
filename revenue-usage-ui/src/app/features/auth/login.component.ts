import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">R</div>
          <h1>{{ 'APP.TITLE' | translate }}</h1>
          <p>{{ 'APP.SUBTITLE' | translate }}</p>
        </div>

        <p>{{ 'AUTH.SSO_HINT' | translate }}</p>

        <button type="button" class="sso-btn" [disabled]="loading()" (click)="login()">
          {{ loading() ? ('COMMON.LOADING' | translate) : ('AUTH.SSO' | translate) }}
        </button>

        <button type="button" class="lang-toggle" (click)="toggleLanguage()">
          {{ languageLabel }}
        </button>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly languageService = inject(LanguageService);
  readonly loading = signal(false);

  get languageLabel(): string {
    return this.languageService.currentLanguage() === 'ar' ? 'English' : 'العربية';
  }

  async ngOnInit(): Promise<void> {
    await this.auth.configure();
  }

  login(): void {
    this.loading.set(true);
    this.auth.login();
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }
}
