import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { pathForRole } from '../../core/auth/roles';
import { LanguageToggleComponent } from '../../shared/components/language-toggle/language-toggle.component';

@Component({
  selector: 'app-select-role',
  standalone: true,
  imports: [TranslatePipe, LanguageToggleComponent],
  template: `
    <div class="login-page">
      <app-language-toggle class="login-lang" />
      <div class="login-card role-card">
        <div class="login-header">
          <img class="login-logo" src="cbos-logo-white.png" alt="CBOS" />
          <h1>{{ 'AUTH.SELECT_ROLE' | translate }}</h1>
        </div>
        <p class="login-hint">{{ 'AUTH.SELECT_ROLE_HINT' | translate }}</p>

        <div class="role-choice-list" role="list">
          @for (role of auth.availableRoles(); track role) {
            <button
              type="button"
              class="role-choice"
              [class.active]="role === auth.activeRoleId()"
              (click)="choose(role)"
            >
              <span class="role-choice-copy">
                <strong>{{ roleCaption(role) | translate }}</strong>
                <small>{{ 'AUTH.CONTINUE_AS' | translate }}</small>
              </span>
              <span class="role-choice-arrow" aria-hidden="true">→</span>
            </button>
          }
        </div>

        <button type="button" class="role-signout" (click)="logout()">
          {{ 'AUTH.LOGOUT' | translate }}
        </button>
      </div>
    </div>
  `,
})
export class SelectRoleComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  roleCaption(roleId: string): string {
    return this.auth.labelKeyFor(roleId) || roleId;
  }

  choose(roleId: string): void {
    this.auth.setActiveRole(roleId);
    void this.router.navigateByUrl(pathForRole(roleId));
  }

  logout(): void {
    this.auth.logout();
  }
}
