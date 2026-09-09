import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="user-menu">
      <button
        type="button"
        class="user-menu-trigger"
        (click)="toggle()"
        [attr.aria-expanded]="open()"
        [attr.aria-label]="auth.displayName() || ('AUTH.ACCOUNT' | translate)"
      >
        <span class="user-menu-avatar" aria-hidden="true">{{ initials() }}</span>
        <span class="user-menu-meta">
          <span class="user-menu-name">{{ auth.displayName() || '—' }}</span>
          @if (auth.roleLabelKey()) {
            <span class="user-menu-role">{{ auth.roleLabelKey() | translate }}</span>
          }
        </span>
        <span class="user-menu-caret" [class.open]="open()" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
            <path
              d="M5 7.5 10 12.5 15 7.5"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </button>
      @if (open()) {
        <div class="user-menu-dropdown" role="menu">
          <div class="user-menu-account">
            <span class="user-menu-avatar compact" aria-hidden="true">{{ initials() }}</span>
            <div class="user-menu-account-copy">
              <strong>{{ auth.displayName() || '—' }}</strong>
              @if (auth.roleLabelKey()) {
                <span>{{ auth.roleLabelKey() | translate }}</span>
              }
            </div>
          </div>
          <div class="user-menu-divider" role="separator"></div>
          <button type="button" class="user-menu-item user-menu-logout" role="menuitem" (click)="logout()">
            <span class="user-menu-logout-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M16 17 21 12 16 7"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M21 12H9"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span class="user-menu-logout-copy">
              <strong>{{ 'AUTH.LOGOUT' | translate }}</strong>
              <small>{{ 'AUTH.LOGOUT_HINT' | translate }}</small>
            </span>
          </button>
        </div>
      }
    </div>
  `,
})
export class UserMenuComponent {
  readonly auth = inject(AuthService);
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly open = signal(false);

  initials(): string {
    const name = this.auth.displayName().trim();
    if (!name) return '?';
    const parts = name.split(/\s+/).filter(Boolean);
    const letters = parts.slice(0, 2).map((part) => part[0]);
    return letters.join('').toUpperCase();
  }

  toggle(): void {
    this.open.update((value) => !value);
  }

  logout(): void {
    this.open.set(false);
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }
}
