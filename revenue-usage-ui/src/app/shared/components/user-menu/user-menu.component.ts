import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="user-menu">
      <button type="button" class="user-menu-trigger" (click)="toggle()" [attr.aria-expanded]="open()">
        <span class="user-menu-avatar" aria-hidden="true">{{ initials() }}</span>
        <span class="user-menu-meta">
          <span class="user-menu-name">{{ auth.displayName() || '—' }}</span>
          @if (auth.roleLabelKey()) {
            <span class="user-menu-role">{{ auth.roleLabelKey() | translate }}</span>
          }
        </span>
        <span class="user-menu-caret" aria-hidden="true">{{ open() ? '▴' : '▾' }}</span>
      </button>
      @if (open()) {
        <div class="user-menu-dropdown">
          <button type="button" class="user-menu-item" (click)="logout()">
            {{ 'AUTH.LOGOUT' | translate }}
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
