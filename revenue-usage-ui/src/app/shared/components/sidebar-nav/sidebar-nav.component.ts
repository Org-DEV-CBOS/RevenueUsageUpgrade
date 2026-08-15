import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';

export interface NavItem {
  labelKey: string;
  icon: string;
  route: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <nav class="sidebar-nav">
      @for (item of items; track item.route) {
        @if (item.children?.length) {
          <div class="nav-group">
            <button type="button" class="nav-item" (click)="toggleGroup(item.route)">
              <span class="nav-icon">{{ item.icon }}</span>
              <span>{{ item.labelKey | translate }}</span>
              <span class="nav-chevron">{{ openGroups.has(item.route) ? '▾' : '▸' }}</span>
            </button>
            @if (openGroups.has(item.route)) {
              <div class="nav-children">
                @for (child of item.children; track child.route) {
                  <a [routerLink]="child.route" routerLinkActive="active" class="nav-child">
                    {{ child.labelKey | translate }}
                  </a>
                }
              </div>
            }
          </div>
        } @else {
          <a [routerLink]="item.route" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">{{ item.icon }}</span>
            <span>{{ item.labelKey | translate }}</span>
          </a>
        }
      }

      <div class="sidebar-footer">
        <button type="button" class="nav-item" (click)="toggleLanguage()">
          <span class="nav-icon">🌐</span>
          <span>{{ languageLabel }}</span>
        </button>
      </div>
    </nav>
  `,
})
export class SidebarNavComponent {
  items: NavItem[] = [];
  openGroups = new Set<string>();

  private readonly languageService = inject(LanguageService);

  get languageLabel(): string {
    return this.languageService.currentLanguage() === 'ar' ? 'English' : 'العربية';
  }

  toggleGroup(route: string): void {
    if (this.openGroups.has(route)) {
      this.openGroups.delete(route);
    } else {
      this.openGroups.add(route);
    }
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }
}
