import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageToggleComponent } from '../../shared/components/language-toggle/language-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [TranslatePipe, LanguageToggleComponent],
  template: `
    <div class="login-page">
      <app-language-toggle class="login-lang" />
      <div class="login-card">
        <div class="login-header">
          <img class="login-logo" src="/cbos-logo-white.png" alt="CBOS" />
          <h1>{{ 'APP.TITLE' | translate }}</h1>
          <!-- <p>{{ 'APP.SUBTITLE' | translate }}</p> -->
        </div>

        <!-- <p class="login-hint">{{ 'AUTH.SSO_HINT' | translate }}</p> -->

        <button type="button" class="sso-btn" [disabled]="loading()" (click)="login()">
          {{ loading() ? ('COMMON.LOADING' | translate) : ('AUTH.SSO' | translate) }}
        </button>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  readonly loading = signal(false);

  async ngOnInit(): Promise<void> {
    await this.auth.configure();
  }

  login(): void {
    this.loading.set(true);
    this.auth.login();
  }
}
